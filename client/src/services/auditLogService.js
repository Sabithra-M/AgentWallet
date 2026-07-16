import api from './api.js'

function normalizeAuditLog(log) {
  return {
    id: log.id,
    userId: log.user_id,
    action: log.action,
    entityType: log.entity_type,
    entityId: log.entity_id,
    metadata: log.metadata,
    createdAt: log.created_at,
  }
}

export async function getAuditLogs() {
  const response = await api.get('/audit-logs')
  return response.data.map(normalizeAuditLog)
}
