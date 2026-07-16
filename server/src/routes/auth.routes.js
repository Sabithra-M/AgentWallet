import { Router } from 'express'
import { register, login, googleLogin, forgotPassword, resetPassword } from '../controllers/auth.controller.js'
import { validateBody } from '../middleware/validate.js'
import { authLimiter } from '../middleware/rateLimit.js'
import * as authValidator from '../validators/auth.validator.js'

const router = Router()

router.post('/register', authLimiter, validateBody(authValidator.validateRegister), register)
router.post('/login', authLimiter, validateBody(authValidator.validateLogin), login)
router.post('/google', authLimiter, validateBody(authValidator.validateGoogleLogin), googleLogin)
router.post('/forgot-password', authLimiter, validateBody(authValidator.validateForgotPassword), forgotPassword)
router.post('/reset-password', authLimiter, validateBody(authValidator.validateResetPassword), resetPassword)

export default router
