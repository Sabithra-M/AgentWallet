import * as paymentTransactionsService from '../services/paymentTransactions.service.js'

export async function create(req, res, next) {
  try {
    const paymentTransaction = await paymentTransactionsService.create(req.user.id, req.body)
    res.status(201).json(paymentTransaction)
  } catch (error) {
    next(error)
  }
}

export async function findById(req, res, next) {
  try {
    const paymentTransaction = await paymentTransactionsService.findById(req.params.id, req.user.id)
    if (!paymentTransaction) {
      return res.status(404).json({ error: 'Resource not found' })
    }
    res.status(200).json(paymentTransaction)
  } catch (error) {
    next(error)
  }
}

export async function findAll(req, res, next) {
  try {
    const paymentTransactions = await paymentTransactionsService.findAll(req.user.id)
    res.status(200).json(paymentTransactions)
  } catch (error) {
    next(error)
  }
}

export async function update(req, res, next) {
  try {
    const paymentTransaction = await paymentTransactionsService.update(req.params.id, req.user.id, req.body)
    if (!paymentTransaction) {
      return res.status(404).json({ error: 'Resource not found' })
    }
    res.status(200).json(paymentTransaction)
  } catch (error) {
    next(error)
  }
}

export async function remove(req, res, next) {
  try {
    const paymentTransaction = await paymentTransactionsService.remove(req.params.id, req.user.id)
    if (!paymentTransaction) {
      return res.status(404).json({ error: 'Resource not found' })
    }
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
