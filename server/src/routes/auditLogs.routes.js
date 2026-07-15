import { Router } from 'express'
import { create, findAll, findById, remove } from '../controllers/auditLogs.controller.js'
import { validateBody, validateIdParam } from '../middleware/validate.js'
import * as auditLogsValidator from '../validators/auditLogs.validator.js'

const router = Router()

router.post('/', validateBody(auditLogsValidator.validateCreate), create)
router.get('/', findAll)
router.get('/:id', validateIdParam, findById)
router.delete('/:id', validateIdParam, remove)

export default router
