import { Router } from 'express'
import { create, findAll, findById, update, remove } from '../controllers/merchants.controller.js'
import { validateBody, validateIdParam } from '../middleware/validate.js'
import * as merchantsValidator from '../validators/merchants.validator.js'

const router = Router()

router.post('/', validateBody(merchantsValidator.validateCreate), create)
router.get('/', findAll)
router.get('/:id', validateIdParam, findById)
router.put('/:id', validateIdParam, validateBody(merchantsValidator.validateUpdate), update)
router.delete('/:id', validateIdParam, remove)

export default router
