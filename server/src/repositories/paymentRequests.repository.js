import { pool } from '../db/index.js'

export async function create({
  walletId,
  merchantId,
  requestedBy,
  amount,
  purpose = null,
  aiConfidence = null,
  riskLevel = 'low',
  status = 'pending',
}) {
  try {
    const result = await pool.query(
      `INSERT INTO payment_requests (wallet_id, merchant_id, requested_by, amount, purpose, ai_confidence, risk_level, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [walletId, merchantId, requestedBy, amount, purpose, aiConfidence, riskLevel, status],
    )
    return result.rows[0]
  } catch (error) {
    throw error
  }
}

export async function findById(id) {
  try {
    const result = await pool.query('SELECT * FROM payment_requests WHERE id = $1', [id])
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}

export async function findAll() {
  try {
    const result = await pool.query('SELECT * FROM payment_requests ORDER BY created_at DESC')
    return result.rows
  } catch (error) {
    throw error
  }
}

export async function update(id, { amount, purpose, aiConfidence, riskLevel, status } = {}) {
  try {
    const result = await pool.query(
      `UPDATE payment_requests
       SET amount = COALESCE($2, amount),
           purpose = COALESCE($3, purpose),
           ai_confidence = COALESCE($4, ai_confidence),
           risk_level = COALESCE($5, risk_level),
           status = COALESCE($6, status)
       WHERE id = $1
       RETURNING *`,
      [id, amount ?? null, purpose ?? null, aiConfidence ?? null, riskLevel ?? null, status ?? null],
    )
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}

export async function remove(id) {
  try {
    const result = await pool.query('DELETE FROM payment_requests WHERE id = $1 RETURNING *', [id])
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}
