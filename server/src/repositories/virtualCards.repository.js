import { pool } from '../db/index.js'

export async function create(
  {
    userId,
    paymentRequestId,
    walletId,
    merchantId,
    cardNumber,
    cardHolder,
    cvv,
    expiryMonth,
    expiryYear,
    spendingLimit,
    currency = 'INR',
    expiresAt,
  },
  client = pool,
) {
  try {
    const result = await client.query(
      `INSERT INTO virtual_cards (
         user_id, payment_request_id, wallet_id, merchant_id, card_number, card_holder, cvv,
         expiry_month, expiry_year, spending_limit, currency, expires_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        userId,
        paymentRequestId,
        walletId,
        merchantId,
        cardNumber,
        cardHolder,
        cvv,
        expiryMonth,
        expiryYear,
        spendingLimit,
        currency,
        expiresAt,
      ],
    )
    return result.rows[0]
  } catch (error) {
    throw error
  }
}

export async function findById(id) {
  try {
    const result = await pool.query('SELECT * FROM virtual_cards WHERE id = $1', [id])
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}

// Locks the row for the duration of the caller's transaction — used when
// deciding whether the card can be used, so two concurrent "use" requests for
// the same card can't both succeed.
export async function findByIdForUpdate(id, client = pool) {
  try {
    const result = await client.query('SELECT * FROM virtual_cards WHERE id = $1 FOR UPDATE', [id])
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}

export async function findAllByUserId(userId) {
  try {
    const result = await pool.query(
      'SELECT * FROM virtual_cards WHERE user_id = $1 ORDER BY created_at DESC',
      [userId],
    )
    return result.rows
  } catch (error) {
    throw error
  }
}

export async function markExpired(id, client = pool) {
  try {
    const result = await client.query(
      `UPDATE virtual_cards SET status = 'expired' WHERE id = $1 AND status = 'active' RETURNING *`,
      [id],
    )
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}

export async function markUsed(id, client = pool) {
  try {
    const result = await client.query(
      `UPDATE virtual_cards SET status = 'used', used_at = now() WHERE id = $1 RETURNING *`,
      [id],
    )
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}
