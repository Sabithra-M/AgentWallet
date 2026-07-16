import { pool } from '../db/index.js'

export async function create({ name, email, passwordHash = null, role = 'owner', isActive = true }) {
  try {
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, email, passwordHash, role, isActive],
    )
    return result.rows[0]
  } catch (error) {
    throw error
  }
}

export async function findById(id) {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id])
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}

export async function findAll() {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC')
    return result.rows
  } catch (error) {
    throw error
  }
}

export async function update(id, { name, email, passwordHash, role, isActive } = {}) {
  try {
    const result = await pool.query(
      `UPDATE users
       SET name = COALESCE($2, name),
           email = COALESCE($3, email),
           password_hash = COALESCE($4, password_hash),
           role = COALESCE($5, role),
           is_active = COALESCE($6, is_active)
       WHERE id = $1
       RETURNING *`,
      [id, name ?? null, email ?? null, passwordHash ?? null, role ?? null, isActive ?? null],
    )
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}

export async function updateSettings(
  id,
  {
    theme,
    notificationsEnabled,
    emailAlertsEnabled,
    pushNotificationsEnabled,
    darkModeEnabled,
    defaultWalletId,
    monthlySpendingLimit,
    preferredCurrency,
  } = {},
) {
  try {
    const result = await pool.query(
      `UPDATE users
       SET theme = COALESCE($2, theme),
           notifications_enabled = COALESCE($3, notifications_enabled),
           email_alerts_enabled = COALESCE($4, email_alerts_enabled),
           push_notifications_enabled = COALESCE($5, push_notifications_enabled),
           dark_mode_enabled = COALESCE($6, dark_mode_enabled),
           default_wallet_id = COALESCE($7, default_wallet_id),
           monthly_spending_limit = COALESCE($8, monthly_spending_limit),
           preferred_currency = COALESCE($9, preferred_currency)
       WHERE id = $1
       RETURNING *`,
      [
        id,
        theme ?? null,
        notificationsEnabled ?? null,
        emailAlertsEnabled ?? null,
        pushNotificationsEnabled ?? null,
        darkModeEnabled ?? null,
        defaultWalletId ?? null,
        monthlySpendingLimit ?? null,
        preferredCurrency ?? null,
      ],
    )
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}

export async function remove(id) {
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id])
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}
