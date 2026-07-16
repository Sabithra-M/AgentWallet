import { Router } from 'express'
import { findAll, markRead, markAllRead, remove, clearRead, stream } from '../controllers/alerts.controller.js'
import { validateIdParam } from '../middleware/validate.js'

const router = Router()

router.get('/stream', stream)
router.get('/', findAll)
router.patch('/read-all', markAllRead)
router.patch('/:id/read', validateIdParam, markRead)
router.delete('/read', clearRead)
router.delete('/:id', validateIdParam, remove)

export default router
