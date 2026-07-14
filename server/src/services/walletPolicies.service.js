import * as walletPoliciesRepository from '../repositories/walletPolicies.repository.js'

export async function create(data) {
  try {
    return await walletPoliciesRepository.create(data)
  } catch (error) {
    throw error
  }
}

export async function findById(id) {
  try {
    return await walletPoliciesRepository.findById(id)
  } catch (error) {
    throw error
  }
}

export async function findAll() {
  try {
    return await walletPoliciesRepository.findAll()
  } catch (error) {
    throw error
  }
}

export async function update(id, data) {
  try {
    return await walletPoliciesRepository.update(id, data)
  } catch (error) {
    throw error
  }
}

export async function remove(id) {
  try {
    return await walletPoliciesRepository.remove(id)
  } catch (error) {
    throw error
  }
}
