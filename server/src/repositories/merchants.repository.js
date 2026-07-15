import { pool } from '../db/index.js'

export async function create({ userId, name, category = null, isVerified = false }) {
  try {
    const result = await pool.query(
      `INSERT INTO merchants (user_id, name, category, is_verified)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, name, category, isVerified],
    )
    return result.rows[0]
  } catch (error) {
    throw error
  }
}

export async function findById(id) {
  try {
    const result = await pool.query('SELECT * FROM merchants WHERE id = $1', [id])
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}

export async function findAll() {
  try {
    const result = await pool.query('SELECT * FROM merchants ORDER BY created_at DESC')
    return result.rows
  } catch (error) {
    throw error
  }
}

export async function findAllByUserId(userId) {
  try {
    const result = await pool.query(
      'SELECT * FROM merchants WHERE user_id = $1 ORDER BY created_at DESC',
      [userId],
    )
    return result.rows
  } catch (error) {
    throw error
  }
}

export async function update(id, { name, category, isVerified } = {}) {
  try {
    const result = await pool.query(
      `UPDATE merchants
       SET name = COALESCE($2, name),
           category = COALESCE($3, category),
           is_verified = COALESCE($4, is_verified)
       WHERE id = $1
       RETURNING *`,
      [id, name ?? null, category ?? null, isVerified ?? null],
    )
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}

export async function remove(id) {
  try {
    const result = await pool.query('DELETE FROM merchants WHERE id = $1 RETURNING *', [id])
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}
