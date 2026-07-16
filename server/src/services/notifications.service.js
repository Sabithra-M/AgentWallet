import * as notificationsRepository from '../repositories/notifications.repository.js'
import { fail } from '../utils/httpError.js'


// Called from other services (wallets, paymentRequests) to record a real
// business event — there is no client-facing "create a notification" endpoint.
export async function notify(userId, title, description = null, { walletId = null, client = undefined } = {}) {
  try {
    return await notificationsRepository.create({ userId, title, description, walletId }, client)
  } catch (error) {
    throw error
  }
}

export async function findAll(userId) {
  try {
    return await notificationsRepository.findAllByUserId(userId)
  } catch (error) {
    throw error
  }
}

export async function markRead(id, userId) {
  try {
    const notification = await notificationsRepository.findById(id)
    if (!notification) return null
    if (notification.user_id !== userId) fail(403, 'You do not have access to this notification')
    return await notificationsRepository.markRead(id, true)
  } catch (error) {
    throw error
  }
}
