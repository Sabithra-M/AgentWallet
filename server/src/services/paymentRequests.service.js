import * as paymentRequestsRepository from '../repositories/paymentRequests.repository.js'

export async function create(data) {
  try {
    return await paymentRequestsRepository.create(data)
  } catch (error) {
    throw error
  }
}

export async function findById(id) {
  try {
    return await paymentRequestsRepository.findById(id)
  } catch (error) {
    throw error
  }
}

export async function findAll() {
  try {
    return await paymentRequestsRepository.findAll()
  } catch (error) {
    throw error
  }
}

export async function update(id, data) {
  try {
    return await paymentRequestsRepository.update(id, data)
  } catch (error) {
    throw error
  }
}

export async function remove(id) {
  try {
    return await paymentRequestsRepository.remove(id)
  } catch (error) {
    throw error
  }
}
