const STATUS_MESSAGES = {
  401: 'Your session has expired. Please sign in again.',
  403: "You don't have permission to do that.",
  404: "We couldn't find what you were looking for.",
  409: 'That action conflicts with the current state — refresh and try again.',
  429: "You're doing that too much. Please wait a moment and try again.",
  500: 'Something went wrong on our end. Please try again shortly.',
  502: 'A service we depend on is temporarily unavailable.',
  503: 'The service is temporarily unavailable. Please try again shortly.',
}

// Turns any error this app can throw (Axios error, Firebase SDK error, plain
// Error) into a short, user-facing message — never surfaces raw error/stack
// text from the server or a third-party SDK.
export function getErrorMessage(error) {
  if (!error) return 'Something went wrong. Please try again.'

  if (error.message === 'Network Error' || (typeof navigator !== 'undefined' && navigator.onLine === false)) {
    return "Can't reach the server. Check your connection and try again."
  }

  const data = error?.response?.data
  const status = error?.response?.status
  if (data) {
    if (Array.isArray(data.details) && data.details.length > 0) {
      return data.details.join(', ')
    }
    // Prefer a specific server-provided message for 4xx (validation/business
    // rules) — fall back to a generic, friendly message per status otherwise.
    if (typeof data.error === 'string' && status >= 400 && status < 500) return data.error
    return STATUS_MESSAGES[status] || data.error || 'Something went wrong. Please try again.'
  }
  if (status && STATUS_MESSAGES[status]) return STATUS_MESSAGES[status]

  // Firebase SDK errors (e.g. from the Google sign-in popup) use { code, message }
  // instead of an axios response.
  if (typeof error?.code === 'string' && error.code.startsWith('auth/')) {
    if (error.code === 'auth/unauthorized-domain') {
      return 'This domain is not authorized for Google sign-in. Contact the site administrator.'
    }
    if (error.code === 'auth/network-request-failed') {
      return 'Network error during Google sign-in. Please check your connection and try again.'
    }
    return 'Google sign-in failed. Please try again.'
  }

  return 'Something went wrong. Please try again.'
}
