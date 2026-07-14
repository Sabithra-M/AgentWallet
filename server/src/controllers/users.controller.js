import * as usersService from '../services/users.service.js'

export async function create(req, res, next) {
  try {
    const user = await usersService.create(req.body)
    res.status(201).json(user)
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
    res.status(200).json(user)
  } catch (error) {
    next(error)
  }
}

export async function findAll(req, res, next) {
  try {
    const users = await usersService.findAll()
    res.status(200).json(users)
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
    res.status(200).json(user)
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
