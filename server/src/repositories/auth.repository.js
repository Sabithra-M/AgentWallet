import { pool } from '../db/index.js'

export async function findByEmail(email) {
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}

export async function create({ name, email, passwordHash }) {
  try {
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, email, passwordHash],
    )
    return result.rows[0]
  } catch (error) {
    throw error
  }
}
