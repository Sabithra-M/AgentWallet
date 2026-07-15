import { isUuid, isNumber, isOneOf, isIsoDateString, isNonEmptyString } from './common.js'

const TYPES = ['debit', 'credit']
const STATUS_VALUES = ['pending', 'completed', 'failed']

export function validateCreate(body = {}) {
  const errors = []
  if (!isUuid(body.walletId)) errors.push('walletId is required and must be a valid UUID')
  if (!isNumber(body.amount) || body.amount <= 0) {
    errors.push('amount is required and must be a number greater than 0')
  }
  if (!isOneOf(body.type, TYPES)) errors.push(`type is required and must be one of: ${TYPES.join(', ')}`)
  if (body.paymentRequestId !== undefined && body.paymentRequestId !== null && !isUuid(body.paymentRequestId)) {
    errors.push('paymentRequestId must be a valid UUID')
  }
  if (body.merchantId !== undefined && body.merchantId !== null && !isUuid(body.merchantId)) {
    errors.push('merchantId must be a valid UUID')
  }
  if (body.currency !== undefined && !isNonEmptyString(body.currency)) errors.push('currency must be a non-empty string')
  if (body.status !== undefined && !isOneOf(body.status, STATUS_VALUES)) {
    errors.push(`status must be one of: ${STATUS_VALUES.join(', ')}`)
  }
  if (body.paymentMethod !== undefined && typeof body.paymentMethod !== 'string') {
    errors.push('paymentMethod must be a string')
  }
  if (body.transactedAt !== undefined && !isIsoDateString(body.transactedAt)) {
    errors.push('transactedAt must be a valid date string')
  }
  return errors
}

export function validateUpdate(body = {}) {
  const errors = []
  if (body.amount !== undefined && (!isNumber(body.amount) || body.amount <= 0)) {
    errors.push('amount must be a number greater than 0')
  }
  if (body.type !== undefined && !isOneOf(body.type, TYPES)) errors.push(`type must be one of: ${TYPES.join(', ')}`)
  if (body.currency !== undefined && !isNonEmptyString(body.currency)) errors.push('currency must be a non-empty string')
  if (body.status !== undefined && !isOneOf(body.status, STATUS_VALUES)) {
    errors.push(`status must be one of: ${STATUS_VALUES.join(', ')}`)
  }
  if (body.paymentMethod !== undefined && typeof body.paymentMethod !== 'string') {
    errors.push('paymentMethod must be a string')
  }
  if (body.transactedAt !== undefined && !isIsoDateString(body.transactedAt)) {
    errors.push('transactedAt must be a valid date string')
  }
  return errors
}
