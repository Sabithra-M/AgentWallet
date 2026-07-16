import * as aiWalletPoliciesService from '../services/aiWalletPolicies.service.js'

export async function findAll(req, res, next) {
  try {
    const policies = await aiWalletPoliciesService.findAll(req.user.id)
    res.status(200).json(policies)
  } catch (error) {
    next(error)
  }
}

export async function findByWalletId(req, res, next) {
  try {
    const policy = await aiWalletPoliciesService.findByWalletId(req.params.walletId, req.user.id)
    if (!policy) {
      return res.status(404).json({ error: 'Resource not found' })
    }
    res.status(200).json(policy)
  } catch (error) {
    next(error)
  }
}

export async function create(req, res, next) {
  try {
    const policy = await aiWalletPoliciesService.create(req.params.walletId, req.user.id, req.body)
    res.status(201).json(policy)
  } catch (error) {
    next(error)
  }
}

export async function update(req, res, next) {
  try {
    const policy = await aiWalletPoliciesService.update(req.params.walletId, req.user.id, req.body)
    res.status(200).json(policy)
  } catch (error) {
    next(error)
  }
}
