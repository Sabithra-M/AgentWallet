import * as alertsService from '../services/alerts.service.js'
import * as sseService from '../services/sse.service.js'

export async function findAll(req, res, next) {
  try {
    const alerts = await alertsService.findAll(req.user.id)
    res.status(200).json(alerts)
  } catch (error) {
    next(error)
  }
}

export async function markRead(req, res, next) {
  try {
    const alert = await alertsService.markRead(req.params.id, req.user.id)
    res.status(200).json(alert)
  } catch (error) {
    next(error)
  }
}

export async function markAllRead(req, res, next) {
  try {
    const alerts = await alertsService.markAllRead(req.user.id)
    res.status(200).json(alerts)
  } catch (error) {
    next(error)
  }
}

export async function remove(req, res, next) {
  try {
    await alertsService.remove(req.params.id, req.user.id)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

export async function clearRead(req, res, next) {
  try {
    await alertsService.clearRead(req.user.id)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

export function stream(req, res) {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const unsubscribe = sseService.subscribe(req.user.id, res)
  res.write(': connected\n\n')

  const heartbeat = setInterval(() => res.write(': ping\n\n'), 25000)

  req.on('close', () => {
    clearInterval(heartbeat)
    unsubscribe()
  })
}
