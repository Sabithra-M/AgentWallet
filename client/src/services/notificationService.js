import api from './api.js'

function normalizeNotification(notification) {
  return {
    id: notification.id,
    title: notification.title,
    description: notification.description,
    read: notification.is_read,
    walletId: notification.wallet_id,
    createdAt: notification.created_at,
  }
}

export async function getNotifications() {
  const response = await api.get('/notifications')
  return response.data.map(normalizeNotification)
}

export async function markAsRead(id) {
  const response = await api.patch(`/notifications/${id}/read`)
  return normalizeNotification(response.data)
}
