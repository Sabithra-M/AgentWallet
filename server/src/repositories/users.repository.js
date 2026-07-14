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

export async function remove(id) {
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id])
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}
