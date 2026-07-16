import * as walletsService from './wallets.service.js'
import * as paymentRequestsService from './paymentRequests.service.js'
import * as alertsService from './alerts.service.js'
import * as auditLogsService from './auditLogs.service.js'
import * as virtualCardsService from './virtualCards.service.js'
import * as aiWalletPoliciesService from './aiWalletPolicies.service.js'
import * as merchantsService from './merchants.service.js'
import { fail } from '../utils/httpError.js'

const RECENT_LIMIT = 5

function formatInr(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`
}

function formatDateTime(value) {
  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function capitalize(value) {
  if (typeof value !== 'string' || value.length === 0) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}

// The four merchant-spend intents all reduce to the exact same shape — a
// real payment request run through the real Policy Evaluation Engine. The
// assistant's own reply text must always frame this as a submission to that
// engine, never as the assistant approving or declining anything itself.
async function handlePaymentIntent(userId, fields) {
  const { paymentRequest, merchant, decision } = await paymentRequestsService.createFromAssistant(userId, {
    merchant: fields.merchant,
    amount: fields.amount,
    currency: fields.currency ?? 'INR',
    category: fields.category,
    reason: 'Requested via AI Assistant',
  })

  const amountText = formatInr(paymentRequest.amount)
  if (decision.status === 'approved') {
    return (
      `I've sent your ${amountText} payment to ${merchant.name} to the Policy Engine for evaluation.\n\n` +
      `✅ Approved — a virtual card has been generated for this payment.`
    )
  }
  return (
    `I've sent your ${amountText} payment to ${merchant.name} to the Policy Engine for evaluation.\n\n` +
    `🚫 Blocked — ${decision.reason}.`
  )
}

async function handleTransferMoney(userId, fields) {
  const amount = Number(fields.amount)
  if (!Number.isFinite(amount) || amount <= 0) {
    return "How much would you like to transfer?"
  }

  const destination = typeof fields.destination === 'string' ? fields.destination.trim().toLowerCase() : ''
  const wallets = await walletsService.findAll(userId)
  const mainWallet = wallets.find((w) => w.is_main)

  if (!destination || destination.includes('main')) {
    if (!mainWallet) fail(404, 'Main Wallet not found')
    await walletsService.addMoney(mainWallet.id, userId, amount)
    return `Done — ${formatInr(amount)} has been added to your Main Wallet.`
  }

  const matchedAiWallet = wallets.find(
    (w) => w.category === 'ai' && w.name.toLowerCase().includes(destination),
  )
  if (matchedAiWallet) {
    return (
      `AI Wallets are funded when they're created, not topped up afterwards — ` +
      `delete and recreate "${matchedAiWallet.name}" with a larger budget if you need more allocated to it.`
    )
  }

  return `I couldn't find a wallet matching "${fields.destination}" — did you mean your Main Wallet?`
}

async function handleCheckWalletBalance(userId) {
  const wallets = await walletsService.findAll(userId)
  if (wallets.length === 0) return "You don't have any wallets yet."

  const lines = wallets.map((w) => {
    const label = w.is_main ? `${w.name} (Main)` : w.name
    return `• ${label}: ${formatInr(w.balance)}${w.is_main ? '' : ` of ${formatInr(w.budget)} allocated`}`
  })
  return `Here's your wallet balance:\n\n${lines.join('\n')}`
}

async function handleShowPaymentRequests(userId) {
  const [requests, merchants] = await Promise.all([
    paymentRequestsService.findAll(userId),
    merchantsService.findAll(userId),
  ])
  if (requests.length === 0) return "You don't have any payment requests yet."

  const merchantNameById = merchants.reduce((map, m) => ({ ...map, [m.id]: m.name }), {})
  const recent = [...requests]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, RECENT_LIMIT)

  const lines = recent.map(
    (r) =>
      `• ${merchantNameById[r.merchant_id] ?? 'Unknown Merchant'} — ${formatInr(r.amount)} — ${capitalize(r.status)}`,
  )
  return `Here are your most recent payment requests:\n\n${lines.join('\n')}`
}

async function handleShowAlerts(userId) {
  const alerts = await alertsService.findAll(userId)
  if (alerts.length === 0) return "You don't have any security alerts."

  const recent = [...alerts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, RECENT_LIMIT)
  const lines = recent.map((a) => `• [${capitalize(a.severity)}] ${a.title} — ${formatDateTime(a.created_at)}`)
  return `Here are your most recent alerts:\n\n${lines.join('\n')}`
}

async function handleShowAuditLogs(userId) {
  const logs = await auditLogsService.findAll(userId)
  if (logs.length === 0) return "You don't have any audit log entries yet."

  const recent = [...logs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, RECENT_LIMIT)
  const lines = recent.map((l) => `• ${l.action} — ${formatDateTime(l.created_at)}`)
  return `Here are your most recent audit log entries:\n\n${lines.join('\n')}`
}

async function handleShowVirtualCards(userId) {
  const cards = await virtualCardsService.findAll(userId)
  if (cards.length === 0) return "You don't have any virtual cards yet — one is generated automatically whenever an AI payment is approved."

  const recent = [...cards].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, RECENT_LIMIT)
  const lines = recent.map((c) => `• ${c.card_number} — ${formatInr(c.spending_limit)} — ${capitalize(c.status)}`)
  return `Here are your virtual cards:\n\n${lines.join('\n')}`
}

async function handleExplainPolicy(userId) {
  const [policies, wallets] = await Promise.all([
    aiWalletPoliciesService.findAll(userId),
    walletsService.findAll(userId),
  ])
  if (policies.length === 0) {
    return "You don't have any AI Wallet policies configured yet — set one up from an AI Wallet's details page."
  }

  const walletNameById = wallets.reduce((map, w) => ({ ...map, [w.id]: w.name }), {})
  const sections = policies.map((p) => {
    const walletName = walletNameById[p.wallet_id] ?? 'Unknown Wallet'
    const lines = [
      `**${walletName}** (${p.is_enabled ? 'enabled' : 'disabled'}):`,
      `• Max wallet budget: ${formatInr(p.max_wallet_budget)}`,
      `• Max per transaction: ${formatInr(p.max_per_transaction)}`,
      `• Daily limit: ${formatInr(p.daily_transaction_limit)}`,
      `• Monthly limit: ${formatInr(p.monthly_transaction_limit)}`,
      `• PIN required above: ${formatInr(p.pin_required_above)}`,
      `• Blocked categories: ${p.blocked_categories.length > 0 ? p.blocked_categories.join(', ') : 'None'}`,
    ]
    return lines.join('\n')
  })
  return `Here's your AI Wallet policy:\n\n${sections.join('\n\n')}`
}

async function handleCreateAiWallet(userId, fields) {
  const name = typeof fields.name === 'string' ? fields.name.trim() : ''
  if (!name) return 'What would you like to name the new AI Wallet?'

  const budget = Number(fields.budget)
  if (!Number.isFinite(budget) || budget <= 0) {
    return `How much budget would you like to allocate to "${name}"?`
  }

  const expiresAt =
    typeof fields.expiresAt === 'string' && !Number.isNaN(Date.parse(fields.expiresAt))
      ? new Date(fields.expiresAt).toISOString()
      : new Date(Date.now() + 30 * 86400000).toISOString()

  const wallet = await walletsService.createAiWallet(userId, { name, budget, expiresAt })
  return `Done — "${wallet.name}" has been created with a budget of ${formatInr(wallet.budget)}.`
}

const HANDLERS = {
  book_flight: handlePaymentIntent,
  book_hotel: handlePaymentIntent,
  pay_merchant: handlePaymentIntent,
  buy_subscription: handlePaymentIntent,
  transfer_money: handleTransferMoney,
  check_wallet_balance: handleCheckWalletBalance,
  show_payment_requests: handleShowPaymentRequests,
  show_alerts: handleShowAlerts,
  show_audit_logs: handleShowAuditLogs,
  show_virtual_cards: handleShowVirtualCards,
  explain_policy: handleExplainPolicy,
  create_ai_wallet: handleCreateAiWallet,
}

// Executes a real backend action for an intent the AI Agent decided it has
// enough information to act on. Every reply is built from real, freshly-
// queried data — never from the model's own (possibly hallucinated) text.
export async function executeAgentAction(userId, { intent, fields = {} }) {
  const handler = HANDLERS[intent]
  if (!handler) return null
  return await handler(userId, fields)
}
