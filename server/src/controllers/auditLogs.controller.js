import * as auditLogsService from '../services/auditLogs.service.js'

export async function create(req, res, next) {
  try {
    const auditLog = await auditLogsService.create(req.body)
    res.status(201).json(auditLog)
  } catch (error) {
    next(error)
  }
}

export async function findById(req, res, next) {
  try {
    const auditLog = await auditLogsService.findById(req.params.id)
    if (!auditLog) {
      return res.status(404).json({ error: 'Resource not found' })
    }
    res.status(200).json(auditLog)
  } catch (error) {
    next(error)
  }
}

export async function findAll(req, res, next) {
  try {
    const auditLogs = await auditLogsService.findAll()
    res.status(200).json(auditLogs)
  } catch (error) {
    next(error)
  }
}

// No `update`: auditLogsService exports none, since audit_logs is an
// append-only event trail with no `updated_at` column (see migration 0009).

export async function remove(req, res, next) {
  try {
    const auditLog = await auditLogsService.remove(req.params.id)
    if (!auditLog) {
      return res.status(404).json({ error: 'Resource not found' })
    }
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
