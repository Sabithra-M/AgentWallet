import { Router } from 'express'
import { findAll, findById, useCard, reveal } from '../controllers/virtualCards.controller.js'
import { validateBody, validateIdParam } from '../middleware/validate.js'
import * as virtualCardsValidator from '../validators/virtualCards.validator.js'

const router = Router()

router.get('/', findAll)
router.get('/:id', validateIdParam, findById)
router.get('/:id/reveal', validateIdParam, reveal)
router.post('/:id/use', validateIdParam, validateBody(virtualCardsValidator.validateUse), useCard)

export default router
