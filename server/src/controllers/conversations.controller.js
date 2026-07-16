import * as conversationsService from '../services/conversations.service.js'

export async function create(req, res, next) {
  try {
    const conversation = await conversationsService.create(req.user.id, req.body?.title)
    res.status(201).json(conversation)
  } catch (error) {
    next(error)
  }
}

export async function findAll(req, res, next) {
  try {
    const { page, limit, search, sort, includeArchived } = req.query
    const result = await conversationsService.findAll(req.user.id, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search || undefined,
      sort: sort || undefined,
      includeArchived: includeArchived === 'true',
    })
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

export async function getStats(req, res, next) {
  try {
    const stats = await conversationsService.getStats(req.user.id, req.query.range)
    res.status(200).json(stats)
  } catch (error) {
    next(error)
  }
}

export async function findById(req, res, next) {
  try {
    const conversation = await conversationsService.findById(req.params.id, req.user.id)
    if (!conversation) {
      return res.status(404).json({ error: 'Resource not found' })
    }
    res.status(200).json(conversation)
  } catch (error) {
    next(error)
  }
}

export async function update(req, res, next) {
  try {
    const conversation = await conversationsService.update(req.params.id, req.user.id, req.body)
    if (!conversation) {
      return res.status(404).json({ error: 'Resource not found' })
    }
    res.status(200).json(conversation)
  } catch (error) {
    next(error)
  }
}

export async function duplicate(req, res, next) {
  try {
    const conversation = await conversationsService.duplicate(req.params.id, req.user.id)
    res.status(201).json(conversation)
  } catch (error) {
    next(error)
  }
}

export async function exportConversation(req, res, next) {
  try {
    const { content, mimeType, filename } = await conversationsService.exportConversation(
      req.params.id,
      req.user.id,
      req.body.format,
    )
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.type(mimeType).status(200).send(content)
  } catch (error) {
    next(error)
  }
}

export async function findMessages(req, res, next) {
  try {
    const messages = await conversationsService.findMessages(req.params.id, req.user.id)
    res.status(200).json(messages)
  } catch (error) {
    next(error)
  }
}

export async function sendMessage(req, res, next) {
  try {
    const result = await conversationsService.sendMessage(req.params.id, req.user.id, req.body.content)
    res.status(201).json(result)
  } catch (error) {
    next(error)
  }
}

export async function updateMessage(req, res, next) {
  try {
    const message = await conversationsService.updateMessage(
      req.params.id,
      req.params.messageId,
      req.user.id,
      req.body.content,
    )
    if (!message) {
      return res.status(404).json({ error: 'Resource not found' })
    }
    res.status(200).json(message)
  } catch (error) {
    next(error)
  }
}

export async function deleteMessage(req, res, next) {
  try {
    const message = await conversationsService.deleteMessage(req.params.id, req.params.messageId, req.user.id)
    if (!message) {
      return res.status(404).json({ error: 'Resource not found' })
    }
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

export async function remove(req, res, next) {
  try {
    const conversation = await conversationsService.remove(req.params.id, req.user.id)
    if (!conversation) {
      return res.status(404).json({ error: 'Resource not found' })
    }
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

export async function bulkRemove(req, res, next) {
  try {
    const removedIds = await conversationsService.bulkRemove(req.user.id, req.body)
    res.status(200).json({ removedIds })
  } catch (error) {
    next(error)
  }
}
