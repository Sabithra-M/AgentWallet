import api from './api.js'

function buildQuery(filters = {}) {
  const params = new URLSearchParams()
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)
  if (filters.walletId) params.set('walletId', filters.walletId)
  if (filters.merchantId) params.set('merchantId', filters.merchantId)
  if (filters.status) params.set('status', filters.status)
  if (filters.riskLevel) params.set('riskLevel', filters.riskLevel)
  return params.toString()
}

export async function getSummary(filters) {
  const response = await api.get(`/analytics/summary?${buildQuery(filters)}`)
  return response.data
}

export async function getCharts(filters) {
  const response = await api.get(`/analytics/charts?${buildQuery(filters)}`)
  return response.data
}

// Same blob + Content-Disposition pattern as conversation export — goes
// through the normal authenticated api client, not a raw URL.
export async function exportPayments(format, filters) {
  const response = await api.get(`/analytics/export?format=${format}&${buildQuery(filters)}`, {
    responseType: 'blob',
  })
  const disposition = response.headers['content-disposition'] || ''
  const match = disposition.match(/filename="(.+)"/)
  return {
    blob: response.data,
    filename: match ? match[1] : `payment-requests.${format}`,
  }
}
