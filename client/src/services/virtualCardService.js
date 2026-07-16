import api from './api.js'

function normalizeCard(row) {
  return {
    id: row.id,
    userId: row.user_id,
    paymentRequestId: row.payment_request_id,
    walletId: row.wallet_id,
    merchantId: row.merchant_id,
    cardNumber: row.card_number,
    cardHolder: row.card_holder,
    cvv: row.cvv,
    expiryMonth: row.expiry_month,
    expiryYear: row.expiry_year,
    spendingLimit: Number(row.spending_limit),
    currency: row.currency,
    status: row.status,
    expiresAt: row.expires_at,
    usedAt: row.used_at,
    createdAt: row.created_at,
  }
}

export async function getVirtualCards() {
  const response = await api.get('/virtual-cards')
  return response.data.map(normalizeCard)
}

export async function getVirtualCard(id) {
  const response = await api.get(`/virtual-cards/${id}`)
  return normalizeCard(response.data)
}

export async function useVirtualCard(id, { merchant, amount }) {
  const response = await api.post(`/virtual-cards/${id}/use`, { merchant, amount })
  return normalizeCard(response.data)
}

// The card number/CVV in getVirtualCard()/getVirtualCards() are masked —
// this is the only call that returns the real values, fetched on-demand
// only when the user explicitly asks to reveal them.
export async function revealVirtualCard(id) {
  const response = await api.get(`/virtual-cards/${id}/reveal`)
  return { cardNumber: response.data.cardNumber, cvv: response.data.cvv }
}
