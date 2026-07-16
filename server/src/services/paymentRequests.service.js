import * as paymentRequestsRepository from '../repositories/paymentRequests.repository.js'
import * as walletsRepository from '../repositories/wallets.repository.js'
import * as merchantsRepository from '../repositories/merchants.repository.js'
import * as walletPoliciesRepository from '../repositories/walletPolicies.repository.js'
import * as aiWalletPoliciesRepository from '../repositories/aiWalletPolicies.repository.js'
import * as paymentApprovalsRepository from '../repositories/paymentApprovals.repository.js'
import * as paymentTransactionsRepository from '../repositories/paymentTransactions.repository.js'
import * as auditLogsRepository from '../repositories/auditLogs.repository.js'
import * as paymentTimelineEventsRepository from '../repositories/paymentTimelineEvents.repository.js'
import * as notificationsService from './notifications.service.js'
import * as policyEvaluationService from './policyEvaluation.service.js'
import * as alertsService from './alerts.service.js'
import * as virtualCardsService from './virtualCards.service.js'
import * as riskEngineService from './riskEngine.service.js'
import { pool } from '../db/index.js'
import { fail } from '../utils/httpError.js'

const ACTIVE_REQUEST_STATUSES = ['pending', 'approved']


function isSameMonth(dateA, dateB) {
  return dateA.getFullYear() === dateB.getFullYear() && dateA.getMonth() === dateB.getMonth()
}

// Shared by both creation paths (manual form and AI Assistant) so every
// payment request gets scored the same way regardless of where it came from.
// Reads the AI Wallet policy (if any) even for the manual flow — since
// PaymentRequest.jsx only ever offers AI Wallets, this is the same policy the
// automatic engine would see, and "no policy configured" is a genuine risk
// signal either way.
async function computeRisk({ userId, wallet, merchant, category, amount, client }) {
  const policy = await aiWalletPoliciesRepository.findByWalletId(wallet.id)
  const priorApprovedCountForMerchant = await paymentRequestsRepository.countApprovedByMerchant(
    userId,
    merchant.id,
    client,
  )
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const recentBlockedCount = await paymentRequestsRepository.countBlockedSince(wallet.id, oneDayAgo, client)

  return riskEngineService.calculateRisk({
    wallet,
    policy,
    merchant,
    category,
    amount,
    priorApprovedCountForMerchant,
    recentBlockedCount,
  })
}

async function enforceWalletPolicies({ wallet, merchant, amount }) {
  const policies = await walletPoliciesRepository.findAllByWalletId(wallet.id)
  const activePolicies = policies.filter((policy) => policy.is_active)
  if (activePolicies.length === 0) return

  const now = new Date()

  for (const policy of activePolicies) {
    switch (policy.policy_type) {
      case 'per_transaction_limit': {
        if (policy.threshold_amount !== null && amount > Number(policy.threshold_amount)) {
          fail(403, `Amount exceeds the per-transaction limit of ${policy.threshold_amount} for this wallet`)
        }
        break
      }
      case 'monthly_limit': {
        if (policy.threshold_amount === null) break
        const existingRequests = await paymentRequestsRepository.findAllByWalletId(wallet.id)
        const monthToDate = existingRequests
          .filter((r) => ACTIVE_REQUEST_STATUSES.includes(r.status))
          .filter((r) => isSameMonth(new Date(r.created_at), now))
          .reduce((sum, r) => sum + Number(r.amount), 0)
        if (monthToDate + amount > Number(policy.threshold_amount)) {
          fail(403, `Amount would exceed the monthly limit of ${policy.threshold_amount} for this wallet`)
        }
        break
      }
      case 'merchant_blocklist': {
        const blockedMerchantIds = policy.config?.merchantIds ?? []
        if (blockedMerchantIds.includes(merchant.id)) {
          fail(403, 'This merchant is blocked by wallet policy')
        }
        break
      }
      case 'category_restriction': {
        const blockedCategories = policy.config?.blockedCategories ?? []
        if (merchant.category && blockedCategories.includes(merchant.category)) {
          fail(403, `Merchant category "${merchant.category}" is blocked by wallet policy`)
        }
        break
      }
      default:
        break
    }
  }
}

export async function create(userId, data) {
  try {
    const wallet = await walletsRepository.findById(data.walletId)
    if (!wallet) fail(404, 'Wallet not found')

    const merchant = await merchantsRepository.findById(data.merchantId)
    if (!merchant) fail(404, 'Merchant not found')

    if (wallet.user_id !== userId) fail(403, 'You do not own this wallet')
    if (wallet.status !== 'active') fail(403, 'Wallet is not active')

    const amount = Number(data.amount)
    if (Number(wallet.balance) < amount) fail(403, 'Insufficient wallet balance')

    await enforceWalletPolicies({ wallet, merchant, amount })

    const risk = await computeRisk({ userId, wallet, merchant, category: data.category, amount })

    const paymentRequest = await paymentRequestsRepository.create({
      ...data,
      requestedBy: userId,
      riskLevel: risk.level,
      riskScore: risk.score,
      riskFactors: risk.factors,
    })

    await paymentTimelineEventsRepository.create({
      paymentRequestId: paymentRequest.id,
      eventType: 'created',
      message: 'Payment Request Created',
    })

    await notificationsService.notify(
      userId,
      'Payment approval required',
      `${merchant.name} payment of ${amount} from ${wallet.name} needs your approval`,
      { walletId: wallet.id },
    )
    return paymentRequest
  } catch (error) {
    throw error
  }
}

// The AI Assistant has no wallet UUID to work with — it only knows the user
// asked to spend money. This picks the user's most recently created AI
// Wallet as the target. There's no UI for the user to name a specific wallet
// in chat yet, so "newest AI Wallet" is the simplest reasonable default until
// that's built. Deliberately NOT filtered by active/expired status here — the
// Policy Evaluation Engine's own rules 1 and 2 are what decide that, so an
// inactive or expired wallet still gets picked and correctly blocked with a
// specific reason, rather than a generic "no AI wallet" message.
async function resolveAssistantWallet(userId) {
  const wallets = await walletsRepository.findAllByUserId(userId)
  const aiWallets = wallets
    .filter((wallet) => wallet.category === 'ai')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return aiWallets[0] ?? null
}

// Runs the isolated Policy Evaluation Engine inside a transaction: locks the
// wallet, gathers everything the engine needs to decide (policy, daily/monthly
// spend so far, Main Wallet balance), records the verdict on the request row,
// and — only when approved — debits the AI Wallet's remaining budget and
// writes the matching debit transaction. Nothing is ever deducted on a block.
async function createAndEvaluate(userId, data) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const wallet = await walletsRepository.findByIdForUpdate(data.walletId, client)
    if (!wallet) fail(404, 'Wallet not found')
    if (wallet.user_id !== userId) fail(403, 'You do not own this wallet')

    const merchant = await merchantsRepository.findById(data.merchantId)
    if (!merchant) fail(404, 'Merchant not found')

    const mainWallet = await walletsRepository.findMainByUserIdForUpdate(userId, client)
    const policy = await aiWalletPoliciesRepository.findByWalletIdForUpdate(wallet.id, client)

    const amount = Number(data.amount)
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const dailySpent = await paymentRequestsRepository.sumApprovedAmountSince(wallet.id, startOfDay, client)
    const monthlySpent = await paymentRequestsRepository.sumApprovedAmountSince(wallet.id, startOfMonth, client)

    const risk = await computeRisk({ userId, wallet, merchant, category: data.category, amount, client })

    const decision = policyEvaluationService.evaluate({
      wallet,
      policy,
      merchant,
      category: data.category,
      amount,
      dailySpent,
      monthlySpent,
      mainWalletBalance: mainWallet ? Number(mainWallet.balance) : 0,
    })

    const evaluationTime = now
    let remainingBudgetAfter = Number(wallet.balance)

    if (decision.status === 'approved') {
      remainingBudgetAfter = Number(wallet.balance) - amount
      await walletsRepository.update(wallet.id, { balance: remainingBudgetAfter }, client)
    }

    const paymentRequest = await paymentRequestsRepository.create(
      {
        ...data,
        amount,
        requestedBy: userId,
        status: decision.status,
        evaluationResult: decision.status,
        blockReason: decision.reason,
        evaluationTime,
        remainingBudgetAfter,
        riskLevel: risk.level,
        riskScore: risk.score,
        riskFactors: risk.factors,
      },
      client,
    )

    await paymentTimelineEventsRepository.create(
      { paymentRequestId: paymentRequest.id, eventType: 'created', message: 'AI Request Created' },
      client,
    )
    await paymentTimelineEventsRepository.create(
      { paymentRequestId: paymentRequest.id, eventType: 'evaluation_started', message: 'Policy Evaluation Started' },
      client,
    )
    await paymentTimelineEventsRepository.create(
      {
        paymentRequestId: paymentRequest.id,
        eventType: decision.status,
        message: decision.status === 'approved' ? 'Policy Approved' : `Payment Blocked — ${decision.reason}`,
      },
      client,
    )

    await auditLogsRepository.create(
      {
        userId,
        action: `payment_request.${decision.status}`,
        entityType: 'payment_request',
        entityId: paymentRequest.id,
        metadata: { reason: decision.reason ?? null, riskScore: risk.score, riskLevel: risk.level },
      },
      client,
    )

    let virtualCard = null
    if (decision.status === 'approved') {
      await paymentTransactionsRepository.create(
        {
          paymentRequestId: paymentRequest.id,
          walletId: wallet.id,
          merchantId: merchant.id,
          amount,
          type: 'debit',
          status: 'completed',
        },
        client,
      )

      // The virtual card is generated atomically with the approval itself —
      // it should never exist for a payment that didn't actually commit.
      virtualCard = await virtualCardsService.generateForApprovedPayment(
        { userId, paymentRequest, wallet, merchant },
        client,
      )

      await paymentTimelineEventsRepository.create(
        { paymentRequestId: paymentRequest.id, eventType: 'card_generated', message: 'Virtual Card Generated' },
        client,
      )
    }

    await client.query('COMMIT')

    // Alert creation happens after commit, never inside the transaction: a
    // failed alert must never roll back an already-decided payment, and an
    // alert for a payment that got rolled back would be a phantom event.
    await alertsService.createForPaymentDecision(userId, { paymentRequest, wallet, merchant, decision })

    return { paymentRequest, merchant, wallet, decision, virtualCard }
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    throw error
  } finally {
    client.release()
  }
}

// Turns the AI's free-form intent (merchant name, category, amount, currency,
// description, reason) into a real payment request — validating it, resolving
// a wallet and merchant, then running it through the Policy Evaluation Engine
// (createAndEvaluate) instead of leaving it pending for a human.
export async function createFromAssistant(userId, intent = {}) {
  try {
    const merchantName = typeof intent.merchant === 'string' ? intent.merchant.trim() : ''
    if (!merchantName) fail(400, 'no merchant was specified')

    const amount = Number(intent.amount)
    if (!Number.isFinite(amount) || amount <= 0) fail(400, 'no valid amount was specified')

    const currency = typeof intent.currency === 'string' ? intent.currency.trim().toUpperCase() : 'INR'
    if (currency !== 'INR') fail(400, `AgentWallet only supports INR right now, not ${currency}`)

    const wallet = await resolveAssistantWallet(userId)
    if (!wallet) fail(400, 'you do not have an active AI Wallet yet — create one first')

    let merchant = await merchantsRepository.findByUserIdAndName(userId, merchantName)
    if (!merchant) {
      merchant = await merchantsRepository.create({
        userId,
        name: merchantName,
        category: typeof intent.category === 'string' ? intent.category : null,
      })
    }

    return await createAndEvaluate(userId, {
      walletId: wallet.id,
      merchantId: merchant.id,
      amount,
      purpose: typeof intent.description === 'string' ? intent.description : null,
      category: typeof intent.category === 'string' ? intent.category : merchant.category,
      currency,
      aiReason: typeof intent.reason === 'string' ? intent.reason : null,
    })
  } catch (error) {
    throw error
  }
}

async function decidePayment(requestId, userId, decision, reason) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const paymentRequest = await paymentRequestsRepository.findByIdForUpdate(requestId, client)
    if (!paymentRequest) fail(404, 'Payment request not found')

    const wallet = await walletsRepository.findByIdForUpdate(paymentRequest.wallet_id, client)
    if (!wallet) fail(404, 'Wallet not found')

    if (wallet.user_id !== userId) fail(403, 'Only the wallet owner can approve or reject this request')
    if (paymentRequest.status !== 'pending') {
      fail(409, `Payment request has already been ${paymentRequest.status}`)
    }

    const approval = await paymentApprovalsRepository.create(
      { paymentRequestId: requestId, decidedBy: userId, decision, reason },
      client,
    )

    const updatedRequest = await paymentRequestsRepository.update(requestId, { status: decision }, client)

    // Note: approval is a decision only — it does not move money. Money moves
    // exclusively during executePayment(), which requires status === 'approved'
    // as a precondition. This keeps "decision" and "settlement" as separate,
    // independently-failable steps.
    await auditLogsRepository.create(
      {
        userId,
        action: `payment_request.${decision}`,
        entityType: 'payment_request',
        entityId: requestId,
        metadata: { reason: reason ?? null },
      },
      client,
    )

    await paymentTimelineEventsRepository.create(
      {
        paymentRequestId: requestId,
        eventType: decision === 'approved' ? 'approved' : 'rejected',
        message: decision === 'approved' ? 'Policy Approved' : 'Payment Rejected',
      },
      client,
    )

    await client.query('COMMIT')

    return { paymentRequest: updatedRequest, approval }
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    throw error
  } finally {
    client.release()
  }
}

export async function approvePayment(requestId, userId, reason = null) {
  return decidePayment(requestId, userId, 'approved', reason)
}

export async function rejectPayment(requestId, userId, reason = null) {
  return decidePayment(requestId, userId, 'rejected', reason)
}

export async function executePayment(requestId, userId) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const paymentRequest = await paymentRequestsRepository.findByIdForUpdate(requestId, client)
    if (!paymentRequest) fail(404, 'Payment request not found')

    const wallet = await walletsRepository.findByIdForUpdate(paymentRequest.wallet_id, client)
    if (!wallet) fail(404, 'Wallet not found')

    if (wallet.user_id !== userId) fail(403, 'Only the wallet owner can execute this request')

    if (paymentRequest.status === 'completed') fail(409, 'Payment request has already been executed')
    if (paymentRequest.status === 'rejected') fail(409, 'Cannot execute a rejected payment request')
    if (paymentRequest.status !== 'approved') {
      fail(409, `Payment request must be approved before it can be executed (current status: ${paymentRequest.status})`)
    }

    if (wallet.status !== 'active') fail(403, 'Wallet is not active')
    if (Number(wallet.balance) < Number(paymentRequest.amount)) fail(403, 'Insufficient wallet balance')

    const newBalance = Number(wallet.balance) - Number(paymentRequest.amount)
    await walletsRepository.update(wallet.id, { balance: newBalance }, client)

    const budget = Number(wallet.budget)
    if (budget > 0) {
      const spentRatioBefore = (budget - Number(wallet.balance)) / budget
      const spentRatioAfter = (budget - newBalance) / budget
      const BUDGET_ALERT_THRESHOLD = 0.5
      if (spentRatioBefore < BUDGET_ALERT_THRESHOLD && spentRatioAfter >= BUDGET_ALERT_THRESHOLD) {
        await notificationsService.notify(
          userId,
          'Budget alert',
          `${wallet.name} has crossed 50% of its budget`,
          { walletId: wallet.id, client },
        )
      }
    }

    const transaction = await paymentTransactionsRepository.create(
      {
        paymentRequestId: requestId,
        walletId: wallet.id,
        merchantId: paymentRequest.merchant_id,
        amount: paymentRequest.amount,
        type: 'debit',
        status: 'completed',
      },
      client,
    )

    await paymentRequestsRepository.update(requestId, { status: 'completed' }, client)

    await auditLogsRepository.create(
      {
        userId,
        action: 'payment_request.executed',
        entityType: 'payment_request',
        entityId: requestId,
        metadata: { transactionId: transaction.id },
      },
      client,
    )

    await paymentTimelineEventsRepository.create(
      { paymentRequestId: requestId, eventType: 'payment_completed', message: 'Payment Completed' },
      client,
    )

    await client.query('COMMIT')

    return transaction
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    throw error
  } finally {
    client.release()
  }
}

export async function findById(id, userId) {
  try {
    const paymentRequest = await paymentRequestsRepository.findById(id)
    if (!paymentRequest) return null
    if (paymentRequest.requested_by !== userId) fail(403, 'You do not have access to this payment request')
    return paymentRequest
  } catch (error) {
    throw error
  }
}

export async function findAll(userId) {
  try {
    return await paymentRequestsRepository.findAllByRequestedBy(userId)
  } catch (error) {
    throw error
  }
}

export async function findTimeline(id, userId) {
  try {
    const paymentRequest = await paymentRequestsRepository.findById(id)
    if (!paymentRequest) return null
    if (paymentRequest.requested_by !== userId) fail(403, 'You do not have access to this payment request')
    return await paymentTimelineEventsRepository.findAllByPaymentRequestId(id)
  } catch (error) {
    throw error
  }
}

export async function update(id, userId, data) {
  try {
    const paymentRequest = await paymentRequestsRepository.findById(id)
    if (!paymentRequest) return null
    if (paymentRequest.requested_by !== userId) fail(403, 'You do not have access to this payment request')
    return await paymentRequestsRepository.update(id, data)
  } catch (error) {
    throw error
  }
}

export async function remove(id, userId) {
  try {
    const paymentRequest = await paymentRequestsRepository.findById(id)
    if (!paymentRequest) return null
    if (paymentRequest.requested_by !== userId) fail(403, 'You do not have access to this payment request')
    return await paymentRequestsRepository.remove(id)
  } catch (error) {
    throw error
  }
}
