import * as walletsRepository from '../repositories/wallets.repository.js'

function assertOwnership(wallet, userId) {
  if (wallet.user_id !== userId) {
    const error = new Error('You do not have access to this wallet')
    error.status = 403
    throw error
  }
}

export async function create(userId, data) {
  try {
    return await walletsRepository.create({ ...data, userId })
  } catch (error) {
    throw error
  }
}

export async function findById(id, userId) {
  try {
    const wallet = await walletsRepository.findById(id)
    if (!wallet) return null
    assertOwnership(wallet, userId)
    return wallet
  } catch (error) {
    throw error
  }
}

export async function findAll(userId) {
  try {
    return await walletsRepository.findAllByUserId(userId)
  } catch (error) {
    throw error
  }
}

export async function update(id, userId, data) {
  try {
    const wallet = await walletsRepository.findById(id)
    if (!wallet) return null
    assertOwnership(wallet, userId)
    return await walletsRepository.update(id, data)
  } catch (error) {
    throw error
  }
}

export async function remove(id, userId) {
  try {
    const wallet = await walletsRepository.findById(id)
    if (!wallet) return null
    assertOwnership(wallet, userId)
    return await walletsRepository.remove(id)
  } catch (error) {
    throw error
  }
}
