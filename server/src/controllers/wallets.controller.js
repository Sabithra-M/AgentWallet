import * as walletsService from '../services/wallets.service.js'

export async function create(req, res, next) {
  try {
    const wallet = await walletsService.create(req.user.id, req.body)
    res.status(201).json(wallet)
  } catch (error) {
    next(error)
  }
}

export async function findById(req, res, next) {
  try {
    const wallet = await walletsService.findById(req.params.id, req.user.id)
    if (!wallet) {
      return res.status(404).json({ error: 'Resource not found' })
    }
    res.status(200).json(wallet)
  } catch (error) {
    next(error)
  }
}

export async function findAll(req, res, next) {
  try {
    const wallets = await walletsService.findAll(req.user.id)
    res.status(200).json(wallets)
  } catch (error) {
    next(error)
  }
}

export async function update(req, res, next) {
  try {
    const wallet = await walletsService.update(req.params.id, req.user.id, req.body)
    if (!wallet) {
      return res.status(404).json({ error: 'Resource not found' })
    }
    res.status(200).json(wallet)
  } catch (error) {
    next(error)
  }
}

export async function remove(req, res, next) {
  try {
    const wallet = await walletsService.remove(req.params.id, req.user.id)
    if (!wallet) {
      return res.status(404).json({ error: 'Resource not found' })
    }
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
