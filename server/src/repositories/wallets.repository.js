import { pool } from '../db/index.js'

export async function create(
  {
    userId,
    name,
    category,
    description = null,
    currency = 'INR',
    balance = 0,
    budget = 0,
    monthlyLimit = 0,
    status = 'active',
    isMain = false,
    expiresAt = null,
  },
  client = pool,
) {
  try {
    const result = await client.query(
      `INSERT INTO wallets (user_id, name, category, description, currency, balance, budget, monthly_limit, status, is_main, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [userId, name, category, description, currency, balance, budget, monthlyLimit, status, isMain, expiresAt],
    )
    return result.rows[0]
  } catch (error) {
    throw error
  }
}

export async function findById(id) {
  try {
    const result = await pool.query('SELECT * FROM wallets WHERE id = $1', [id])
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}

// Locks the row for the duration of the caller's transaction. Only meaningful
// when `client` is a checked-out client already inside a BEGIN/COMMIT block
// (see paymentRequests.service.js's approvePayment/rejectPayment).
export async function findByIdForUpdate(id, client = pool) {
  try {
    const result = await client.query('SELECT * FROM wallets WHERE id = $1 FOR UPDATE', [id])
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}

export async function findMainByUserIdForUpdate(userId, client = pool) {
  try {
    const result = await client.query(
      'SELECT * FROM wallets WHERE user_id = $1 AND is_main = true FOR UPDATE',
      [userId],
    )
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}

export async function findAll() {
  try {
    const result = await pool.query('SELECT * FROM wallets ORDER BY created_at DESC')
    return result.rows
  } catch (error) {
    throw error
  }
}

export async function findAllByUserId(userId) {
  try {
    const result = await pool.query(
      'SELECT * FROM wallets WHERE user_id = $1 ORDER BY created_at DESC',
      [userId],
    )
    return result.rows
  } catch (error) {
    throw error
  }
}

export async function update(
  id,
  { name, category, description, currency, balance, budget, monthlyLimit, status, expiresAt } = {},
  client = pool,
) {
  try {
    const result = await client.query(
      `UPDATE wallets
       SET name = COALESCE($2, name),
           category = COALESCE($3, category),
           description = COALESCE($4, description),
           currency = COALESCE($5, currency),
           balance = COALESCE($6, balance),
           budget = COALESCE($7, budget),
           monthly_limit = COALESCE($8, monthly_limit),
           status = COALESCE($9, status),
           expires_at = COALESCE($10, expires_at)
       WHERE id = $1
       RETURNING *`,
      [
        id,
        name ?? null,
        category ?? null,
        description ?? null,
        currency ?? null,
        balance ?? null,
        budget ?? null,
        monthlyLimit ?? null,
        status ?? null,
        expiresAt ?? null,
      ],
    )
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}

export async function remove(id, client = pool) {
  try {
    const result = await client.query('DELETE FROM wallets WHERE id = $1 RETURNING *', [id])
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}
