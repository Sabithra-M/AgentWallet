import * as paymentRequestsService from '../services/paymentRequests.service.js'

export async function create(req, res, next) {
  try {
    const paymentRequest = await paymentRequestsService.create(req.user.id, req.body)
    res.status(201).json(paymentRequest)
  } catch (error) {
    next(error)
  }
}

export async function findById(req, res, next) {
  try {
    const paymentRequest = await paymentRequestsService.findById(req.params.id)
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
    const paymentRequests = await paymentRequestsService.findAll()
    res.status(200).json(paymentRequests)
  } catch (error) {
    next(error)
  }
}

export async function update(req, res, next) {
  try {
    const paymentRequest = await paymentRequestsService.update(req.params.id, req.body)
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
    const paymentRequest = await paymentRequestsService.remove(req.params.id)
    if (!paymentRequest) {
      return res.status(404).json({ error: 'Resource not found' })
    }
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
