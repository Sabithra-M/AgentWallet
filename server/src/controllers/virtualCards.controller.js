import * as virtualCardsService from '../services/virtualCards.service.js'

export async function findAll(req, res, next) {
  try {
    const cards = await virtualCardsService.findAll(req.user.id)
    res.status(200).json(cards)
  } catch (error) {
    next(error)
  }
}

export async function findById(req, res, next) {
  try {
    const card = await virtualCardsService.findById(req.params.id, req.user.id)
    if (!card) {
      return res.status(404).json({ error: 'Resource not found' })
    }
    res.status(200).json(card)
  } catch (error) {
    next(error)
  }
}

export async function useCard(req, res, next) {
  try {
    const card = await virtualCardsService.useCard(req.params.id, req.user.id, req.body)
    res.status(200).json(card)
  } catch (error) {
    next(error)
  }
}

export async function reveal(req, res, next) {
  try {
    const revealed = await virtualCardsService.revealCard(req.params.id, req.user.id)
    if (!revealed) {
      return res.status(404).json({ error: 'Resource not found' })
    }
    res.status(200).json(revealed)
  } catch (error) {
    next(error)
  }
}
