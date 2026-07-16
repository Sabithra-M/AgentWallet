import { isNumber, isNonEmptyString } from './common.js'

export function validateUse(body = {}) {
  const errors = []
  if (!isNonEmptyString(body.merchant)) errors.push('merchant is required and must be a non-empty string')
  if (!isNumber(body.amount) || body.amount <= 0) errors.push('amount is required and must be a number greater than 0')
  return errors
}
