import * as auditLogsRepository from '../repositories/auditLogs.repository.js'

export async function create(data) {
  try {
    return await auditLogsRepository.create(data)
  } catch (error) {
    throw error
  }
}

export async function findById(id) {
  try {
    return await auditLogsRepository.findById(id)
  } catch (error) {
    throw error
  }
}

export async function findAll() {
  try {
    return await auditLogsRepository.findAll()
  } catch (error) {
    throw error
  }
}

// No `update`: auditLogs.repository.js exports none, since audit_logs is an
// append-only event trail with no `updated_at` column (see migration 0009).

export async function remove(id) {
  try {
    return await auditLogsRepository.remove(id)
  } catch (error) {
    throw error
  }
}
