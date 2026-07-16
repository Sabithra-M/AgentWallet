import { isNonEmptyString, isEmail, isBoolean, isNumber, isOneOf, isUuid } from './common.js'

const THEME_VALUES = ['light', 'dark', 'system']

export function validateCreate(body = {}) {
  const errors = []
  if (!isNonEmptyString(body.name)) errors.push('name is required and must be a non-empty string')
  if (!isEmail(body.email)) errors.push('email is required and must be a valid email address')
  if (body.passwordHash !== undefined && typeof body.passwordHash !== 'string') {
    errors.push('passwordHash must be a string')
  }
  if (body.role !== undefined && !isNonEmptyString(body.role)) errors.push('role must be a non-empty string')
  if (body.isActive !== undefined && !isBoolean(body.isActive)) errors.push('isActive must be a boolean')
  return errors
}

export function validateUpdate(body = {}) {
  const errors = []
  if (body.name !== undefined && !isNonEmptyString(body.name)) errors.push('name must be a non-empty string')
  if (body.email !== undefined && !isEmail(body.email)) errors.push('email must be a valid email address')
  if (body.passwordHash !== undefined && typeof body.passwordHash !== 'string') {
    errors.push('passwordHash must be a string')
  }
  if (body.role !== undefined && !isNonEmptyString(body.role)) errors.push('role must be a non-empty string')
  if (body.isActive !== undefined && !isBoolean(body.isActive)) errors.push('isActive must be a boolean')
  return errors
}

export function validateProfileUpdate(body = {}) {
  const errors = []
  if (body.name !== undefined && !isNonEmptyString(body.name)) errors.push('name must be a non-empty string')
  return errors
}

export function validateSettingsUpdate(body = {}) {
  const errors = []
  if (body.theme !== undefined && !isOneOf(body.theme, THEME_VALUES)) {
    errors.push(`theme must be one of: ${THEME_VALUES.join(', ')}`)
  }
  if (body.notificationsEnabled !== undefined && !isBoolean(body.notificationsEnabled)) {
    errors.push('notificationsEnabled must be a boolean')
  }
  if (body.emailAlertsEnabled !== undefined && !isBoolean(body.emailAlertsEnabled)) {
    errors.push('emailAlertsEnabled must be a boolean')
  }
  if (body.pushNotificationsEnabled !== undefined && !isBoolean(body.pushNotificationsEnabled)) {
    errors.push('pushNotificationsEnabled must be a boolean')
  }
  if (body.darkModeEnabled !== undefined && !isBoolean(body.darkModeEnabled)) {
    errors.push('darkModeEnabled must be a boolean')
  }
  if (body.defaultWalletId !== undefined && body.defaultWalletId !== null && !isUuid(body.defaultWalletId)) {
    errors.push('defaultWalletId must be a valid UUID')
  }
  if (
    body.monthlySpendingLimit !== undefined &&
    body.monthlySpendingLimit !== null &&
    (!isNumber(body.monthlySpendingLimit) || body.monthlySpendingLimit < 0)
  ) {
    errors.push('monthlySpendingLimit must be a non-negative number')
  }
  if (body.preferredCurrency !== undefined && !isNonEmptyString(body.preferredCurrency)) {
    errors.push('preferredCurrency must be a non-empty string')
  }
  return errors
}
