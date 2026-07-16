// The AI Risk Engine. Like the Policy Evaluation Engine, deliberately pure
// and isolated: no database access — just a configurable set of rules
// applied to data the caller already fetched. Decision-independent by
// design (doesn't need to know approved/blocked), so the same function
// scores every payment request from either creation path.

export const RISK_RULES = {
  TRUSTED_MERCHANT: { label: 'Trusted merchant', delta: -20 },
  NEW_MERCHANT: { label: 'New merchant', delta: 20 },
  LARGE_PAYMENT: { label: 'Large payment', delta: 25 },
  NEAR_WALLET_LIMIT: { label: 'Near wallet limit', delta: 15 },
  BLOCKED_CATEGORY_ATTEMPT: { label: 'Blocked category attempt', delta: 40 },
  REPEATED_FAILURES: { label: 'Repeated failures', delta: 30 },
  WALLET_EXPIRED: { label: 'Wallet expired', delta: 50 },
  POLICY_DISABLED: { label: 'Policy disabled', delta: 40 },
}

// A merchant is "trusted" once it has this many prior approved requests from
// this user, and "new" when it has none — configurable thresholds, not the
// rules themselves.
const TRUSTED_MERCHANT_THRESHOLD = 3
const LARGE_PAYMENT_RATIO = 0.5 // relative to the wallet policy's per-transaction limit
const NEAR_LIMIT_REMAINING_RATIO = 0.1 // remaining budget below this fraction counts as "near the limit"
const REPEATED_FAILURES_THRESHOLD = 2 // blocked requests in the recent window

function levelFor(score) {
  if (score >= 75) return 'critical'
  if (score >= 50) return 'high'
  if (score >= 25) return 'medium'
  return 'low'
}

// wallet/policy/merchant are raw DB rows (snake_case) or null. amount/category
// describe the payment being scored. priorApprovedCountForMerchant and
// recentBlockedCount are counts the caller fetched via SQL — this function
// never queries anything itself.
export function calculateRisk({
  wallet,
  policy,
  merchant,
  category,
  amount,
  priorApprovedCountForMerchant,
  recentBlockedCount,
}) {
  const factors = []
  let score = 0

  function apply(rule) {
    score += rule.delta
    factors.push({ label: rule.label, delta: rule.delta })
  }

  if (priorApprovedCountForMerchant >= TRUSTED_MERCHANT_THRESHOLD) {
    apply(RISK_RULES.TRUSTED_MERCHANT)
  } else if (priorApprovedCountForMerchant === 0) {
    apply(RISK_RULES.NEW_MERCHANT)
  }

  if (policy && amount > LARGE_PAYMENT_RATIO * Number(policy.max_per_transaction)) {
    apply(RISK_RULES.LARGE_PAYMENT)
  }

  const walletCeiling = Number(wallet.budget) > 0 ? Number(wallet.budget) : Number(wallet.balance)
  const remainingAfter = Number(wallet.balance) - amount
  if (walletCeiling > 0 && remainingAfter >= 0 && remainingAfter < NEAR_LIMIT_REMAINING_RATIO * walletCeiling) {
    apply(RISK_RULES.NEAR_WALLET_LIMIT)
  }

  const effectiveCategory = category || merchant?.category
  if (
    policy &&
    effectiveCategory &&
    (policy.blocked_categories ?? []).some((blocked) => blocked.toLowerCase() === effectiveCategory.toLowerCase())
  ) {
    apply(RISK_RULES.BLOCKED_CATEGORY_ATTEMPT)
  }

  if (recentBlockedCount >= REPEATED_FAILURES_THRESHOLD) {
    apply(RISK_RULES.REPEATED_FAILURES)
  }

  if (wallet.expires_at && new Date(wallet.expires_at).getTime() < Date.now()) {
    apply(RISK_RULES.WALLET_EXPIRED)
  }

  if (!policy || !policy.is_enabled) {
    apply(RISK_RULES.POLICY_DISABLED)
  }

  score = Math.max(0, Math.min(100, score))

  return { score, level: levelFor(score), factors }
}
