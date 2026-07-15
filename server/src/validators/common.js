export function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

export function isUuid(value) {
  return (
    typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  )
}

export function isEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function isNumber(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

export function isBoolean(value) {
  return typeof value === 'boolean'
}

export function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isOneOf(value, allowed) {
  return allowed.includes(value)
}

export function isIsoDateString(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}
