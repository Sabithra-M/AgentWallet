import { Router } from 'express'
import { create, findAll, findById, update, remove } from '../controllers/wallets.controller.js'
import { validateBody, validateIdParam } from '../middleware/validate.js'
import * as walletsValidator from '../validators/wallets.validator.js'

const router = Router()

router.post('/', validateBody(walletsValidator.validateCreate), create)
router.get('/', findAll)
router.get('/:id', validateIdParam, findById)
router.put('/:id', validateIdParam, validateBody(walletsValidator.validateUpdate), update)
router.delete('/:id', validateIdParam, remove)

export default router
