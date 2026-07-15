import { Router } from 'express'
import { create, findAll, findById, update, remove } from '../controllers/paymentTransactions.controller.js'
import { validateBody, validateIdParam } from '../middleware/validate.js'
import * as paymentTransactionsValidator from '../validators/paymentTransactions.validator.js'

const router = Router()

router.post('/', validateBody(paymentTransactionsValidator.validateCreate), create)
router.get('/', findAll)
router.get('/:id', validateIdParam, findById)
router.put('/:id', validateIdParam, validateBody(paymentTransactionsValidator.validateUpdate), update)
router.delete('/:id', validateIdParam, remove)

export default router
