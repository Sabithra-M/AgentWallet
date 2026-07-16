import { isUuid, isIsoDateString, isOneOf } from './common.js'

const STATUSES = ['pending', 'approved', 'rejected', 'cancelled', 'expired', 'completed', 'blocked']
const RISK_LEVELS = ['low', 'medium', 'high', 'critical']
const EXPORT_FORMATS = ['csv', 'xlsx', 'pdf']

function validateFilters(query = {}) {
  const errors = []
  if (query.from !== undefined && !isIsoDateString(query.from)) errors.push('from must be a valid ISO date string')
  if (query.to !== undefined && !isIsoDateString(query.to)) errors.push('to must be a valid ISO date string')
  if (query.walletId !== undefined && !isUuid(query.walletId)) errors.push('walletId must be a valid UUID')
  if (query.merchantId !== undefined && !isUuid(query.merchantId)) errors.push('merchantId must be a valid UUID')
  if (query.status !== undefined && !isOneOf(query.status, STATUSES)) {
    errors.push(`status must be one of: ${STATUSES.join(', ')}`)
  }
  if (query.riskLevel !== undefined && !isOneOf(query.riskLevel, RISK_LEVELS)) {
    errors.push(`riskLevel must be one of: ${RISK_LEVELS.join(', ')}`)
  }
  return errors
}

export function validateAnalyticsQuery(query = {}) {
  return validateFilters(query)
}

export function validateExportQuery(query = {}) {
  const errors = validateFilters(query)
  if (!isOneOf(query.format, EXPORT_FORMATS)) {
    errors.push(`format is required and must be one of: ${EXPORT_FORMATS.join(', ')}`)
  }
  return errors
}
