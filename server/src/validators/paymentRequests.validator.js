import { isUuid, isNumber, isOneOf } from './common.js'

const RISK_LEVELS = ['low', 'medium', 'high']
const STATUS_VALUES = ['pending', 'approved', 'rejected', 'cancelled', 'expired']

export function validateCreate(body = {}) {
  const errors = []
  if (!isUuid(body.walletId)) errors.push('walletId is required and must be a valid UUID')
  if (!isUuid(body.merchantId)) errors.push('merchantId is required and must be a valid UUID')
  if (!isUuid(body.requestedBy)) errors.push('requestedBy is required and must be a valid UUID')
  if (!isNumber(body.amount) || body.amount <= 0) {
    errors.push('amount is required and must be a number greater than 0')
  }
  if (body.purpose !== undefined && typeof body.purpose !== 'string') errors.push('purpose must be a string')
  if (
    body.aiConfidence !== undefined &&
    (!isNumber(body.aiConfidence) || body.aiConfidence < 0 || body.aiConfidence > 100)
  ) {
    errors.push('aiConfidence must be a number between 0 and 100')
  }
  if (body.riskLevel !== undefined && !isOneOf(body.riskLevel, RISK_LEVELS)) {
    errors.push(`riskLevel must be one of: ${RISK_LEVELS.join(', ')}`)
  }
  if (body.status !== undefined && !isOneOf(body.status, STATUS_VALUES)) {
    errors.push(`status must be one of: ${STATUS_VALUES.join(', ')}`)
  }
  return errors
}

export function validateUpdate(body = {}) {
  const errors = []
  if (body.amount !== undefined && (!isNumber(body.amount) || body.amount <= 0)) {
    errors.push('amount must be a number greater than 0')
  }
  if (body.purpose !== undefined && typeof body.purpose !== 'string') errors.push('purpose must be a string')
  if (
    body.aiConfidence !== undefined &&
    (!isNumber(body.aiConfidence) || body.aiConfidence < 0 || body.aiConfidence > 100)
  ) {
    errors.push('aiConfidence must be a number between 0 and 100')
  }
  if (body.riskLevel !== undefined && !isOneOf(body.riskLevel, RISK_LEVELS)) {
    errors.push(`riskLevel must be one of: ${RISK_LEVELS.join(', ')}`)
  }
  if (body.status !== undefined && !isOneOf(body.status, STATUS_VALUES)) {
    errors.push(`status must be one of: ${STATUS_VALUES.join(', ')}`)
  }
  return errors
}
