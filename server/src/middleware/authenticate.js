import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization

  // The browser's native EventSource API can't set custom headers, so the
  // SSE stream endpoint is the one place a token arrives via query string
  // instead of Authorization — everywhere else still requires the header.
  let token
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice('Bearer '.length).trim()
  } else if (req.path === '/stream' && typeof req.query.token === 'string') {
    token = req.query.token
  } else {
    return res.status(401).json({ error: 'Authentication required' })
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret)
    req.user = { id: payload.sub, email: payload.email }
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
