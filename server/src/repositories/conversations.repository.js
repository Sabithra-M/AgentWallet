import { pool } from '../db/index.js'

const SORT_COLUMNS = {
  newest: 'c.created_at DESC',
  oldest: 'c.created_at ASC',
  updated: 'c.last_message_at DESC NULLS LAST, c.created_at DESC',
}

export async function create({ userId, title = 'New Conversation' }) {
  try {
    const result = await pool.query(
      `INSERT INTO conversations (user_id, title)
       VALUES ($1, $2)
       RETURNING *`,
      [userId, title],
    )
    return result.rows[0]
  } catch (error) {
    throw error
  }
}

// Soft-deleted conversations are treated as gone everywhere else in the app,
// so the base lookup excludes them — every other function builds on this.
export async function findById(id) {
  try {
    const result = await pool.query('SELECT * FROM conversations WHERE id = $1 AND deleted_at IS NULL', [id])
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}

export async function findByIdWithStats(id) {
  try {
    const result = await pool.query(
      `SELECT
         c.*,
         (SELECT COUNT(*) FROM conversation_messages m WHERE m.conversation_id = c.id) AS message_count,
         (SELECT content FROM conversation_messages m WHERE m.conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message_content
       FROM conversations c
       WHERE c.id = $1 AND c.deleted_at IS NULL`,
      [id],
    )
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}

export async function findAllPaginated({
  userId,
  page = 1,
  limit = 20,
  search = null,
  sort = 'updated',
  includeArchived = false,
}) {
  try {
    const conditions = ['c.user_id = $1', 'c.deleted_at IS NULL']
    const params = [userId]

    if (!includeArchived) {
      conditions.push('c.archived_at IS NULL')
    }

    if (search) {
      params.push(`%${search}%`)
      const searchIndex = params.length
      conditions.push(
        `(c.title ILIKE $${searchIndex} OR EXISTS (
          SELECT 1 FROM conversation_messages m2
          WHERE m2.conversation_id = c.id AND m2.content ILIKE $${searchIndex}
        ))`,
      )
    }

    const orderBy = SORT_COLUMNS[sort] ?? SORT_COLUMNS.updated
    const offset = (page - 1) * limit
    params.push(limit, offset)
    const limitIndex = params.length - 1
    const offsetIndex = params.length

    const result = await pool.query(
      `SELECT
         c.*,
         COUNT(*) OVER() AS total_count,
         (SELECT COUNT(*) FROM conversation_messages m WHERE m.conversation_id = c.id) AS message_count,
         (SELECT content FROM conversation_messages m WHERE m.conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message_content
       FROM conversations c
       WHERE ${conditions.join(' AND ')}
       ORDER BY ${orderBy}
       LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
      params,
    )

    const total = result.rows[0] ? Number(result.rows[0].total_count) : 0
    return { rows: result.rows, total }
  } catch (error) {
    throw error
  }
}

export async function getStats(userId, since = null) {
  try {
    const result = await pool.query(
      `SELECT
         COUNT(DISTINCT c.id) AS total_conversations,
         COUNT(m.id) AS total_messages,
         COUNT(m.id) FILTER (WHERE m.role = 'user') AS total_user_messages,
         COUNT(m.id) FILTER (WHERE m.role = 'assistant') AS total_assistant_messages,
         MAX(m.created_at) AS last_active_at
       FROM conversations c
       LEFT JOIN conversation_messages m ON m.conversation_id = c.id
       WHERE c.user_id = $1 AND c.deleted_at IS NULL
         AND ($2::timestamptz IS NULL OR m.created_at >= $2)`,
      [userId, since],
    )
    return result.rows[0]
  } catch (error) {
    throw error
  }
}

export async function updateTitle(id, title) {
  try {
    const result = await pool.query(
      'UPDATE conversations SET title = $2 WHERE id = $1 RETURNING *',
      [id, title],
    )
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}

export async function setArchived(id, archived) {
  try {
    const result = await pool.query(
      `UPDATE conversations
       SET archived_at = CASE WHEN $2 THEN now() ELSE NULL END
       WHERE id = $1
       RETURNING *`,
      [id, archived],
    )
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}

// Set whenever a message is sent — also bumps `updated_at` via the existing
// set_updated_at trigger, so no separate touchUpdatedAt call is needed.
export async function touchLastMessageAt(id) {
  try {
    const result = await pool.query(
      'UPDATE conversations SET last_message_at = now() WHERE id = $1 RETURNING *',
      [id],
    )
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}

export async function remove(id) {
  try {
    const result = await pool.query(
      'UPDATE conversations SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING *',
      [id],
    )
    return result.rows[0] ?? null
  } catch (error) {
    throw error
  }
}

export async function softDeleteMany(ids, userId) {
  try {
    const result = await pool.query(
      `UPDATE conversations
       SET deleted_at = now()
       WHERE id = ANY($1) AND user_id = $2 AND deleted_at IS NULL
       RETURNING id`,
      [ids, userId],
    )
    return result.rows.map((row) => row.id)
  } catch (error) {
    throw error
  }
}

export async function softDeleteAllForUser(userId) {
  try {
    const result = await pool.query(
      `UPDATE conversations
       SET deleted_at = now()
       WHERE user_id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [userId],
    )
    return result.rows.map((row) => row.id)
  } catch (error) {
    throw error
  }
}
