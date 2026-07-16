import { pool } from '../db/index.js'

export async function create({ userId, title, description = null, walletId = null }, client = pool) {
  try {
    const result = await client.query(
      `INSERT INTO notifications (user_id, title, description, wallet_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, title, description, walletId],
    )
    return result.rows[0]
  } catch (error) {
    throw error
  }
}

export async function findById(id) {
  try {
    const result = await pool.query('SELECT * FROM notifications WHERE id = $1', [id])
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}

export async function findAllByUserId(userId) {
  try {
    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [userId],
    )
    return result.rows
  } catch (error) {
    throw error
  }
}

export async function markRead(id, isRead = true) {
  try {
    const result = await pool.query(
      'UPDATE notifications SET is_read = $2 WHERE id = $1 RETURNING *',
      [id, isRead],
    )
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}
