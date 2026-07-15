import { Router } from 'express'
import { create, findAll, findById, update, remove } from '../controllers/paymentRequests.controller.js'
import { validateBody, validateIdParam } from '../middleware/validate.js'
import * as paymentRequestsValidator from '../validators/paymentRequests.validator.js'

const router = Router()

router.post('/', validateBody(paymentRequestsValidator.validateCreate), create)
router.get('/', findAll)
router.get('/:id', validateIdParam, findById)
router.put('/:id', validateIdParam, validateBody(paymentRequestsValidator.validateUpdate), update)
router.delete('/:id', validateIdParam, remove)

export default router
