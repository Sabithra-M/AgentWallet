import { Router } from 'express'
import {
  create,
  findAll,
  getStats,
  findById,
  update,
  duplicate,
  exportConversation,
  findMessages,
  sendMessage,
  updateMessage,
  deleteMessage,
  remove,
  bulkRemove,
} from '../controllers/conversations.controller.js'
import { validateBody, validateQuery, validateIdParam, validateMessageIdParam } from '../middleware/validate.js'
import { aiLimiter } from '../middleware/rateLimit.js'
import * as conversationsValidator from '../validators/conversations.validator.js'

const router = Router()

router.post('/', validateBody(conversationsValidator.validateCreate), create)
router.get('/', validateQuery(conversationsValidator.validateListQuery), findAll)
router.get('/stats', validateQuery(conversationsValidator.validateStatsQuery), getStats)
router.delete('/', validateBody(conversationsValidator.validateBulkDelete), bulkRemove)

router.get('/:id', validateIdParam, findById)
router.patch('/:id', validateIdParam, validateBody(conversationsValidator.validateUpdate), update)
router.delete('/:id', validateIdParam, remove)
router.post('/:id/duplicate', validateIdParam, duplicate)
router.post('/:id/export', validateIdParam, validateBody(conversationsValidator.validateExport), exportConversation)

router.get('/:id/messages', validateIdParam, findMessages)
router.post(
  '/:id/messages',
  aiLimiter,
  validateIdParam,
  validateBody(conversationsValidator.validateMessage),
  sendMessage,
)
router.put(
  '/:id/messages/:messageId',
  aiLimiter,
  validateIdParam,
  validateMessageIdParam,
  validateBody(conversationsValidator.validateMessage),
  updateMessage,
)
router.delete('/:id/messages/:messageId', validateIdParam, validateMessageIdParam, deleteMessage)

export default router
