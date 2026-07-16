import { Router } from 'express'
import { create, findAll, findByWalletId, update } from '../controllers/aiWalletPolicies.controller.js'
import { validateBody, validateWalletIdParam } from '../middleware/validate.js'
import * as aiWalletPoliciesValidator from '../validators/aiWalletPolicies.validator.js'

const router = Router()

router.get('/', findAll)
router.get('/:walletId', validateWalletIdParam, findByWalletId)
router.post('/:walletId', validateWalletIdParam, validateBody(aiWalletPoliciesValidator.validateSave), create)
router.put('/:walletId', validateWalletIdParam, validateBody(aiWalletPoliciesValidator.validateSave), update)

export default router
