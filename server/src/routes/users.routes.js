import { Router } from 'express'
import { create, findAll, findById, update, remove } from '../controllers/users.controller.js'
import { validateBody, validateIdParam } from '../middleware/validate.js'
import * as usersValidator from '../validators/users.validator.js'

const router = Router()

router.post('/', validateBody(usersValidator.validateCreate), create)
router.get('/', findAll)
router.get('/:id', validateIdParam, findById)
router.put('/:id', validateIdParam, validateBody(usersValidator.validateUpdate), update)
router.delete('/:id', validateIdParam, remove)

export default router
