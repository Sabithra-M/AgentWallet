import { Router } from 'express'
import { getSummary, getCharts, exportPayments } from '../controllers/analytics.controller.js'
import { validateQuery } from '../middleware/validate.js'
import * as analyticsValidator from '../validators/analytics.validator.js'

const router = Router()

router.get('/summary', validateQuery(analyticsValidator.validateAnalyticsQuery), getSummary)
router.get('/charts', validateQuery(analyticsValidator.validateAnalyticsQuery), getCharts)
router.get('/export', validateQuery(analyticsValidator.validateExportQuery), exportPayments)

export default router
