import { pool } from '../db/index.js'

export async function create(
  walletId,
  {
    maxWalletBudget,
    maxPerTransaction,
    allowedMerchantIds = [],
    blockedCategories = [],
    allowedCountries = [],
    dailyTransactionLimit,
    monthlyTransactionLimit,
    pinRequiredAbove,
    autoExpireWithWallet = true,
    isEnabled = true,
  },
  client = pool,
) {
  try {
    const result = await client.query(
      `INSERT INTO ai_wallet_policies (
         wallet_id, max_wallet_budget, max_per_transaction, allowed_merchant_ids,
         blocked_categories, allowed_countries, daily_transaction_limit,
         monthly_transaction_limit, pin_required_above, auto_expire_with_wallet, is_enabled
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        walletId,
        maxWalletBudget,
        maxPerTransaction,
        allowedMerchantIds,
        blockedCategories,
        allowedCountries,
        dailyTransactionLimit,
        monthlyTransactionLimit,
        pinRequiredAbove,
        autoExpireWithWallet,
        isEnabled,
      ],
    )
    return result.rows[0]
  } catch (error) {
    throw error
  }
}

export async function findByWalletId(walletId) {
  try {
    const result = await pool.query('SELECT * FROM ai_wallet_policies WHERE wallet_id = $1', [walletId])
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}

export async function findByWalletIdForUpdate(walletId, client = pool) {
  try {
    const result = await client.query('SELECT * FROM ai_wallet_policies WHERE wallet_id = $1 FOR UPDATE', [
      walletId,
    ])
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}

export async function findAllByUserId(userId) {
  try {
    const result = await pool.query(
      `SELECT p.*
       FROM ai_wallet_policies p
       JOIN wallets w ON p.wallet_id = w.id
       WHERE w.user_id = $1
       ORDER BY p.updated_at DESC`,
      [userId],
    )
    return result.rows
  } catch (error) {
    throw error
  }
}

export async function update(
  walletId,
  {
    maxWalletBudget,
    maxPerTransaction,
    allowedMerchantIds,
    blockedCategories,
    allowedCountries,
    dailyTransactionLimit,
    monthlyTransactionLimit,
    pinRequiredAbove,
    autoExpireWithWallet,
    isEnabled,
  } = {},
  client = pool,
) {
  try {
    const result = await client.query(
      `UPDATE ai_wallet_policies
       SET max_wallet_budget = COALESCE($2, max_wallet_budget),
           max_per_transaction = COALESCE($3, max_per_transaction),
           allowed_merchant_ids = COALESCE($4, allowed_merchant_ids),
           blocked_categories = COALESCE($5, blocked_categories),
           allowed_countries = COALESCE($6, allowed_countries),
           daily_transaction_limit = COALESCE($7, daily_transaction_limit),
           monthly_transaction_limit = COALESCE($8, monthly_transaction_limit),
           pin_required_above = COALESCE($9, pin_required_above),
           auto_expire_with_wallet = COALESCE($10, auto_expire_with_wallet),
           is_enabled = COALESCE($11, is_enabled)
       WHERE wallet_id = $1
       RETURNING *`,
      [
        walletId,
        maxWalletBudget ?? null,
        maxPerTransaction ?? null,
        allowedMerchantIds ?? null,
        blockedCategories ?? null,
        allowedCountries ?? null,
        dailyTransactionLimit ?? null,
        monthlyTransactionLimit ?? null,
        pinRequiredAbove ?? null,
        autoExpireWithWallet ?? null,
        isEnabled ?? null,
      ],
    )
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}
