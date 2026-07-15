import * as walletPoliciesService from '../services/walletPolicies.service.js'

export async function create(req, res, next) {
  try {
    const policy = await walletPoliciesService.create(req.user.id, req.body)
    res.status(201).json(policy)
  } catch (error) {
    next(error)
  }
}

export async function findById(req, res, next) {
  try {
    const policy = await walletPoliciesService.findById(req.params.id, req.user.id)
    if (!policy) {
      return res.status(404).json({ error: 'Resource not found' })
    }
    res.status(200).json(policy)
  } catch (error) {
    next(error)
  }
}

export async function findAll(req, res, next) {
  try {
    const policies = await walletPoliciesService.findAll(req.user.id)
    res.status(200).json(policies)
  } catch (error) {
    next(error)
  }
}

export async function update(req, res, next) {
  try {
    const policy = await walletPoliciesService.update(req.params.id, req.user.id, req.body)
    if (!policy) {
      return res.status(404).json({ error: 'Resource not found' })
    }
    res.status(200).json(policy)
  } catch (error) {
    next(error)
  }
}

export async function remove(req, res, next) {
  try {
    const policy = await walletPoliciesService.remove(req.params.id, req.user.id)
    if (!policy) {
      return res.status(404).json({ error: 'Resource not found' })
    }
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
