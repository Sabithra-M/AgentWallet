import { isUuid } from '../validators/common.js'

export function validateBody(validatorFn) {
  return (req, res, next) => {
    const errors = validatorFn(req.body ?? {})
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors })
    }
    next()
  }
}

export function validateIdParam(req, res, next) {
  if (!isUuid(req.params.id)) {
    return res.status(400).json({
      error: 'Validation failed',
      details: ['id route parameter must be a valid UUID'],
    })
  }
  next()
}
