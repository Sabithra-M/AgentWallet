import { Router } from 'express'
import { create, findAll, findById, update, remove } from '../controllers/walletPolicies.controller.js'
import { validateBody, validateIdParam } from '../middleware/validate.js'
import * as walletPoliciesValidator from '../validators/walletPolicies.validator.js'

const router = Router()

router.post('/', validateBody(walletPoliciesValidator.validateCreate), create)
router.get('/', findAll)
router.get('/:id', validateIdParam, findById)
router.put('/:id', validateIdParam, validateBody(walletPoliciesValidator.validateUpdate), update)
router.delete('/:id', validateIdParam, remove)

export default router
