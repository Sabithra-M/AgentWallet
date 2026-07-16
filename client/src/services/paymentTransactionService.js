import api from './api.js'
import { capitalize } from '../utils/capitalize.js'

function normalizeTransaction(transaction) {
  return {
    id: transaction.id,
    paymentRequestId: transaction.payment_request_id,
    walletId: transaction.wallet_id,
    merchantId: transaction.merchant_id,
    amount: Number(transaction.amount),
    currency: transaction.currency,
    type: capitalize(transaction.type),
    status: capitalize(transaction.status),
    paymentMethod: transaction.payment_method,
    transactedAt: transaction.transacted_at,
    createdAt: transaction.created_at,
    updatedAt: transaction.updated_at,
  }
}

export async function getTransactions() {
  const response = await api.get('/payment-transactions')
  return response.data.map(normalizeTransaction)
}
