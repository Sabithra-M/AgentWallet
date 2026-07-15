import { isUuid, isNonEmptyString, isPlainObject } from './common.js'

export function validateCreate(body = {}) {
  const errors = []
  if (!isNonEmptyString(body.action)) errors.push('action is required and must be a non-empty string')
  if (!isNonEmptyString(body.entityType)) errors.push('entityType is required and must be a non-empty string')
  if (body.entityId !== undefined && body.entityId !== null && !isUuid(body.entityId)) {
    errors.push('entityId must be a valid UUID')
  }
  if (body.metadata !== undefined && !isPlainObject(body.metadata)) errors.push('metadata must be an object')
  return errors
}

// No `validateUpdate`: audit_logs has no PUT route (append-only, see routes/auditLogs.routes.js).
