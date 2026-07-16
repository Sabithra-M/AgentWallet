// Strips every field that must never reach a client response — used by
// every path that returns a user row (auth responses, /users/me, and the
// generic /users CRUD endpoints alike).
export function sanitizeUser(user) {
  const { password_hash, reset_token_hash, reset_token_expires_at, ...safeUser } = user
  return safeUser
}
