import { isNumber, isBoolean, isUuid } from './common.js'

function isPositiveNumber(value) {
  return isNumber(value) && value > 0
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string' && item.trim().length > 0)
}

function isUuidArray(value) {
  return Array.isArray(value) && value.every((item) => isUuid(item))
}

function hasDuplicates(values) {
  return new Set(values).size !== values.length
}

export function validateSave(body = {}) {
  const errors = []

  if (!isPositiveNumber(body.maxWalletBudget)) {
    errors.push('Maximum Wallet Budget is required and must be greater than 0')
  }
  if (!isPositiveNumber(body.maxPerTransaction)) {
    errors.push('Maximum Per Transaction is required and must be greater than 0')
  }
  if (!isPositiveNumber(body.dailyTransactionLimit)) {
    errors.push('Daily Transaction Limit is required and must be greater than 0')
  }
  if (!isPositiveNumber(body.monthlyTransactionLimit)) {
    errors.push('Monthly Transaction Limit is required and must be greater than 0')
  }
  if (!isPositiveNumber(body.pinRequiredAbove)) {
    errors.push('PIN threshold is required and must be greater than 0')
  }

  if (isPositiveNumber(body.maxWalletBudget) && isPositiveNumber(body.maxPerTransaction)) {
    if (body.maxPerTransaction > body.maxWalletBudget) {
      errors.push('Maximum Per Transaction cannot exceed the Maximum Wallet Budget')
    }
  }
  if (isPositiveNumber(body.maxWalletBudget) && isPositiveNumber(body.dailyTransactionLimit)) {
    if (body.dailyTransactionLimit > body.maxWalletBudget) {
      errors.push('Daily Transaction Limit cannot exceed the Maximum Wallet Budget')
    }
  }
  if (isPositiveNumber(body.maxWalletBudget) && isPositiveNumber(body.monthlyTransactionLimit)) {
    if (body.monthlyTransactionLimit > body.maxWalletBudget) {
      errors.push('Monthly Transaction Limit cannot exceed the Maximum Wallet Budget')
    }
  }

  const allowedMerchantIds = body.allowedMerchantIds ?? []
  if (!isUuidArray(allowedMerchantIds)) {
    errors.push('Allowed Merchants must be a list of valid merchant IDs')
  } else if (hasDuplicates(allowedMerchantIds)) {
    errors.push('Allowed Merchants cannot contain duplicate entries')
  }

  const blockedCategories = body.blockedCategories ?? []
  if (blockedCategories.length > 0 && !isStringArray(blockedCategories)) {
    errors.push('Blocked Categories must be a list of non-empty strings')
  } else if (hasDuplicates(blockedCategories.map((category) => category.toLowerCase()))) {
    errors.push('Blocked Categories cannot contain duplicate entries')
  }

  const allowedCountries = body.allowedCountries ?? []
  if (allowedCountries.length > 0 && !isStringArray(allowedCountries)) {
    errors.push('Allowed Countries must be a list of non-empty strings')
  }

  if (body.autoExpireWithWallet !== undefined && !isBoolean(body.autoExpireWithWallet)) {
    errors.push('autoExpireWithWallet must be a boolean')
  }
  if (body.isEnabled !== undefined && !isBoolean(body.isEnabled)) {
    errors.push('isEnabled must be a boolean')
  }

  return errors
}
