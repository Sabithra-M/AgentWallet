import * as merchantsRepository from '../repositories/merchants.repository.js'

function assertOwnership(merchant, userId) {
  if (merchant.user_id !== userId) {
    const error = new Error('You do not have access to this merchant')
    error.status = 403
    throw error
  }
}

export async function create(userId, data) {
  try {
    return await merchantsRepository.create({ ...data, userId })
  } catch (error) {
    throw error
  }
}

export async function findById(id, userId) {
  try {
    const merchant = await merchantsRepository.findById(id)
    if (!merchant) return null
    assertOwnership(merchant, userId)
    return merchant
  } catch (error) {
    throw error
  }
}

export async function findAll(userId) {
  try {
    return await merchantsRepository.findAllByUserId(userId)
  } catch (error) {
    throw error
  }
}

export async function update(id, userId, data) {
  try {
    const merchant = await merchantsRepository.findById(id)
    if (!merchant) return null
    assertOwnership(merchant, userId)
    return await merchantsRepository.update(id, data)
  } catch (error) {
    throw error
  }
}

export async function remove(id, userId) {
  try {
    const merchant = await merchantsRepository.findById(id)
    if (!merchant) return null
    assertOwnership(merchant, userId)
    return await merchantsRepository.remove(id)
  } catch (error) {
    throw error
  }
}
