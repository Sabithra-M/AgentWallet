import * as usersRepository from '../repositories/users.repository.js'

export async function create(data) {
  try {
    return await usersRepository.create(data)
  } catch (error) {
    throw error
  }
}

export async function findById(id) {
  try {
    return await usersRepository.findById(id)
  } catch (error) {
    throw error
  }
}

export async function findAll() {
  try {
    return await usersRepository.findAll()
  } catch (error) {
    throw error
  }
}

export async function update(id, data) {
  try {
    return await usersRepository.update(id, data)
  } catch (error) {
    throw error
  }
}

export async function updateSettings(id, data) {
  try {
    return await usersRepository.updateSettings(id, data)
  } catch (error) {
    throw error
  }
}

export async function remove(id) {
  try {
    return await usersRepository.remove(id)
  } catch (error) {
    throw error
  }
}
