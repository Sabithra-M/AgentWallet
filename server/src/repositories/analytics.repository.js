import { pool } from '../db/index.js'

// Builds "AND col = $n" fragments for the shared filter set, starting
// parameter numbering at startIndex — every query below applies the exact
// same filters, so this is the one place their SQL shape is defined.
function buildFilters(filters, startIndex) {
  const conditions = []
  const params = []
  let index = startIndex

  if (filters.from) {
    conditions.push(`pr.created_at >= $${index}`)
    params.push(filters.from)
    index += 1
  }
  if (filters.to) {
    conditions.push(`pr.created_at <= $${index}`)
    params.push(filters.to)
    index += 1
  }
  if (filters.walletId) {
    conditions.push(`pr.wallet_id = $${index}`)
    params.push(filters.walletId)
    index += 1
  }
  if (filters.merchantId) {
    conditions.push(`pr.merchant_id = $${index}`)
    params.push(filters.merchantId)
    index += 1
  }
  if (filters.status) {
    conditions.push(`pr.status = $${index}`)
    params.push(filters.status)
    index += 1
  }
  if (filters.riskLevel) {
    conditions.push(`pr.risk_level = $${index}`)
    params.push(filters.riskLevel)
    index += 1
  }

  return { clause: conditions.map((c) => `AND ${c}`).join(' '), params }
}

export async function getSummary(userId, filters) {
  try {
    const { clause, params } = buildFilters(filters, 2)
    const result = await pool.query(
      `SELECT
         count(*) AS total_payments,
         count(*) FILTER (WHERE pr.status = 'approved') AS approved,
         count(*) FILTER (WHERE pr.status = 'blocked') AS blocked,
         COALESCE(avg(pr.risk_score), 0) AS avg_risk_score
       FROM payment_requests pr
       WHERE pr.requested_by = $1 ${clause}`,
      [userId, ...params],
    )
    return result.rows[0]
  } catch (error) {
    throw error
  }
}

export async function getVirtualCardCounts(userId, filters) {
  try {
    const { clause, params } = buildFilters({ from: filters.from, to: filters.to }, 2)
    const result = await pool.query(
      `SELECT
         count(*) AS generated,
         count(*) FILTER (WHERE vc.status = 'used') AS used
       FROM virtual_cards vc
       JOIN payment_requests pr ON vc.payment_request_id = pr.id
       WHERE vc.user_id = $1 ${clause}`,
      [userId, ...params],
    )
    return result.rows[0]
  } catch (error) {
    throw error
  }
}

export async function countAlertsSince(userId, since) {
  try {
    const result = await pool.query('SELECT count(*) AS total FROM alerts WHERE user_id = $1 AND created_at >= $2', [
      userId,
      since,
    ])
    return Number(result.rows[0].total)
  } catch (error) {
    throw error
  }
}

export async function countAuditEventsSince(userId, since) {
  try {
    const result = await pool.query(
      'SELECT count(*) AS total FROM audit_logs WHERE user_id = $1 AND created_at >= $2',
      [userId, since],
    )
    return Number(result.rows[0].total)
  } catch (error) {
    throw error
  }
}

export async function getPaymentsPerDay(userId, filters) {
  try {
    const { clause, params } = buildFilters(filters, 2)
    const result = await pool.query(
      `SELECT date_trunc('day', pr.created_at) AS day, count(*) AS count
       FROM payment_requests pr
       WHERE pr.requested_by = $1 ${clause}
       GROUP BY day
       ORDER BY day ASC`,
      [userId, ...params],
    )
    return result.rows
  } catch (error) {
    throw error
  }
}

export async function getApprovedVsBlocked(userId, filters) {
  try {
    const { clause, params } = buildFilters(filters, 2)
    const result = await pool.query(
      `SELECT pr.status, count(*) AS count
       FROM payment_requests pr
       WHERE pr.requested_by = $1 AND pr.status IN ('approved', 'blocked') ${clause}
       GROUP BY pr.status`,
      [userId, ...params],
    )
    return result.rows
  } catch (error) {
    throw error
  }
}

export async function getAlertsBySeverity(userId, filters) {
  try {
    const conditions = []
    const params = [userId]
    let index = 2
    if (filters.from) {
      conditions.push(`created_at >= $${index}`)
      params.push(filters.from)
      index += 1
    }
    if (filters.to) {
      conditions.push(`created_at <= $${index}`)
      params.push(filters.to)
      index += 1
    }
    const clause = conditions.map((c) => `AND ${c}`).join(' ')

    const result = await pool.query(
      `SELECT severity, count(*) AS count FROM alerts WHERE user_id = $1 ${clause} GROUP BY severity`,
      params,
    )
    return result.rows
  } catch (error) {
    throw error
  }
}

export async function getTopMerchants(userId, filters, limit = 5) {
  try {
    const { clause, params } = buildFilters(filters, 2)
    const result = await pool.query(
      `SELECT m.name, count(*) AS count
       FROM payment_requests pr
       JOIN merchants m ON pr.merchant_id = m.id
       WHERE pr.requested_by = $1 ${clause}
       GROUP BY m.name
       ORDER BY count DESC
       LIMIT $${params.length + 2}`,
      [userId, ...params, limit],
    )
    return result.rows
  } catch (error) {
    throw error
  }
}

export async function getTopCategories(userId, filters, limit = 5) {
  try {
    const { clause, params } = buildFilters(filters, 2)
    const result = await pool.query(
      `SELECT COALESCE(pr.category, m.category, 'Uncategorized') AS category, count(*) AS count
       FROM payment_requests pr
       LEFT JOIN merchants m ON pr.merchant_id = m.id
       WHERE pr.requested_by = $1 ${clause}
       GROUP BY COALESCE(pr.category, m.category, 'Uncategorized')
       ORDER BY count DESC
       LIMIT $${params.length + 2}`,
      [userId, ...params, limit],
    )
    return result.rows
  } catch (error) {
    throw error
  }
}

export async function getRiskDistribution(userId, filters) {
  try {
    const { clause, params } = buildFilters(filters, 2)
    const result = await pool.query(
      `SELECT pr.risk_level, count(*) AS count
       FROM payment_requests pr
       WHERE pr.requested_by = $1 AND pr.risk_level IS NOT NULL ${clause}
       GROUP BY pr.risk_level`,
      [userId, ...params],
    )
    return result.rows
  } catch (error) {
    throw error
  }
}

export async function getWalletUsage(userId, filters, limit = 5) {
  try {
    const { clause, params } = buildFilters(filters, 2)
    const result = await pool.query(
      `SELECT w.name,
              count(*) AS request_count,
              COALESCE(sum(pr.amount) FILTER (WHERE pr.status = 'approved'), 0) AS spent
       FROM payment_requests pr
       JOIN wallets w ON pr.wallet_id = w.id
       WHERE pr.requested_by = $1 ${clause}
       GROUP BY w.name
       ORDER BY spent DESC
       LIMIT $${params.length + 2}`,
      [userId, ...params, limit],
    )
    return result.rows
  } catch (error) {
    throw error
  }
}

// Used by the export endpoint — same filters, capped at a sane limit so a
// single export request can never try to pull an unbounded number of rows.
export async function findForExport(userId, filters, limit = 10000) {
  try {
    const { clause, params } = buildFilters(filters, 2)
    const result = await pool.query(
      `SELECT pr.*, m.name AS merchant_name, w.name AS wallet_name
       FROM payment_requests pr
       JOIN merchants m ON pr.merchant_id = m.id
       JOIN wallets w ON pr.wallet_id = w.id
       WHERE pr.requested_by = $1 ${clause}
       ORDER BY pr.created_at DESC
       LIMIT $${params.length + 2}`,
      [userId, ...params, limit],
    )
    return result.rows
  } catch (error) {
    throw error
  }
}
