import { isNonEmptyString, isNumber, isOneOf, isIsoDateString } from './common.js'

const STATUS_VALUES = ['active', 'paused', 'closed']
// 'main' and 'ai' are assigned only by the server (Main Wallet auto-creation,
// POST /wallets/ai) — never accepted through the generic create/update body.
const RESERVED_CATEGORIES = ['main', 'ai']

export function validateCreate(body = {}) {
  const errors = []
  if (!isNonEmptyString(body.name)) errors.push('name is required and must be a non-empty string')
  if (!isNonEmptyString(body.category)) errors.push('category is required and must be a non-empty string')
  else if (isOneOf(body.category, RESERVED_CATEGORIES)) {
    errors.push(`category "${body.category}" is reserved and cannot be set directly`)
  }
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

export function validateAddMoney(body = {}) {
  const errors = []
  if (!isNumber(body.amount) || body.amount <= 0) {
    errors.push('amount is required and must be a number greater than 0')
  }
  return errors
}

export function validateCreateAiWallet(body = {}) {
  const errors = []
  if (!isNonEmptyString(body.name)) errors.push('name is required and must be a non-empty string')
  if (!isNumber(body.budget) || body.budget <= 0) errors.push('budget is required and must be a number greater than 0')
  if (body.description !== undefined && typeof body.description !== 'string') errors.push('description must be a string')
  if (!isIsoDateString(body.expiresAt)) {
    errors.push('expiresAt is required and must be a valid date')
  } else if (Date.parse(body.expiresAt) <= Date.now()) {
    errors.push('expiresAt must be in the future')
  }
  return errors
}

export function validateUpdate(body = {}) {
  const errors = []
  if (body.name !== undefined && !isNonEmptyString(body.name)) errors.push('name must be a non-empty string')
  if (body.category !== undefined) {
    if (!isNonEmptyString(body.category)) errors.push('category must be a non-empty string')
    else if (isOneOf(body.category, RESERVED_CATEGORIES)) {
      errors.push(`category "${body.category}" is reserved and cannot be set directly`)
    }
  }
  if (body.description !== undefined && typeof body.description !== 'string') errors.push('description must be a string')
  if (body.currency !== undefined && !isNonEmptyString(body.currency)) errors.push('currency must be a non-empty string')
  if (body.balance !== undefined && !isNumber(body.balance)) errors.push('balance must be a number')
  if (body.budget !== undefined && !isNumber(body.budget)) errors.push('budget must be a number')
  if (body.monthlyLimit !== undefined && !isNumber(body.monthlyLimit)) errors.push('monthlyLimit must be a number')
  if (body.status !== undefined && !isOneOf(body.status, STATUS_VALUES)) {
    errors.push(`status must be one of: ${STATUS_VALUES.join(', ')}`)
  }
  if (body.expiresAt !== undefined && body.expiresAt !== null && !isIsoDateString(body.expiresAt)) {
    errors.push('expiresAt must be a valid date')
  }
  return errors
}
