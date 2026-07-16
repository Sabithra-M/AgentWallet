import * as paymentRequestsService from '../services/paymentRequests.service.js'

export async function create(req, res, next) {
  try {
    const paymentRequest = await paymentRequestsService.create(req.user.id, req.body)
    res.status(201).json(paymentRequest)
  } catch (error) {
    next(error)
  }
}

export async function approve(req, res, next) {
  try {
    const reason = typeof req.body?.reason === 'string' ? req.body.reason : null
    const result = await paymentRequestsService.approvePayment(req.params.id, req.user.id, reason)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

export async function reject(req, res, next) {
  try {
    const reason = typeof req.body?.reason === 'string' ? req.body.reason : null
    const result = await paymentRequestsService.rejectPayment(req.params.id, req.user.id, reason)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

export async function execute(req, res, next) {
  try {
    const transaction = await paymentRequestsService.executePayment(req.params.id, req.user.id)
    res.status(200).json(transaction)
  } catch (error) {
    next(error)
  }
}

export async function findById(req, res, next) {
  try {
    const paymentRequest = await paymentRequestsService.findById(req.params.id, req.user.id)
    if (!paymentRequest) {
      return res.status(404).json({ error: 'Resource not found' })
    }
    res.status(200).json(paymentRequest)
  } catch (error) {
    next(error)
  }
}

export async function findAll(req, res, next) {
  try {
    const paymentRequests = await paymentRequestsService.findAll(req.user.id)
    res.status(200).json(paymentRequests)
  } catch (error) {
    next(error)
  }
}

export async function findTimeline(req, res, next) {
  try {
    const timeline = await paymentRequestsService.findTimeline(req.params.id, req.user.id)
    if (!timeline) {
      return res.status(404).json({ error: 'Resource not found' })
    }
    res.status(200).json(timeline)
  } catch (error) {
    next(error)
  }
}

export async function update(req, res, next) {
  try {
    const paymentRequest = await paymentRequestsService.update(req.params.id, req.user.id, req.body)
    if (!paymentRequest) {
      return res.status(404).json({ error: 'Resource not found' })
    }
    res.status(200).json(paymentRequest)
  } catch (error) {
    next(error)
  }
}

export async function remove(req, res, next) {
  try {
    const paymentRequest = await paymentRequestsService.remove(req.params.id, req.user.id)
    if (!paymentRequest) {
      return res.status(404).json({ error: 'Resource not found' })
    }
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
