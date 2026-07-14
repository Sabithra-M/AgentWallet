import { pool } from '../db/index.js'

export async function create({ userId = null, action, entityType, entityId = null, metadata = {} }) {
  try {
    const result = await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, action, entityType, entityId, JSON.stringify(metadata)],
    )
    return result.rows[0]
  } catch (error) {
    throw error
  }
}

export async function findById(id) {
  try {
    const result = await pool.query('SELECT * FROM audit_logs WHERE id = $1', [id])
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}

export async function findAll() {
  try {
    const result = await pool.query('SELECT * FROM audit_logs ORDER BY created_at DESC')
    return result.rows
  } catch (error) {
    throw error
  }
}

// No `update` export: audit_logs has no `updated_at` column and is an
// append-only event trail by design (see migration 0009) — rows are never mutated.

export async function remove(id) {
  try {
    const result = await pool.query('DELETE FROM audit_logs WHERE id = $1 RETURNING *', [id])
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}
