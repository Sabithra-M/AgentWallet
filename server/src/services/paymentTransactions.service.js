import * as paymentTransactionsRepository from '../repositories/paymentTransactions.repository.js'

export async function create(data) {
  try {
    return await paymentTransactionsRepository.create(data)
  } catch (error) {
    throw error
  }
}

export async function findById(id) {
  try {
    return await paymentTransactionsRepository.findById(id)
  } catch (error) {
    throw error
  }
}

export async function findAll() {
  try {
    return await paymentTransactionsRepository.findAll()
  } catch (error) {
    throw error
  }
}

export async function update(id, data) {
  try {
    return await paymentTransactionsRepository.update(id, data)
  } catch (error) {
    throw error
  }
}

export async function remove(id) {
  try {
    return await paymentTransactionsRepository.remove(id)
  } catch (error) {
    throw error
  }
}
