import { isUuid, isNumber, isOneOf, isPlainObject, isBoolean } from './common.js'

const POLICY_TYPES = [
  'per_transaction_limit',
  'monthly_limit',
  'merchant_allowlist',
  'merchant_blocklist',
  'category_restriction',
]

export function validateCreate(body = {}) {
  const errors = []
  if (!isUuid(body.walletId)) errors.push('walletId is required and must be a valid UUID')
  if (!isOneOf(body.policyType, POLICY_TYPES)) {
    errors.push(`policyType is required and must be one of: ${POLICY_TYPES.join(', ')}`)
  }
  if (body.thresholdAmount !== undefined && !isNumber(body.thresholdAmount)) {
    errors.push('thresholdAmount must be a number')
  }
  if (body.config !== undefined && !isPlainObject(body.config)) errors.push('config must be an object')
  if (body.isActive !== undefined && !isBoolean(body.isActive)) errors.push('isActive must be a boolean')
  return errors
}

export function validateUpdate(body = {}) {
  const errors = []
  if (body.policyType !== undefined && !isOneOf(body.policyType, POLICY_TYPES)) {
    errors.push(`policyType must be one of: ${POLICY_TYPES.join(', ')}`)
  }
  if (body.thresholdAmount !== undefined && !isNumber(body.thresholdAmount)) {
    errors.push('thresholdAmount must be a number')
  }
  if (body.config !== undefined && !isPlainObject(body.config)) errors.push('config must be an object')
  if (body.isActive !== undefined && !isBoolean(body.isActive)) errors.push('isActive must be a boolean')
  return errors
}
