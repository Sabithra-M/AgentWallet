import api from './api.js'

function normalizePolicy(row) {
  return {
    id: row.id,
    walletId: row.wallet_id,
    maxWalletBudget: Number(row.max_wallet_budget),
    maxPerTransaction: Number(row.max_per_transaction),
    allowedMerchantIds: row.allowed_merchant_ids ?? [],
    blockedCategories: row.blocked_categories ?? [],
    allowedCountries: row.allowed_countries ?? [],
    dailyTransactionLimit: Number(row.daily_transaction_limit),
    monthlyTransactionLimit: Number(row.monthly_transaction_limit),
    pinRequiredAbove: Number(row.pin_required_above),
    autoExpireWithWallet: row.auto_expire_with_wallet,
    isEnabled: row.is_enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getPolicies() {
  const response = await api.get('/ai-wallet-policies')
  return response.data.map(normalizePolicy)
}

export async function getPolicy(walletId) {
  const response = await api.get(`/ai-wallet-policies/${walletId}`)
  return normalizePolicy(response.data)
}

export async function createPolicy(walletId, data) {
  const response = await api.post(`/ai-wallet-policies/${walletId}`, data)
  return normalizePolicy(response.data)
}

export async function updatePolicy(walletId, data) {
  const response = await api.put(`/ai-wallet-policies/${walletId}`, data)
  return normalizePolicy(response.data)
}
