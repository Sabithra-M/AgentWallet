import { Router } from 'express'
import { create, findAll, findById, update, remove, addMoney, createAiWallet } from '../controllers/wallets.controller.js'
import { validateBody, validateIdParam } from '../middleware/validate.js'
import * as walletsValidator from '../validators/wallets.validator.js'

const router = Router()

router.post('/', validateBody(walletsValidator.validateCreate), create)
router.post('/ai', validateBody(walletsValidator.validateCreateAiWallet), createAiWallet)
router.get('/', findAll)
router.get('/:id', validateIdParam, findById)
router.put('/:id', validateIdParam, validateBody(walletsValidator.validateUpdate), update)
router.post('/:id/topup', validateIdParam, validateBody(walletsValidator.validateAddMoney), addMoney)
router.delete('/:id', validateIdParam, remove)

export default router
