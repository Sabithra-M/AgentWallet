import { pool } from '../db/index.js'

export async function findByEmail(email) {
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}

export async function create({ name, email, passwordHash }) {
  try {
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, email, passwordHash],
    )
    return result.rows[0]
  } catch (error) {
    throw error
  }
}

export async function setResetToken(userId, tokenHash, expiresAt) {
  try {
    const result = await pool.query(
      `UPDATE users
       SET reset_token_hash = $2, reset_token_expires_at = $3
       WHERE id = $1
       RETURNING *`,
      [userId, tokenHash, expiresAt],
    )
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}

export async function findByResetTokenHash(tokenHash) {
  try {
    const result = await pool.query(
      `SELECT * FROM users WHERE reset_token_hash = $1 AND reset_token_expires_at > now()`,
      [tokenHash],
    )
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}

export async function resetPassword(userId, passwordHash) {
  try {
    const result = await pool.query(
      `UPDATE users
       SET password_hash = $2, reset_token_hash = NULL, reset_token_expires_at = NULL
       WHERE id = $1
       RETURNING *`,
      [userId, passwordHash],
    )
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}
