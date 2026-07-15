import { isNonEmptyString, isBoolean } from './common.js'

export function validateCreate(body = {}) {
  const errors = []
  if (!isNonEmptyString(body.name)) errors.push('name is required and must be a non-empty string')
  if (body.category !== undefined && !isNonEmptyString(body.category)) errors.push('category must be a non-empty string')
  if (body.isVerified !== undefined && !isBoolean(body.isVerified)) errors.push('isVerified must be a boolean')
  return errors
}

export function validateUpdate(body = {}) {
  const errors = []
  if (body.name !== undefined && !isNonEmptyString(body.name)) errors.push('name must be a non-empty string')
  if (body.category !== undefined && !isNonEmptyString(body.category)) errors.push('category must be a non-empty string')
  if (body.isVerified !== undefined && !isBoolean(body.isVerified)) errors.push('isVerified must be a boolean')
  return errors
}
