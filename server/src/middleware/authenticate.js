import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  const token = authHeader.slice('Bearer '.length).trim()

  try {
    const payload = jwt.verify(token, env.jwtSecret)
    req.user = { id: payload.sub, email: payload.email }
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
