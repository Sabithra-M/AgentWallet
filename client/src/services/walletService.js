import api from './api.js'
import { capitalize } from '../utils/capitalize.js'

// The backend returns raw Postgres rows (snake_case, e.g. monthly_limit).
// The wallet components (WalletCard, WalletListItem, WalletDetails) expect
// camelCase fields and a Title-Case status. Normalizing here keeps every
// component untouched.
function normalizeWallet(wallet) {
  return {
    id: wallet.id,
    userId: wallet.user_id,
    name: wallet.name,
    category: wallet.category,
    description: wallet.description,
    currency: wallet.currency,
    balance: Number(wallet.balance),
    budget: Number(wallet.budget),
    monthlyLimit: Number(wallet.monthly_limit),
    status: capitalize(wallet.status),
    isMain: wallet.is_main,
    expiresAt: wallet.expires_at,
    createdAt: wallet.created_at,
    updatedAt: wallet.updated_at,
  }
}

export async function getWallets() {
  const response = await api.get('/wallets')
  return response.data.map(normalizeWallet)
}

export async function getWallet(id) {
  const response = await api.get(`/wallets/${id}`)
  return normalizeWallet(response.data)
}

export async function createWallet(data) {
  const response = await api.post('/wallets', data)
  return normalizeWallet(response.data)
}

export async function addMoney(walletId, amount) {
  const response = await api.post(`/wallets/${walletId}/topup`, { amount })
  return {
    wallet: normalizeWallet(response.data.wallet),
    transaction: response.data.transaction,
  }
}

export async function createAiWallet({ name, description, budget, expiresAt }) {
  const response = await api.post('/wallets/ai', { name, description, budget, expiresAt })
  return normalizeWallet(response.data)
}

export async function updateWallet(walletId, data) {
  const response = await api.put(`/wallets/${walletId}`, data)
  return normalizeWallet(response.data)
}

export async function deleteWallet(walletId) {
  await api.delete(`/wallets/${walletId}`)
}
