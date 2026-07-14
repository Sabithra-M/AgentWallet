import * as walletsRepository from '../repositories/wallets.repository.js'

export async function create(data) {
  try {
    return await walletsRepository.create(data)
  } catch (error) {
    throw error
  }
}

export async function findById(id) {
  try {
    return await walletsRepository.findById(id)
  } catch (error) {
    throw error
  }
}

export async function findAll() {
  try {
    return await walletsRepository.findAll()
  } catch (error) {
    throw error
  }
}

export async function update(id, data) {
  try {
    return await walletsRepository.update(id, data)
  } catch (error) {
    throw error
  }
}

export async function remove(id) {
  try {
    return await walletsRepository.remove(id)
  } catch (error) {
    throw error
  }
}
