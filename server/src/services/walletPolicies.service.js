import * as walletPoliciesRepository from '../repositories/walletPolicies.repository.js'
import * as walletsRepository from '../repositories/wallets.repository.js'
import { fail } from '../utils/httpError.js'


async function assertWalletOwnership(walletId, userId) {
  const wallet = await walletsRepository.findById(walletId)
  if (!wallet) fail(404, 'Wallet not found')
  if (wallet.user_id !== userId) fail(403, 'You do not have access to this wallet')
  return wallet
}

export async function create(userId, data) {
  try {
    await assertWalletOwnership(data.walletId, userId)
    return await walletPoliciesRepository.create(data)
  } catch (error) {
    throw error
  }
}

export async function findById(id, userId) {
  try {
    const policy = await walletPoliciesRepository.findById(id)
    if (!policy) return null
    await assertWalletOwnership(policy.wallet_id, userId)
    return policy
  } catch (error) {
    throw error
  }
}

export async function findAll(userId) {
  try {
    return await walletPoliciesRepository.findAllByUserId(userId)
  } catch (error) {
    throw error
  }
}

export async function update(id, userId, data) {
  try {
    const policy = await walletPoliciesRepository.findById(id)
    if (!policy) return null
    await assertWalletOwnership(policy.wallet_id, userId)
    return await walletPoliciesRepository.update(id, data)
  } catch (error) {
    throw error
  }
}

export async function remove(id, userId) {
  try {
    const policy = await walletPoliciesRepository.findById(id)
    if (!policy) return null
    await assertWalletOwnership(policy.wallet_id, userId)
    return await walletPoliciesRepository.remove(id)
  } catch (error) {
    throw error
  }
}
