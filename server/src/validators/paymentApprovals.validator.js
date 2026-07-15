import { isUuid, isOneOf, isIsoDateString } from './common.js'

const DECISIONS = ['approved', 'rejected']

export function validateCreate(body = {}) {
  const errors = []
  if (!isUuid(body.paymentRequestId)) errors.push('paymentRequestId is required and must be a valid UUID')
  if (!isOneOf(body.decision, DECISIONS)) {
    errors.push(`decision is required and must be one of: ${DECISIONS.join(', ')}`)
  }
  if (body.reason !== undefined && typeof body.reason !== 'string') errors.push('reason must be a string')
  if (body.decidedAt !== undefined && !isIsoDateString(body.decidedAt)) {
    errors.push('decidedAt must be a valid date string')
  }
  return errors
}

export function validateUpdate(body = {}) {
  const errors = []
  if (body.decision !== undefined && !isOneOf(body.decision, DECISIONS)) {
    errors.push(`decision must be one of: ${DECISIONS.join(', ')}`)
  }
  if (body.reason !== undefined && typeof body.reason !== 'string') errors.push('reason must be a string')
  if (body.decidedAt !== undefined && !isIsoDateString(body.decidedAt)) {
    errors.push('decidedAt must be a valid date string')
  }
  return errors
}
