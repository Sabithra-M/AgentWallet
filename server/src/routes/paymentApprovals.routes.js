import { Router } from 'express'
import { create, findAll, findById, update, remove } from '../controllers/paymentApprovals.controller.js'
import { validateBody, validateIdParam } from '../middleware/validate.js'
import * as paymentApprovalsValidator from '../validators/paymentApprovals.validator.js'

const router = Router()

router.post('/', validateBody(paymentApprovalsValidator.validateCreate), create)
router.get('/', findAll)
router.get('/:id', validateIdParam, findById)
router.put('/:id', validateIdParam, validateBody(paymentApprovalsValidator.validateUpdate), update)
router.delete('/:id', validateIdParam, remove)

export default router
