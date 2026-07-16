import { pool } from '../db/index.js'

export async function create({ conversationId, role, content }) {
  try {
    const result = await pool.query(
      `INSERT INTO conversation_messages (conversation_id, role, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [conversationId, role, content],
    )
    return result.rows[0]
  } catch (error) {
    throw error
  }
}

export async function findAllByConversationId(conversationId) {
  try {
    const result = await pool.query(
      'SELECT * FROM conversation_messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [conversationId],
    )
    return result.rows
  } catch (error) {
    throw error
  }
}

export async function findById(id) {
  try {
    const result = await pool.query('SELECT * FROM conversation_messages WHERE id = $1', [id])
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}

export async function update(id, content) {
  try {
    const result = await pool.query(
      'UPDATE conversation_messages SET content = $2, updated_at = now() WHERE id = $1 RETURNING *',
      [id, content],
    )
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}

export async function remove(id) {
  try {
    const result = await pool.query('DELETE FROM conversation_messages WHERE id = $1 RETURNING *', [id])
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}
