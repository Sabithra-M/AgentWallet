import { isNonEmptyString, isEmail, isBoolean } from './common.js'

export function validateCreate(body = {}) {
  const errors = []
  if (!isNonEmptyString(body.name)) errors.push('name is required and must be a non-empty string')
  if (!isEmail(body.email)) errors.push('email is required and must be a valid email address')
  if (body.passwordHash !== undefined && typeof body.passwordHash !== 'string') {
    errors.push('passwordHash must be a string')
  }
  if (body.role !== undefined && !isNonEmptyString(body.role)) errors.push('role must be a non-empty string')
  if (body.isActive !== undefined && !isBoolean(body.isActive)) errors.push('isActive must be a boolean')
  return errors
}

export function validateUpdate(body = {}) {
  const errors = []
  if (body.name !== undefined && !isNonEmptyString(body.name)) errors.push('name must be a non-empty string')
  if (body.email !== undefined && !isEmail(body.email)) errors.push('email must be a valid email address')
  if (body.passwordHash !== undefined && typeof body.passwordHash !== 'string') {
    errors.push('passwordHash must be a string')
  }
  if (body.role !== undefined && !isNonEmptyString(body.role)) errors.push('role must be a non-empty string')
  if (body.isActive !== undefined && !isBoolean(body.isActive)) errors.push('isActive must be a boolean')
  return errors
}
