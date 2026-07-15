import { pool } from '../db/index.js'

export async function create(
  { paymentRequestId, decidedBy = null, decision, reason = null, decidedAt = null },
  client = pool,
) {
  try {
    const result = await client.query(
      `INSERT INTO payment_approvals (payment_request_id, decided_by, decision, reason, decided_at)
       VALUES ($1, $2, $3, $4, COALESCE($5, now()))
       RETURNING *`,
      [paymentRequestId, decidedBy, decision, reason, decidedAt],
    )
    return result.rows[0]
  } catch (error) {
    throw error
  }
}

export async function findById(id) {
  try {
    const result = await pool.query('SELECT * FROM payment_approvals WHERE id = $1', [id])
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}

export async function findAll() {
  try {
    const result = await pool.query('SELECT * FROM payment_approvals ORDER BY created_at DESC')
    return result.rows
  } catch (error) {
    throw error
  }
}

export async function findAllByRequestedBy(userId) {
  try {
    const result = await pool.query(
      `SELECT pa.*
       FROM payment_approvals pa
       JOIN payment_requests pr ON pa.payment_request_id = pr.id
       WHERE pr.requested_by = $1
       ORDER BY pa.created_at DESC`,
      [userId],
    )
    return result.rows
  } catch (error) {
    throw error
  }
}

export async function update(id, { decision, reason, decidedAt } = {}) {
  try {
    const result = await pool.query(
      `UPDATE payment_approvals
       SET decision = COALESCE($2, decision),
           reason = COALESCE($3, reason),
           decided_at = COALESCE($4, decided_at)
       WHERE id = $1
       RETURNING *`,
      [id, decision ?? null, reason ?? null, decidedAt ?? null],
    )
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}

export async function remove(id) {
  try {
    const result = await pool.query('DELETE FROM payment_approvals WHERE id = $1 RETURNING *', [id])
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}
