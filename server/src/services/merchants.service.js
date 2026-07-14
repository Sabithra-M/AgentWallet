import * as merchantsRepository from '../repositories/merchants.repository.js'

export async function create(data) {
  try {
    return await merchantsRepository.create(data)
  } catch (error) {
    throw error
  }
}

export async function findById(id) {
  try {
    return await merchantsRepository.findById(id)
  } catch (error) {
    throw error
  }
}

export async function findAll() {
  try {
    return await merchantsRepository.findAll()
  } catch (error) {
    throw error
  }
}

export async function update(id, data) {
  try {
    return await merchantsRepository.update(id, data)
  } catch (error) {
    throw error
  }
}

export async function remove(id) {
  try {
    return await merchantsRepository.remove(id)
  } catch (error) {
    throw error
  }
}
