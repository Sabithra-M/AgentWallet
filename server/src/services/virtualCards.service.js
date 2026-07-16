import * as virtualCardsRepository from '../repositories/virtualCards.repository.js'
import * as merchantsRepository from '../repositories/merchants.repository.js'
import * as auditLogsRepository from '../repositories/auditLogs.repository.js'
import * as paymentTimelineEventsRepository from '../repositories/paymentTimelineEvents.repository.js'
import * as alertsService from './alerts.service.js'
import { pool } from '../db/index.js'
import { fail } from '../utils/httpError.js'

const CARD_LIFETIME_MS = 15 * 60 * 1000


function assertOwnership(card, userId) {
  if (card.user_id !== userId) fail(403, 'You do not have access to this virtual card')
}

function maskCardNumber(cardNumber) {
  return `•••• •••• •••• ${cardNumber.slice(-4)}`
}

// The card's full number and CVV must never be exposed by default — every
// path that returns a card to the client goes through this first. The one
// exception is revealCard(), used only for the explicit "reveal" action.
function sanitizeCard(card) {
  const { cvv, card_number, ...safe } = card
  return { ...safe, card_number: maskCardNumber(card_number) }
}

function randomDigits(length) {
  let digits = ''
  for (let i = 0; i < length; i++) {
    digits += Math.floor(Math.random() * 10)
  }
  return digits
}

// Not a real card issuer — this is a locally-generated, simulated 16-digit
// number and 3-digit CVV purely for the demo flow. expiryMonth/expiryYear are
// cosmetic, matching what a normal card looks like; expiresAt is the real
// 15-minute lifetime that actually governs usability.
function buildCardFields(wallet) {
  const now = new Date()
  return {
    cardNumber: randomDigits(16),
    cardHolder: wallet.name,
    cvv: randomDigits(3),
    expiryMonth: now.getMonth() + 1,
    expiryYear: now.getFullYear() + 3,
    expiresAt: new Date(now.getTime() + CARD_LIFETIME_MS),
  }
}

// Called from paymentRequests.service.js's createAndEvaluate(), inside the
// same transaction as the approval itself — a card should never exist for a
// payment request that didn't actually commit as approved.
export async function generateForApprovedPayment({ userId, paymentRequest, wallet, merchant }, client = pool) {
  try {
    const fields = buildCardFields(wallet)
    const card = await virtualCardsRepository.create(
      {
        userId,
        paymentRequestId: paymentRequest.id,
        walletId: wallet.id,
        merchantId: merchant.id,
        cardNumber: fields.cardNumber,
        cardHolder: fields.cardHolder,
        cvv: fields.cvv,
        expiryMonth: fields.expiryMonth,
        expiryYear: fields.expiryYear,
        spendingLimit: paymentRequest.amount,
        currency: paymentRequest.currency ?? 'INR',
        expiresAt: fields.expiresAt,
      },
      client,
    )
    return sanitizeCard(card)
  } catch (error) {
    throw error
  }
}

// Lazily flips an active card to 'expired' the first time anything looks at
// it past its 15-minute lifetime — no background job needed.
async function ensureNotExpired(card, client = pool) {
  if (card.status === 'active' && new Date(card.expires_at).getTime() < Date.now()) {
    const expired = await virtualCardsRepository.markExpired(card.id, client)
    return expired ?? card
  }
  return card
}

export async function findAll(userId) {
  try {
    const cards = await virtualCardsRepository.findAllByUserId(userId)
    const results = []
    for (const card of cards) {
      results.push(sanitizeCard(await ensureNotExpired(card)))
    }
    return results
  } catch (error) {
    throw error
  }
}

export async function findById(id, userId) {
  try {
    const card = await virtualCardsRepository.findById(id)
    if (!card) return null
    assertOwnership(card, userId)
    return sanitizeCard(await ensureNotExpired(card))
  } catch (error) {
    throw error
  }
}

// The one place cvv/full card number are ever returned — used only for the
// explicit "reveal" action, never as part of a list/detail response.
export async function revealCard(id, userId) {
  try {
    const card = await virtualCardsRepository.findById(id)
    if (!card) return null
    assertOwnership(card, userId)
    return { cardNumber: card.card_number, cvv: card.cvv }
  } catch (error) {
    throw error
  }
}

// The 5 security rules, checked in the order the spec lists them. Every
// outcome — success or a specific failure reason — writes both an audit log
// entry and an alert, never just one or the other. The transaction commits
// exactly once regardless of outcome; alerts fire only after that commit is
// safely done, so a failed alert can never look like it undid a real result.
export async function useCard(id, userId, { merchant, amount }) {
  const client = await pool.connect()
  let failureReason = null
  let resultCard = null

  try {
    await client.query('BEGIN')

    const card = await virtualCardsRepository.findByIdForUpdate(id, client)
    if (!card) fail(404, 'Virtual card not found')
    assertOwnership(card, userId)

    if (card.status === 'active' && new Date(card.expires_at).getTime() < Date.now()) {
      await virtualCardsRepository.markExpired(id, client)
      card.status = 'expired'
    }

    if (card.status === 'expired') {
      failureReason = 'Card has expired'
    } else if (card.status === 'used') {
      failureReason = 'Card has already been used'
    } else {
      const merchantName = typeof merchant === 'string' ? merchant.trim() : ''
      const lockedMerchant = await merchantsRepository.findById(card.merchant_id)
      if (!merchantName || lockedMerchant?.name.toLowerCase() !== merchantName.toLowerCase()) {
        failureReason = 'Merchant mismatch'
      } else if (!Number.isFinite(Number(amount)) || Number(amount) !== Number(card.spending_limit)) {
        failureReason = 'Amount mismatch'
      }
    }

    if (failureReason) {
      await auditLogsRepository.create(
        {
          userId,
          action: 'virtual_card.use_failed',
          entityType: 'virtual_card',
          entityId: id,
          metadata: { reason: failureReason, merchant, amount },
        },
        client,
      )
      resultCard = card
    } else {
      resultCard = await virtualCardsRepository.markUsed(id, client)
      await auditLogsRepository.create(
        {
          userId,
          action: 'virtual_card.used',
          entityType: 'virtual_card',
          entityId: id,
          metadata: { merchant, amount },
        },
        client,
      )
      await paymentTimelineEventsRepository.create(
        { paymentRequestId: card.payment_request_id, eventType: 'card_used', message: 'Virtual Card Used' },
        client,
      )
      await paymentTimelineEventsRepository.create(
        { paymentRequestId: card.payment_request_id, eventType: 'payment_completed', message: 'Payment Completed' },
        client,
      )
    }

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    throw error
  } finally {
    client.release()
  }

  await alertsService.createForVirtualCardEvent(userId, {
    card: resultCard,
    outcome: failureReason ? 'failed' : 'success',
    reason: failureReason,
  })

  if (failureReason) fail(422, failureReason)
  return sanitizeCard(resultCard)
}
