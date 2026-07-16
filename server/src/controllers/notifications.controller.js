import * as notificationsService from '../services/notifications.service.js'

export async function findAll(req, res, next) {
  try {
    const notifications = await notificationsService.findAll(req.user.id)
    res.status(200).json(notifications)
  } catch (error) {
    next(error)
  }
}

export async function markRead(req, res, next) {
  try {
    const notification = await notificationsService.markRead(req.params.id, req.user.id)
    if (!notification) {
      return res.status(404).json({ error: 'Resource not found' })
    }
    res.status(200).json(notification)
  } catch (error) {
    next(error)
  }
}
