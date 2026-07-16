// Throws an intentional, operational error carrying an HTTP status — the
// errorHandler trusts err.status as a signal that err.message is safe to
// send to the client (as opposed to an unexpected/programming error, whose
// message may contain internal details and must never reach the response).
export function fail(status, message) {
  const error = new Error(message)
  error.status = status
  throw error
}
