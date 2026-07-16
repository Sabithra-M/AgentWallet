import api from './api.js'
import { getToken } from './tokenStorage.js'

const baseURL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api`

function normalizeAlert(row) {
  return {
    id: row.id,
    userId: row.user_id,
    paymentRequestId: row.payment_request_id,
    walletId: row.wallet_id,
    type: row.type,
    title: row.title,
    message: row.message,
    severity: row.severity,
    read: row.is_read,
    createdAt: row.created_at,
  }
}

export async function getAlerts() {
  const response = await api.get('/alerts')
  return response.data.map(normalizeAlert)
}

export async function markAlertRead(id) {
  const response = await api.patch(`/alerts/${id}/read`)
  return normalizeAlert(response.data)
}

export async function markAllAlertsRead() {
  const response = await api.patch('/alerts/read-all')
  return response.data.map(normalizeAlert)
}

export async function deleteAlert(id) {
  await api.delete(`/alerts/${id}`)
}

export async function clearReadAlerts() {
  await api.delete('/alerts/read')
}

const RECONNECT_DELAYS_MS = [1000, 2000, 5000, 10000, 15000]

// The native EventSource API can't set an Authorization header, so the token
// travels as a query param for this one connection — the server only accepts
// that fallback on this exact endpoint (see authenticate.js).
//
// Browsers do retry a dropped EventSource on their own, but silently and on
// an undocumented schedule with no way to surface connection state to the
// UI — so reconnection is handled explicitly here (with backoff) instead,
// via onStatusChange('connecting' | 'open' | 'reconnecting' | 'closed').
export function subscribeToAlerts(onAlert, onStatusChange = () => {}) {
  if (!getToken()) return () => {}

  let source = null
  let reconnectTimer = null
  let attempt = 0
  let isClosed = false

  function connect() {
    const token = getToken()
    if (isClosed || !token) return

    onStatusChange(attempt === 0 ? 'connecting' : 'reconnecting')
    source = new EventSource(`${baseURL}/alerts/stream?token=${encodeURIComponent(token)}`)

    source.addEventListener('open', () => {
      attempt = 0
      onStatusChange('open')
    })

    source.addEventListener('alert', (event) => {
      onAlert(normalizeAlert(JSON.parse(event.data)))
    })

    source.addEventListener('error', () => {
      source.close()
      if (isClosed) return
      onStatusChange('reconnecting')
      const delay = RECONNECT_DELAYS_MS[Math.min(attempt, RECONNECT_DELAYS_MS.length - 1)]
      attempt += 1
      reconnectTimer = setTimeout(connect, delay)
    })
  }

  connect()

  return () => {
    isClosed = true
    clearTimeout(reconnectTimer)
    onStatusChange('closed')
    if (source) source.close()
  }
}
