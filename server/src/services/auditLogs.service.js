import * as auditLogsRepository from '../repositories/auditLogs.repository.js'

function fail(status, message) {
  const error = new Error(message)
  error.status = status
  throw error
}

export async function create(userId, data) {
  try {
    return await auditLogsRepository.create({ ...data, userId })
  } catch (error) {
    throw error
  }
}

export async function findById(id, userId) {
  try {
    const log = await auditLogsRepository.findById(id)
    if (!log) return null
    if (log.user_id !== userId) fail(403, 'You do not have access to this audit log')
    return log
  } catch (error) {
    throw error
  }
}

export async function findAll(userId) {
  try {
    return await auditLogsRepository.findAllByUserId(userId)
  } catch (error) {
    throw error
  }
}

// No `update`: auditLogs.repository.js exports none, since audit_logs is an
// append-only event trail with no `updated_at` column (see migration 0009).

export async function remove(id, userId) {
  try {
    const log = await auditLogsRepository.findById(id)
    if (!log) return null
    if (log.user_id !== userId) fail(403, 'You do not have access to this audit log')
    return await auditLogsRepository.remove(id)
  } catch (error) {
    throw error
  }
}
