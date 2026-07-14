import * as paymentApprovalsRepository from '../repositories/paymentApprovals.repository.js'

export async function create(data) {
  try {
    return await paymentApprovalsRepository.create(data)
  } catch (error) {
    throw error
  }
}

export async function findById(id) {
  try {
    return await paymentApprovalsRepository.findById(id)
  } catch (error) {
    throw error
  }
}

export async function findAll() {
  try {
    return await paymentApprovalsRepository.findAll()
  } catch (error) {
    throw error
  }
}

export async function update(id, data) {
  try {
    return await paymentApprovalsRepository.update(id, data)
  } catch (error) {
    throw error
  }
}

export async function remove(id) {
  try {
    return await paymentApprovalsRepository.remove(id)
  } catch (error) {
    throw error
  }
}
