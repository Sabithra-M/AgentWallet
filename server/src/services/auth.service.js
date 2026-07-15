import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import * as authRepository from '../repositories/auth.repository.js'
import { env } from '../config/env.js'

const SALT_ROUNDS = 10
const UNIQUE_VIOLATION = '23505'

function sanitizeUser(user) {
  const { password_hash, ...safeUser } = user
  return safeUser
}

export async function register({ name, email, password }) {
  try {
    const existing = await authRepository.findByEmail(email)
    if (existing) {
      const error = new Error('Email is already registered')
      error.status = 409
      throw error
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
    const user = await authRepository.create({ name, email, passwordHash })
    return sanitizeUser(user)
  } catch (error) {
    if (error.code === UNIQUE_VIOLATION) {
      const conflictError = new Error('Email is already registered')
      conflictError.status = 409
      throw conflictError
    }
    throw error
  }
}

export async function login({ email, password }) {
  try {
    const user = await authRepository.findByEmail(email)
    if (!user) {
      const error = new Error('Invalid email or password')
      error.status = 401
      throw error
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash)
    if (!passwordMatches) {
      const error = new Error('Invalid email or password')
      error.status = 401
      throw error
    }

    const token = jwt.sign({ sub: user.id, email: user.email }, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn,
    })

    return { token, user: sanitizeUser(user) }
  } catch (error) {
    throw error
  }
}
