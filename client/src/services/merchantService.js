import api from './api.js'

function normalizeMerchant(merchant) {
  return {
    id: merchant.id,
    name: merchant.name,
    category: merchant.category,
    isVerified: merchant.is_verified,
  }
}

export async function getMerchants() {
  const response = await api.get('/merchants')
  return response.data.map(normalizeMerchant)
}

export async function createMerchant(data) {
  const response = await api.post('/merchants', data)
  return normalizeMerchant(response.data)
}
