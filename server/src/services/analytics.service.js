import * as analyticsRepository from '../repositories/analytics.repository.js'

function startOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

// Every filter is optional; from/to are ISO date strings, the rest are IDs
// or exact-match strings. Nothing here trusts a caller-supplied userId —
// that always comes from the authenticated request, never the query string.
function normalizeFilters(query = {}) {
  return {
    from: typeof query.from === 'string' && query.from ? query.from : null,
    to: typeof query.to === 'string' && query.to ? query.to : null,
    walletId: typeof query.walletId === 'string' && query.walletId ? query.walletId : null,
    merchantId: typeof query.merchantId === 'string' && query.merchantId ? query.merchantId : null,
    status: typeof query.status === 'string' && query.status ? query.status : null,
    riskLevel: typeof query.riskLevel === 'string' && query.riskLevel ? query.riskLevel : null,
  }
}

export async function getSummary(userId, query) {
  try {
    const filters = normalizeFilters(query)
    const [summary, cardCounts, alertsToday, auditEventsToday] = await Promise.all([
      analyticsRepository.getSummary(userId, filters),
      analyticsRepository.getVirtualCardCounts(userId, filters),
      analyticsRepository.countAlertsSince(userId, startOfToday()),
      analyticsRepository.countAuditEventsSince(userId, startOfToday()),
    ])

    const totalPayments = Number(summary.total_payments)
    const approved = Number(summary.approved)
    const blocked = Number(summary.blocked)

    return {
      totalPayments,
      approved,
      blocked,
      approvalRate: totalPayments > 0 ? Math.round((approved / totalPayments) * 1000) / 10 : 0,
      blockRate: totalPayments > 0 ? Math.round((blocked / totalPayments) * 1000) / 10 : 0,
      averageRiskScore: Math.round(Number(summary.avg_risk_score) * 10) / 10,
      virtualCardsGenerated: Number(cardCounts.generated),
      virtualCardsUsed: Number(cardCounts.used),
      alertsToday,
      auditEventsToday,
    }
  } catch (error) {
    throw error
  }
}

export async function getCharts(userId, query) {
  try {
    const filters = normalizeFilters(query)
    const [
      paymentsPerDay,
      approvedVsBlocked,
      alertsBySeverity,
      topMerchants,
      topCategories,
      riskDistribution,
      walletUsage,
    ] = await Promise.all([
      analyticsRepository.getPaymentsPerDay(userId, filters),
      analyticsRepository.getApprovedVsBlocked(userId, filters),
      analyticsRepository.getAlertsBySeverity(userId, filters),
      analyticsRepository.getTopMerchants(userId, filters),
      analyticsRepository.getTopCategories(userId, filters),
      analyticsRepository.getRiskDistribution(userId, filters),
      analyticsRepository.getWalletUsage(userId, filters),
    ])

    return {
      paymentsPerDay: paymentsPerDay.map((row) => ({ day: row.day, count: Number(row.count) })),
      approvedVsBlocked: approvedVsBlocked.map((row) => ({ status: row.status, count: Number(row.count) })),
      alertsBySeverity: alertsBySeverity.map((row) => ({ severity: row.severity, count: Number(row.count) })),
      topMerchants: topMerchants.map((row) => ({ name: row.name, count: Number(row.count) })),
      topCategories: topCategories.map((row) => ({ category: row.category, count: Number(row.count) })),
      riskDistribution: riskDistribution.map((row) => ({ riskLevel: row.risk_level, count: Number(row.count) })),
      walletUsage: walletUsage.map((row) => ({
        name: row.name,
        requestCount: Number(row.request_count),
        spent: Number(row.spent),
      })),
    }
  } catch (error) {
    throw error
  }
}

export async function getExportRows(userId, query) {
  try {
    const filters = normalizeFilters(query)
    return await analyticsRepository.findForExport(userId, filters)
  } catch (error) {
    throw error
  }
}
