import { pool } from '../db/index.js'

export async function create({ paymentRequestId, eventType, message }, client = pool) {
  try {
    const result = await client.query(
      `INSERT INTO payment_timeline_events (payment_request_id, event_type, message)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [paymentRequestId, eventType, message],
    )
    return result.rows[0]
  } catch (error) {
    throw error
  }
}

export async function findAllByPaymentRequestId(paymentRequestId) {
  try {
    const result = await pool.query(
      'SELECT * FROM payment_timeline_events WHERE payment_request_id = $1 ORDER BY created_at ASC',
      [paymentRequestId],
    )
    return result.rows
  } catch (error) {
    throw error
  }
}
