import { Router } from 'express'
import { register, login } from '../controllers/auth.controller.js'
import { validateBody } from '../middleware/validate.js'
import * as authValidator from '../validators/auth.validator.js'

const router = Router()

router.post('/register', validateBody(authValidator.validateRegister), register)
router.post('/login', validateBody(authValidator.validateLogin), login)

export default router
