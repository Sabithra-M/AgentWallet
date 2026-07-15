import * as paymentTransactionsRepository from '../repositories/paymentTransactions.repository.js'
import * as walletsRepository from '../repositories/wallets.repository.js'

function fail(status, message) {
  const error = new Error(message)
  error.status = status
  throw error
}

async function assertWalletOwnership(walletId, userId) {
  const wallet = await walletsRepository.findById(walletId)
  if (!wallet) fail(404, 'Wallet not found')
  if (wallet.user_id !== userId) fail(403, 'You do not have access to this payment transaction')
  return wallet
}

export async function create(userId, data) {
  try {
    await assertWalletOwnership(data.walletId, userId)
    return await paymentTransactionsRepository.create(data)
  } catch (error) {
    throw error
  }
}

export async function findById(id, userId) {
  try {
    const transaction = await paymentTransactionsRepository.findById(id)
    if (!transaction) return null
    await assertWalletOwnership(transaction.wallet_id, userId)
    return transaction
  } catch (error) {
    throw error
  }
}

export async function findAll(userId) {
  try {
    return await paymentTransactionsRepository.findAllByUserId(userId)
  } catch (error) {
    throw error
  }
}

export async function update(id, userId, data) {
  try {
    const transaction = await paymentTransactionsRepository.findById(id)
    if (!transaction) return null
    await assertWalletOwnership(transaction.wallet_id, userId)
    return await paymentTransactionsRepository.update(id, data)
  } catch (error) {
    throw error
  }
}

export async function remove(id, userId) {
  try {
    const transaction = await paymentTransactionsRepository.findById(id)
    if (!transaction) return null
    await assertWalletOwnership(transaction.wallet_id, userId)
    return await paymentTransactionsRepository.remove(id)
  } catch (error) {
    throw error
  }
}
