import { Router } from 'express'
import { findAll, markRead } from '../controllers/notifications.controller.js'
import { validateIdParam } from '../middleware/validate.js'

const router = Router()

router.get('/', findAll)
router.patch('/:id/read', validateIdParam, markRead)

export default router
