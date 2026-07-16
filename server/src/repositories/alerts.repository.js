import { pool } from '../db/index.js'

export async function create({ userId, paymentRequestId = null, walletId = null, type, title, message, severity }) {
  try {
    const result = await pool.query(
      `INSERT INTO alerts (user_id, payment_request_id, wallet_id, type, title, message, severity)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, paymentRequestId, walletId, type, title, message, severity],
    )
    return result.rows[0]
  } catch (error) {
    throw error
  }
}

export async function findById(id) {
  try {
    const result = await pool.query('SELECT * FROM alerts WHERE id = $1', [id])
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}

export async function findAllByUserId(userId) {
  try {
    const result = await pool.query('SELECT * FROM alerts WHERE user_id = $1 ORDER BY created_at DESC', [userId])
    return result.rows
  } catch (error) {
    throw error
  }
}

export async function countUnreadByUserId(userId) {
  try {
    const result = await pool.query(
      'SELECT count(*) AS total FROM alerts WHERE user_id = $1 AND is_read = false',
      [userId],
    )
    return Number(result.rows[0].total)
  } catch (error) {
    throw error
  }
}

export async function markRead(id, isRead = true) {
  try {
    const result = await pool.query('UPDATE alerts SET is_read = $2 WHERE id = $1 RETURNING *', [id, isRead])
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}

export async function markAllReadForUser(userId) {
  try {
    const result = await pool.query(
      'UPDATE alerts SET is_read = true WHERE user_id = $1 AND is_read = false RETURNING *',
      [userId],
    )
    return result.rows
  } catch (error) {
    throw error
  }
}

export async function remove(id) {
  try {
    const result = await pool.query('DELETE FROM alerts WHERE id = $1 RETURNING *', [id])
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}

export async function removeAllReadForUser(userId) {
  try {
    const result = await pool.query('DELETE FROM alerts WHERE user_id = $1 AND is_read = true RETURNING *', [
      userId,
    ])
    return result.rows
  } catch (error) {
    throw error
  }
}
