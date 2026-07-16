import { Router } from 'express'
import {
  create,
  findAll,
  findById,
  update,
  remove,
  getMe,
  updateMyProfile,
  updateMySettings,
} from '../controllers/users.controller.js'
import { validateBody, validateIdParam } from '../middleware/validate.js'
import * as usersValidator from '../validators/users.validator.js'

const router = Router()

router.get('/me', getMe)
router.put('/me/profile', validateBody(usersValidator.validateProfileUpdate), updateMyProfile)
router.put('/me/settings', validateBody(usersValidator.validateSettingsUpdate), updateMySettings)

router.post('/', validateBody(usersValidator.validateCreate), create)
router.get('/', findAll)
router.get('/:id', validateIdParam, findById)
router.put('/:id', validateIdParam, validateBody(usersValidator.validateUpdate), update)
router.delete('/:id', validateIdParam, remove)

export default router
