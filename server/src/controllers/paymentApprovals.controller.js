import * as paymentApprovalsService from '../services/paymentApprovals.service.js'

export async function create(req, res, next) {
  try {
    const paymentApproval = await paymentApprovalsService.create(req.body)
    res.status(201).json(paymentApproval)
  } catch (error) {
    next(error)
  }
}

export async function findById(req, res, next) {
  try {
    const paymentApproval = await paymentApprovalsService.findById(req.params.id)
    if (!paymentApproval) {
      return res.status(404).json({ error: 'Resource not found' })
    }
    res.status(200).json(paymentApproval)
  } catch (error) {
    next(error)
  }
}

export async function findAll(req, res, next) {
  try {
    const paymentApprovals = await paymentApprovalsService.findAll()
    res.status(200).json(paymentApprovals)
  } catch (error) {
    next(error)
  }
}

export async function update(req, res, next) {
  try {
    const paymentApproval = await paymentApprovalsService.update(req.params.id, req.body)
    if (!paymentApproval) {
      return res.status(404).json({ error: 'Resource not found' })
    }
    res.status(200).json(paymentApproval)
  } catch (error) {
    next(error)
  }
}

export async function remove(req, res, next) {
  try {
    const paymentApproval = await paymentApprovalsService.remove(req.params.id)
    if (!paymentApproval) {
      return res.status(404).json({ error: 'Resource not found' })
    }
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
