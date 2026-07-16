export function notFoundHandler(req, res) {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` })
}

// err.status set means the error was thrown intentionally via fail() (or an
// equivalent explicit assignment, e.g. the Gemini client) — its message is
// safe to send as-is. Anything else is an unexpected/programming error (a
// raw pg error, a bug, etc.) whose message may contain internal details —
// only a generic message ever reaches the client for those; the real error
// (with stack trace) is still logged server-side for debugging.
export function errorHandler(err, req, res, next) {
  console.error(err)
  const isOperational = typeof err.status === 'number'
  const status = isOperational ? err.status : 500
  const message = isOperational ? err.message : 'Internal server error'
  res.status(status).json({ error: message })
}
