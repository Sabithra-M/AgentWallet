import * as usersService from '../services/users.service.js'
import { sanitizeUser } from '../utils/sanitizeUser.js'

export async function getMe(req, res, next) {
  try {
    const user = await usersService.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ error: 'Resource not found' })
    }
    res.status(200).json(sanitizeUser(user))
  } catch (error) {
    next(error)
  }
}

export async function updateMyProfile(req, res, next) {
  try {
    const user = await usersService.update(req.user.id, { name: req.body.name })
    res.status(200).json(sanitizeUser(user))
  } catch (error) {
    next(error)
  }
}

export async function updateMySettings(req, res, next) {
  try {
    const user = await usersService.updateSettings(req.user.id, req.body)
    res.status(200).json(sanitizeUser(user))
  } catch (error) {
    next(error)
  }
}

export async function create(req, res, next) {
  try {
    const user = await usersService.create(req.body)
    res.status(201).json(sanitizeUser(user))
  } catch (error) {
    next(error)
  }
}

export async function findById(req, res, next) {
  try {
    const user = await usersService.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ error: 'Resource not found' })
    }
    res.status(200).json(sanitizeUser(user))
  } catch (error) {
    next(error)
  }
}

export async function findAll(req, res, next) {
  try {
    const users = await usersService.findAll()
    res.status(200).json(users.map(sanitizeUser))
  } catch (error) {
    next(error)
  }
}

export async function update(req, res, next) {
  try {
    const user = await usersService.update(req.params.id, req.body)
    if (!user) {
      return res.status(404).json({ error: 'Resource not found' })
    }
    res.status(200).json(sanitizeUser(user))
  } catch (error) {
    next(error)
  }
}

export async function remove(req, res, next) {
  try {
    const user = await usersService.remove(req.params.id)
    if (!user) {
      return res.status(404).json({ error: 'Resource not found' })
    }
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
