import { pool } from '../db/index.js'

export async function create({
  paymentRequestId = null,
  walletId,
  merchantId = null,
  amount,
  currency = 'INR',
  type,
  status = 'completed',
  paymentMethod = null,
  transactedAt = null,
}) {
  try {
    const result = await pool.query(
      `INSERT INTO payment_transactions
         (payment_request_id, wallet_id, merchant_id, amount, currency, type, status, payment_method, transacted_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, now()))
       RETURNING *`,
      [paymentRequestId, walletId, merchantId, amount, currency, type, status, paymentMethod, transactedAt],
    )
    return result.rows[0]
  } catch (error) {
    throw error
  }
}

export async function findById(id) {
  try {
    const result = await pool.query('SELECT * FROM payment_transactions WHERE id = $1', [id])
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}

export async function findAll() {
  try {
    const result = await pool.query('SELECT * FROM payment_transactions ORDER BY created_at DESC')
    return result.rows
  } catch (error) {
    throw error
  }
}

export async function update(id, { amount, currency, type, status, paymentMethod, transactedAt } = {}) {
  try {
    const result = await pool.query(
      `UPDATE payment_transactions
       SET amount = COALESCE($2, amount),
           currency = COALESCE($3, currency),
           type = COALESCE($4, type),
           status = COALESCE($5, status),
           payment_method = COALESCE($6, payment_method),
           transacted_at = COALESCE($7, transacted_at)
       WHERE id = $1
       RETURNING *`,
      [
        id,
        amount ?? null,
        currency ?? null,
        type ?? null,
        status ?? null,
        paymentMethod ?? null,
        transactedAt ?? null,
      ],
    )
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}

export async function remove(id) {
  try {
    const result = await pool.query('DELETE FROM payment_transactions WHERE id = $1 RETURNING *', [id])
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}
