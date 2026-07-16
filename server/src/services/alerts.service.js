import * as alertsRepository from '../repositories/alerts.repository.js'
import * as sseService from './sse.service.js'
import { fail } from '../utils/httpError.js'


async function assertOwnership(alertId, userId) {
  const alert = await alertsRepository.findById(alertId)
  if (!alert) fail(404, 'Alert not found')
  if (alert.user_id !== userId) fail(403, 'You do not have access to this alert')
  return alert
}

// Maps a Policy Evaluation Engine decision code to the alert type/title/
// severity to record. Anything blocked that doesn't match a known code still
// gets a generic "Payment Blocked" alert rather than silently producing none.
const DECISION_CODE_TO_ALERT = {
  APPROVED: { type: 'payment_approved', title: 'Payment Approved', severity: 'info' },
  WALLET_INACTIVE: { type: 'wallet_disabled', title: 'Wallet Disabled', severity: 'critical' },
  WALLET_EXPIRED: { type: 'wallet_expired', title: 'Wallet Expired', severity: 'critical' },
  NO_POLICY: { type: 'policy_disabled', title: 'Policy Disabled', severity: 'critical' },
  POLICY_DISABLED: { type: 'policy_disabled', title: 'Policy Disabled', severity: 'critical' },
  BUDGET_EXCEEDED: { type: 'budget_exceeded', title: 'Budget Exceeded', severity: 'warning' },
  PER_TRANSACTION_EXCEEDED: { type: 'max_transaction_exceeded', title: 'Maximum Transaction Exceeded', severity: 'warning' },
  DAILY_LIMIT_EXCEEDED: { type: 'daily_limit_exceeded', title: 'Daily Limit Exceeded', severity: 'warning' },
  MONTHLY_LIMIT_EXCEEDED: { type: 'monthly_limit_exceeded', title: 'Monthly Limit Exceeded', severity: 'warning' },
  MERCHANT_NOT_ALLOWED: { type: 'merchant_not_allowed', title: 'Merchant Not Allowed', severity: 'warning' },
  CATEGORY_BLOCKED: { type: 'blocked_category', title: 'Blocked Category', severity: 'warning' },
  PIN_REQUIRED: { type: 'pin_required', title: 'PIN Required', severity: 'warning' },
  MAIN_WALLET_INSUFFICIENT: { type: 'insufficient_wallet_balance', title: 'Insufficient Wallet Balance', severity: 'critical' },
}
const FALLBACK_BLOCKED_ALERT = { type: 'payment_blocked', title: 'Payment Blocked', severity: 'warning' }

function formatInr(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`
}

// Called once, right after the Policy Evaluation Engine commits its decision
// on an AI-Assistant payment request. Never throws into the caller — a failed
// alert must not undo an already-committed payment decision.
export async function createForPaymentDecision(userId, { paymentRequest, wallet, merchant, decision }) {
  try {
    const meta = DECISION_CODE_TO_ALERT[decision.code] ?? FALLBACK_BLOCKED_ALERT
    const amountText = formatInr(paymentRequest.amount)
    const message =
      decision.status === 'approved'
        ? `${merchant.name} payment of ${amountText} from ${wallet.name} was approved.`
        : `${merchant.name} payment of ${amountText} from ${wallet.name} was blocked — ${decision.reason}.`

    const alert = await alertsRepository.create({
      userId,
      paymentRequestId: paymentRequest.id,
      walletId: wallet.id,
      type: meta.type,
      title: meta.title,
      message,
      severity: meta.severity,
    })

    sseService.publish(userId, 'alert', alert)
    return alert
  } catch (error) {
    return null
  }
}

// Called once, right after useCard()'s transaction commits (success or
// failure). Same "never throws into the caller" contract as
// createForPaymentDecision — a failed alert must never mask the real result.
export async function createForVirtualCardEvent(userId, { card, outcome, reason = null }) {
  try {
    const amountText = formatInr(card.spending_limit)
    const maskedNumber = `•••• ${card.card_number.slice(-4)}`

    const meta =
      outcome === 'success'
        ? { type: 'payment_completed', title: 'Payment Completed', severity: 'info' }
        : { type: 'virtual_card_use_failed', title: 'Virtual Card Use Failed', severity: 'warning' }

    const message =
      outcome === 'success'
        ? `Card ${maskedNumber} was used to complete a payment of ${amountText}.`
        : `Card ${maskedNumber} could not be used — ${reason}.`

    const alert = await alertsRepository.create({
      userId,
      paymentRequestId: card.payment_request_id,
      walletId: card.wallet_id,
      type: meta.type,
      title: meta.title,
      message,
      severity: meta.severity,
    })

    sseService.publish(userId, 'alert', alert)
    return alert
  } catch (error) {
    return null
  }
}

export async function findAll(userId) {
  try {
    return await alertsRepository.findAllByUserId(userId)
  } catch (error) {
    throw error
  }
}

export async function countUnread(userId) {
  try {
    return await alertsRepository.countUnreadByUserId(userId)
  } catch (error) {
    throw error
  }
}

export async function markRead(id, userId) {
  try {
    await assertOwnership(id, userId)
    return await alertsRepository.markRead(id, true)
  } catch (error) {
    throw error
  }
}

export async function markAllRead(userId) {
  try {
    return await alertsRepository.markAllReadForUser(userId)
  } catch (error) {
    throw error
  }
}

export async function remove(id, userId) {
  try {
    await assertOwnership(id, userId)
    return await alertsRepository.remove(id)
  } catch (error) {
    throw error
  }
}

export async function clearRead(userId) {
  try {
    return await alertsRepository.removeAllReadForUser(userId)
  } catch (error) {
    throw error
  }
}
