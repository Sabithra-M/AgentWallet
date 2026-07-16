import crypto from 'node:crypto'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import * as authRepository from '../repositories/auth.repository.js'
import * as walletsService from './wallets.service.js'
import { sendMail } from '../integrations/email/mailer.js'
import { verifyGoogleIdToken } from '../integrations/firebase/admin.js'
import { env } from '../config/env.js'
import { sanitizeUser } from '../utils/sanitizeUser.js'

const SALT_ROUNDS = 10
const UNIQUE_VIOLATION = '23505'
const RESET_TOKEN_BYTES = 32
const RESET_TOKEN_TTL_MINUTES = 30
const GENERIC_FORGOT_PASSWORD_MESSAGE = 'If an account exists for that email, a password reset link has been sent.'

// Every new account gets a zero-balance Main Wallet immediately — this is
// what the Dashboard's Main Wallet card and Add Money flow operate on.
async function createMainWallet(userId) {
  await walletsService.create(userId, {
    name: 'Main Wallet',
    category: 'main',
    balance: 0,
    isMain: true,
  })
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function issueToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, env.jwtSecret, { expiresIn: env.jwtExpiresIn })
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
    await createMainWallet(user.id)
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

    // A missing user and a Google-only account (no password_hash) must produce
    // the exact same error — otherwise this endpoint could be used to find out
    // which accounts exist, or which ones were created via Google.
    if (!user || !user.password_hash) {
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

    return { token: issueToken(user), user: sanitizeUser(user) }
  } catch (error) {
    throw error
  }
}

export async function loginWithGoogle({ idToken }) {
  try {
    if (!idToken) {
      const error = new Error('idToken is required')
      error.status = 400
      throw error
    }

    let decoded
    try {
      decoded = await verifyGoogleIdToken(idToken)
    } catch (verifyError) {
      // A configuration error (e.g. Firebase Admin credentials missing) already
      // has its own status/message and should propagate as-is, not be masked
      // as a generic client-side "invalid token" — that would hide a real
      // server misconfiguration behind a misleading 401.
      if (verifyError.status) throw verifyError
      const error = new Error('Invalid or expired Google ID token')
      error.status = 401
      throw error
    }

    if (!decoded.email) {
      const error = new Error('Google account has no email address')
      error.status = 400
      throw error
    }

    let user = await authRepository.findByEmail(decoded.email)

    if (!user) {
      user = await authRepository.create({
        name: decoded.name || decoded.email.split('@')[0],
        email: decoded.email,
        passwordHash: null,
      })
      await createMainWallet(user.id)
    }

    return { token: issueToken(user), user: sanitizeUser(user) }
  } catch (error) {
    throw error
  }
}

export async function forgotPassword({ email }) {
  try {
    const user = await authRepository.findByEmail(email)

    // Always return the same generic message whether or not the email is
    // registered — this prevents the endpoint from being used to discover
    // which emails have accounts.
    if (!user) {
      return { message: GENERIC_FORGOT_PASSWORD_MESSAGE }
    }

    const rawToken = crypto.randomBytes(RESET_TOKEN_BYTES).toString('hex')
    const tokenHash = hashToken(rawToken)
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000)

    await authRepository.setResetToken(user.id, tokenHash, expiresAt)

    const resetLink = `${env.clientAppUrl}/reset-password?token=${rawToken}`

    await sendMail({
      to: user.email,
      subject: 'Reset your AgentWallet password',
      text: `Hi ${user.name},\n\nWe received a request to reset your AgentWallet password. This link expires in ${RESET_TOKEN_TTL_MINUTES} minutes:\n\n${resetLink}\n\nIf you didn't request this, you can safely ignore this email.`,
      html: `<p>Hi ${user.name},</p><p>We received a request to reset your AgentWallet password. This link expires in ${RESET_TOKEN_TTL_MINUTES} minutes:</p><p><a href="${resetLink}">${resetLink}</a></p><p>If you didn't request this, you can safely ignore this email.</p>`,
    })

    return { message: GENERIC_FORGOT_PASSWORD_MESSAGE }
  } catch (error) {
    throw error
  }
}

export async function resetPassword({ token, password }) {
  try {
    const tokenHash = hashToken(token)
    const user = await authRepository.findByResetTokenHash(tokenHash)
    if (!user) {
      const error = new Error('Invalid or expired reset token')
      error.status = 400
      throw error
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
    await authRepository.resetPassword(user.id, passwordHash)

    return { message: 'Password has been reset successfully' }
  } catch (error) {
    throw error
  }
}
