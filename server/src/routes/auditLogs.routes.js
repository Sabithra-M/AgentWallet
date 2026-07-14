import { Router } from 'express'
import { create, findAll, findById, remove } from '../controllers/auditLogs.controller.js'

const router = Router()

router.post('/', create)
router.get('/', findAll)
router.get('/:id', findById)
router.delete('/:id', remove)

export default router
