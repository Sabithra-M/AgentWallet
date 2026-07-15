import { isNonEmptyString, isEmail } from './common.js'

export function validateRegister(body = {}) {
  const errors = []
  if (!isNonEmptyString(body.name)) errors.push('name is required and must be a non-empty string')
  if (!isEmail(body.email)) errors.push('email is required and must be a valid email address')
  if (!isNonEmptyString(body.password) || body.password.length < 8) {
    errors.push('password is required and must be at least 8 characters long')
  }
  return errors
}

export function validateLogin(body = {}) {
  const errors = []
  if (!isEmail(body.email)) errors.push('email is required and must be a valid email address')
  if (!isNonEmptyString(body.password)) errors.push('password is required')
  return errors
}
