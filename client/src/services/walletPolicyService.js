import api from './api.js'

function normalizePolicy(policy) {
  return {
    id: policy.id,
    walletId: policy.wallet_id,
    policyType: policy.policy_type,
    thresholdAmount: policy.threshold_amount === null ? null : Number(policy.threshold_amount),
    config: policy.config,
    isActive: policy.is_active,
  }
}

export async function getWalletPolicies() {
  const response = await api.get('/wallet-policies')
  return response.data.map(normalizePolicy)
}

export async function createPolicy({ walletId, policyType, thresholdAmount, config, isActive }) {
  const response = await api.post('/wallet-policies', { walletId, policyType, thresholdAmount, config, isActive })
  return normalizePolicy(response.data)
}

export async function updatePolicy(id, { policyType, thresholdAmount, config, isActive } = {}) {
  const response = await api.put(`/wallet-policies/${id}`, { policyType, thresholdAmount, config, isActive })
  return normalizePolicy(response.data)
}

export async function deletePolicy(id) {
  await api.delete(`/wallet-policies/${id}`)
}
