import { pool } from '../db/index.js'

export async function create({ walletId, policyType, thresholdAmount = null, config = {}, isActive = true }) {
  try {
    const result = await pool.query(
      `INSERT INTO wallet_policies (wallet_id, policy_type, threshold_amount, config, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [walletId, policyType, thresholdAmount, JSON.stringify(config), isActive],
    )
    return result.rows[0]
  } catch (error) {
    throw error
  }
}

export async function findById(id) {
  try {
    const result = await pool.query('SELECT * FROM wallet_policies WHERE id = $1', [id])
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}

export async function findAll() {
  try {
    const result = await pool.query('SELECT * FROM wallet_policies ORDER BY created_at DESC')
    return result.rows
  } catch (error) {
    throw error
  }
}

export async function findAllByUserId(userId) {
  try {
    const result = await pool.query(
      `SELECT wp.*
       FROM wallet_policies wp
       JOIN wallets w ON wp.wallet_id = w.id
       WHERE w.user_id = $1
       ORDER BY wp.created_at DESC`,
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
      'SELECT * FROM wallet_policies WHERE wallet_id = $1 ORDER BY created_at DESC',
      [walletId],
    )
    return result.rows
  } catch (error) {
    throw error
  }
}

export async function update(id, { policyType, thresholdAmount, config, isActive } = {}) {
  try {
    const configParam = config !== undefined ? JSON.stringify(config) : null
    const result = await pool.query(
      `UPDATE wallet_policies
       SET policy_type = COALESCE($2, policy_type),
           threshold_amount = COALESCE($3, threshold_amount),
           config = COALESCE($4, config),
           is_active = COALESCE($5, is_active)
       WHERE id = $1
       RETURNING *`,
      [id, policyType ?? null, thresholdAmount ?? null, configParam, isActive ?? null],
    )
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}

export async function remove(id) {
  try {
    const result = await pool.query('DELETE FROM wallet_policies WHERE id = $1 RETURNING *', [id])
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}
