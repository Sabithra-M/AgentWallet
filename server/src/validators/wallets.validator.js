import { isNonEmptyString, isNumber, isOneOf } from './common.js'

const STATUS_VALUES = ['active', 'paused', 'closed']

export function validateCreate(body = {}) {
  const errors = []
  if (!isNonEmptyString(body.name)) errors.push('name is required and must be a non-empty string')
  if (!isNonEmptyString(body.category)) errors.push('category is required and must be a non-empty string')
  if (body.description !== undefined && typeof body.description !== 'string') errors.push('description must be a string')
  if (body.currency !== undefined && !isNonEmptyString(body.currency)) errors.push('currency must be a non-empty string')
  if (body.balance !== undefined && !isNumber(body.balance)) errors.push('balance must be a number')
  if (body.budget !== undefined && !isNumber(body.budget)) errors.push('budget must be a number')
  if (body.monthlyLimit !== undefined && !isNumber(body.monthlyLimit)) errors.push('monthlyLimit must be a number')
  if (body.status !== undefined && !isOneOf(body.status, STATUS_VALUES)) {
    errors.push(`status must be one of: ${STATUS_VALUES.join(', ')}`)
  }
  return errors
}

export function validateUpdate(body = {}) {
  const errors = []
  if (body.name !== undefined && !isNonEmptyString(body.name)) errors.push('name must be a non-empty string')
  if (body.category !== undefined && !isNonEmptyString(body.category)) errors.push('category must be a non-empty string')
  if (body.description !== undefined && typeof body.description !== 'string') errors.push('description must be a string')
  if (body.currency !== undefined && !isNonEmptyString(body.currency)) errors.push('currency must be a non-empty string')
  if (body.balance !== undefined && !isNumber(body.balance)) errors.push('balance must be a number')
  if (body.budget !== undefined && !isNumber(body.budget)) errors.push('budget must be a number')
  if (body.monthlyLimit !== undefined && !isNumber(body.monthlyLimit)) errors.push('monthlyLimit must be a number')
  if (body.status !== undefined && !isOneOf(body.status, STATUS_VALUES)) {
    errors.push(`status must be one of: ${STATUS_VALUES.join(', ')}`)
  }
  return errors
}
