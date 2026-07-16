import * as aiWalletPoliciesRepository from '../repositories/aiWalletPolicies.repository.js'
import * as walletsRepository from '../repositories/wallets.repository.js'
import * as merchantsRepository from '../repositories/merchants.repository.js'
import { pool } from '../db/index.js'
import { fail } from '../utils/httpError.js'


async function assertWalletOwnership(walletId, userId) {
  const wallet = await walletsRepository.findById(walletId)
  if (!wallet) fail(404, 'Wallet not found')
  if (wallet.user_id !== userId) fail(403, 'You do not have access to this wallet')
  return wallet
}

async function assertWalletOwnershipForUpdate(walletId, userId, client) {
  const wallet = await walletsRepository.findByIdForUpdate(walletId, client)
  if (!wallet) fail(404, 'Wallet not found')
  if (wallet.user_id !== userId) fail(403, 'You do not have access to this wallet')
  return wallet
}

// Allowed Merchants may only reference merchants the caller owns — a
// cross-user merchant id here is harmless data-wise, but rejecting it keeps
// every policy field verifiably scoped to the wallet's own owner.
async function assertMerchantsOwnership(merchantIds, userId) {
  for (const merchantId of merchantIds) {
    const merchant = await merchantsRepository.findById(merchantId)
    if (!merchant || merchant.user_id !== userId) {
      fail(400, `Merchant ${merchantId} was not found in your account`)
    }
  }
}

export async function findAll(userId) {
  try {
    return await aiWalletPoliciesRepository.findAllByUserId(userId)
  } catch (error) {
    throw error
  }
}

export async function findByWalletId(walletId, userId) {
  try {
    await assertWalletOwnership(walletId, userId)
    return await aiWalletPoliciesRepository.findByWalletId(walletId)
  } catch (error) {
    throw error
  }
}

export async function create(walletId, userId, data) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const wallet = await assertWalletOwnershipForUpdate(walletId, userId, client)
    if (wallet.category !== 'ai') fail(400, 'Policies can only be configured for AI Wallets')

    const existing = await aiWalletPoliciesRepository.findByWalletIdForUpdate(walletId, client)
    if (existing) fail(409, 'This wallet already has a policy — update it instead')

    await assertMerchantsOwnership(data.allowedMerchantIds ?? [], userId)

    const policy = await aiWalletPoliciesRepository.create(walletId, data, client)
    await client.query('COMMIT')
    return policy
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    throw error
  } finally {
    client.release()
  }
}

export async function update(walletId, userId, data) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    await assertWalletOwnershipForUpdate(walletId, userId, client)

    const existing = await aiWalletPoliciesRepository.findByWalletIdForUpdate(walletId, client)
    if (!existing) fail(404, 'No policy exists for this wallet yet — create one first')

    await assertMerchantsOwnership(data.allowedMerchantIds ?? [], userId)

    const policy = await aiWalletPoliciesRepository.update(walletId, data, client)
    await client.query('COMMIT')
    return policy
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    throw error
  } finally {
    client.release()
  }
}
