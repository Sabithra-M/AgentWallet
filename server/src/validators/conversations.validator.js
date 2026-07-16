import { isNonEmptyString, isUuid, isBoolean, isOneOf } from './common.js'

const SORT_VALUES = ['newest', 'oldest', 'updated']
const EXPORT_FORMATS = ['txt', 'markdown', 'json']
const STATS_RANGES = ['today', '7d', '30d', 'all']

function isPositiveIntegerString(value) {
  return typeof value === 'string' && /^\d+$/.test(value) && Number(value) > 0
}

export function validateCreate(body = {}) {
  const errors = []
  if (body.title !== undefined && !isNonEmptyString(body.title)) errors.push('title must be a non-empty string')
  return errors
}

export function validateMessage(body = {}) {
  const errors = []
  if (!isNonEmptyString(body.content)) errors.push('content is required and must be a non-empty string')
  return errors
}

export function validateListQuery(query = {}) {
  const errors = []
  if (query.page !== undefined && !isPositiveIntegerString(query.page)) errors.push('page must be a positive integer')
  if (query.limit !== undefined && !isPositiveIntegerString(query.limit)) errors.push('limit must be a positive integer')
  if (query.limit !== undefined && Number(query.limit) > 100) errors.push('limit must not exceed 100')
  if (query.sort !== undefined && !isOneOf(query.sort, SORT_VALUES)) {
    errors.push(`sort must be one of: ${SORT_VALUES.join(', ')}`)
  }
  if (query.includeArchived !== undefined && !isOneOf(query.includeArchived, ['true', 'false'])) {
    errors.push('includeArchived must be "true" or "false"')
  }
  return errors
}

export function validateStatsQuery(query = {}) {
  const errors = []
  if (query.range !== undefined && !isOneOf(query.range, STATS_RANGES)) {
    errors.push(`range must be one of: ${STATS_RANGES.join(', ')}`)
  }
  return errors
}

export function validateUpdate(body = {}) {
  const errors = []
  if (body.title !== undefined && !isNonEmptyString(body.title)) errors.push('title must be a non-empty string')
  if (body.archived !== undefined && !isBoolean(body.archived)) errors.push('archived must be a boolean')
  if (body.title === undefined && body.archived === undefined) {
    errors.push('at least one of title or archived is required')
  }
  return errors
}

export function validateBulkDelete(body = {}) {
  const errors = []
  const hasIds = body.ids !== undefined
  const hasAll = body.all !== undefined

  if (!hasIds && !hasAll) {
    errors.push('either ids or all is required')
    return errors
  }

  if (hasAll && body.all !== true) errors.push('all must be true when provided')

  if (hasIds && !hasAll) {
    if (!Array.isArray(body.ids) || body.ids.length === 0) {
      errors.push('ids must be a non-empty array')
    } else if (!body.ids.every(isUuid)) {
      errors.push('ids must all be valid UUIDs')
    }
  }

  return errors
}

export function validateExport(body = {}) {
  const errors = []
  if (!isOneOf(body.format, EXPORT_FORMATS)) {
    errors.push(`format is required and must be one of: ${EXPORT_FORMATS.join(', ')}`)
  }
  return errors
}
