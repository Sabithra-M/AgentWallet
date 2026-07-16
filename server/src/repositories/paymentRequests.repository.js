import { pool } from '../db/index.js'

export async function create(
  {
    walletId,
    merchantId,
    requestedBy,
    amount,
    purpose = null,
    aiConfidence = null,
    riskLevel = 'low',
    status = 'pending',
    category = null,
    currency = 'INR',
    aiReason = null,
    evaluationResult = null,
    blockReason = null,
    evaluationTime = null,
    remainingBudgetAfter = null,
    riskScore = null,
    riskFactors = null,
  },
  client = pool,
) {
  try {
    const result = await client.query(
      `INSERT INTO payment_requests (
         wallet_id, merchant_id, requested_by, amount, purpose, ai_confidence, risk_level, status,
         category, currency, ai_reason, evaluation_result, block_reason, evaluation_time, remaining_budget_after,
         risk_score, risk_factors
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       RETURNING *`,
      [
        walletId,
        merchantId,
        requestedBy,
        amount,
        purpose,
        aiConfidence,
        riskLevel,
        status,
        category,
        currency,
        aiReason,
        evaluationResult,
        blockReason,
        evaluationTime,
        remainingBudgetAfter,
        riskScore,
        riskFactors === null ? null : JSON.stringify(riskFactors),
      ],
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

// Locks the row for the duration of the caller's transaction. Only meaningful
// when `client` is a checked-out client already inside a BEGIN/COMMIT block
// (see approvePayment/rejectPayment below).
export async function findByIdForUpdate(id, client = pool) {
  try {
    const result = await client.query('SELECT * FROM payment_requests WHERE id = $1 FOR UPDATE', [id])
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

export async function findAllByRequestedBy(userId) {
  try {
    const result = await pool.query(
      'SELECT * FROM payment_requests WHERE requested_by = $1 ORDER BY created_at DESC',
      [userId],
    )
    return result.rows
  } catch (error) {
    throw error
  }
}

export async function findAllByWalletId(walletId) {
  try {
    const result = await pool.query(
      'SELECT * FROM payment_requests WHERE wallet_id = $1 ORDER BY created_at DESC',
      [walletId],
    )
    return result.rows
  } catch (error) {
    throw error
  }
}

// Sums approved spend on a wallet since a given timestamp — used by the
// Policy Evaluation Engine to check daily/monthly limits.
export async function sumApprovedAmountSince(walletId, since, client = pool) {
  try {
    const result = await client.query(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM payment_requests
       WHERE wallet_id = $1 AND status = 'approved' AND created_at >= $2`,
      [walletId, since],
    )
    return Number(result.rows[0].total)
  } catch (error) {
    throw error
  }
}

// How many times this merchant has already been approved for this user —
// the Risk Engine's trusted/new merchant signal.
export async function countApprovedByMerchant(userId, merchantId, client = pool) {
  try {
    const result = await client.query(
      `SELECT count(*) AS total FROM payment_requests
       WHERE requested_by = $1 AND merchant_id = $2 AND status = 'approved'`,
      [userId, merchantId],
    )
    return Number(result.rows[0].total)
  } catch (error) {
    throw error
  }
}

// How many blocked requests this wallet has racked up recently — the Risk
// Engine's "repeated failures" signal.
export async function countBlockedSince(walletId, since, client = pool) {
  try {
    const result = await client.query(
      `SELECT count(*) AS total FROM payment_requests
       WHERE wallet_id = $1 AND status = 'blocked' AND created_at >= $2`,
      [walletId, since],
    )
    return Number(result.rows[0].total)
  } catch (error) {
    throw error
  }
}

export async function update(id, { amount, purpose, aiConfidence, riskLevel, status } = {}, client = pool) {
  try {
    const result = await client.query(
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
