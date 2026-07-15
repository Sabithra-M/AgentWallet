import * as merchantsService from '../services/merchants.service.js'

export async function create(req, res, next) {
  try {
    const merchant = await merchantsService.create(req.user.id, req.body)
    res.status(201).json(merchant)
  } catch (error) {
    next(error)
  }
}

export async function findById(req, res, next) {
  try {
    const merchant = await merchantsService.findById(req.params.id, req.user.id)
    if (!merchant) {
      return res.status(404).json({ error: 'Resource not found' })
    }
    res.status(200).json(merchant)
  } catch (error) {
    next(error)
  }
}

export async function findAll(req, res, next) {
  try {
    const merchants = await merchantsService.findAll(req.user.id)
    res.status(200).json(merchants)
  } catch (error) {
    next(error)
  }
}

export async function update(req, res, next) {
  try {
    const merchant = await merchantsService.update(req.params.id, req.user.id, req.body)
    if (!merchant) {
      return res.status(404).json({ error: 'Resource not found' })
    }
    res.status(200).json(merchant)
  } catch (error) {
    next(error)
  }
}

export async function remove(req, res, next) {
  try {
    const merchant = await merchantsService.remove(req.params.id, req.user.id)
    if (!merchant) {
      return res.status(404).json({ error: 'Resource not found' })
    }
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
