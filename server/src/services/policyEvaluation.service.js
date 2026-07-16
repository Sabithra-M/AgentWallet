// The Policy Evaluation Engine. Deliberately kept pure and isolated: no
// database access, no HTTP concerns — just the 11 rules, checked in order,
// against data the caller has already fetched. This makes the decision logic
// trivial to reason about and test independent of transactions or wiring.

export const BLOCK_REASONS = {
  WALLET_INACTIVE: 'Wallet is inactive',
  WALLET_EXPIRED: 'Wallet has expired',
  POLICY_DISABLED: 'Wallet policy is disabled',
  NO_POLICY: 'No policy has been configured for this wallet',
  BUDGET_EXCEEDED: 'Wallet budget exceeded',
  PER_TRANSACTION_EXCEEDED: 'Maximum transaction amount exceeded',
  DAILY_LIMIT_EXCEEDED: 'Daily transaction limit exceeded',
  MONTHLY_LIMIT_EXCEEDED: 'Monthly transaction limit exceeded',
  MERCHANT_NOT_ALLOWED: 'Merchant is not on the allowed list',
  CATEGORY_BLOCKED: 'Merchant category is blocked by wallet policy',
  PIN_REQUIRED: 'PIN verification is required for this amount',
  MAIN_WALLET_INSUFFICIENT: 'Insufficient main wallet balance',
}

function approved() {
  return { status: 'approved', code: 'APPROVED', reason: null }
}

// `code` is a stable key (e.g. 'WALLET_INACTIVE') callers can switch on
// without string-matching the human-readable reason — the Alert Service uses
// it to pick an alert type independent of this file's exact wording.
function blocked(code) {
  return { status: 'blocked', code, reason: BLOCK_REASONS[code] }
}

// wallet/policy/merchant are raw DB rows (snake_case). amount/category
// describe the payment being evaluated. dailySpent/monthlySpent are the sums
// of already-approved amounts on this wallet in the respective windows
// (excluding this request). mainWalletBalance is the user's Main Wallet
// balance, checked as a final sanity guard — AI Wallet budgets are reserved
// out of it at creation time, so approving a request never debits it again.
export function evaluate({ wallet, policy, merchant, category, amount, dailySpent, monthlySpent, mainWalletBalance }) {
  // 1. Wallet Active?
  if (wallet.status !== 'active') return blocked('WALLET_INACTIVE')

  // 2. Wallet Expired?
  if (wallet.expires_at && new Date(wallet.expires_at).getTime() < Date.now()) {
    return blocked('WALLET_EXPIRED')
  }

  // 3. Policy Enabled?
  if (!policy) return blocked('NO_POLICY')
  if (!policy.is_enabled) return blocked('POLICY_DISABLED')

  // 4. Wallet Budget Remaining?
  if (amount > Number(wallet.balance)) return blocked('BUDGET_EXCEEDED')

  // 5. Maximum Per Transaction?
  if (amount > Number(policy.max_per_transaction)) return blocked('PER_TRANSACTION_EXCEEDED')

  // 6. Daily Transaction Limit?
  if (dailySpent + amount > Number(policy.daily_transaction_limit)) {
    return blocked('DAILY_LIMIT_EXCEEDED')
  }

  // 7. Monthly Transaction Limit?
  if (monthlySpent + amount > Number(policy.monthly_transaction_limit)) {
    return blocked('MONTHLY_LIMIT_EXCEEDED')
  }

  // 8. Merchant Allowed? (an empty allow-list means no merchant restriction)
  if (policy.allowed_merchant_ids.length > 0 && !policy.allowed_merchant_ids.includes(merchant.id)) {
    return blocked('MERCHANT_NOT_ALLOWED')
  }

  // 9. Category Blocked?
  const effectiveCategory = category || merchant.category
  if (
    effectiveCategory &&
    policy.blocked_categories.some((blockedCategory) => blockedCategory.toLowerCase() === effectiveCategory.toLowerCase())
  ) {
    return blocked('CATEGORY_BLOCKED')
  }

  // 10. PIN Required? — there's no PIN-entry step in this automated flow, so
  // exceeding the threshold can't be satisfied and blocks the request.
  if (amount > Number(policy.pin_required_above)) return blocked('PIN_REQUIRED')

  // 11. Main Wallet Balance Available?
  if (mainWalletBalance < 0) return blocked('MAIN_WALLET_INSUFFICIENT')

  return approved()
}
