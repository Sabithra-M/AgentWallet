import * as conversationsRepository from '../repositories/conversations.repository.js'
import * as conversationMessagesRepository from '../repositories/conversationMessages.repository.js'
import * as geminiClient from '../integrations/gemini/client.js'
import * as agentActionsService from './agentActions.service.js'
import { fail } from '../utils/httpError.js'

const DEFAULT_TITLE = 'New Conversation'
const TITLE_MAX_LENGTH = 60
const DEFAULT_PAGE_SIZE = 20

const EXPORT_MIME_TYPES = {
  txt: 'text/plain',
  markdown: 'text/markdown',
  json: 'application/json',
}


async function assertOwnership(conversationId, userId) {
  const conversation = await conversationsRepository.findById(conversationId)
  if (!conversation) fail(404, 'Conversation not found')
  if (conversation.user_id !== userId) fail(403, 'You do not have access to this conversation')
  return conversation
}

// Only 'user' role messages are the user's own — assistant replies are AI-authored
// and can't be edited or deleted through these endpoints.
async function assertMessageOwnership(conversationId, messageId, userId) {
  await assertOwnership(conversationId, userId)
  const message = await conversationMessagesRepository.findById(messageId)
  if (!message || message.conversation_id !== conversationId) fail(404, 'Message not found')
  if (message.role !== 'user') fail(403, 'You can only edit or delete your own messages')
  return message
}

function deriveTitle(firstMessageContent) {
  const trimmed = firstMessageContent.trim()
  if (trimmed.length <= TITLE_MAX_LENGTH) return trimmed
  return `${trimmed.slice(0, TITLE_MAX_LENGTH)}…`
}

function rangeToSince(range) {
  const now = new Date()
  switch (range) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate())
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    default:
      return null
  }
}

function slugifyTitle(title) {
  return (
    title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'conversation'
  )
}

function formatMessagesAsText(conversation, messages) {
  const lines = [conversation.title, '']
  for (const message of messages) {
    const speaker = message.role === 'user' ? 'You' : 'Assistant'
    lines.push(`${speaker} (${new Date(message.created_at).toLocaleString()}):`)
    lines.push(message.content)
    lines.push('')
  }
  return lines.join('\n')
}

function formatMessagesAsMarkdown(conversation, messages) {
  const lines = [`# ${conversation.title}`, '']
  for (const message of messages) {
    const speaker = message.role === 'user' ? '**You**' : '**Assistant**'
    lines.push(`${speaker} _(${new Date(message.created_at).toLocaleString()})_`)
    lines.push('')
    lines.push(message.content)
    lines.push('')
  }
  return lines.join('\n')
}

export async function create(userId, title) {
  try {
    return await conversationsRepository.create({ userId, title: title || DEFAULT_TITLE })
  } catch (error) {
    throw error
  }
}

export async function findAll(userId, { page = 1, limit = DEFAULT_PAGE_SIZE, search, sort, includeArchived } = {}) {
  try {
    const { rows, total } = await conversationsRepository.findAllPaginated({
      userId,
      page,
      limit,
      search,
      sort,
      includeArchived,
    })
    const conversations = rows.map(({ total_count, ...rest }) => rest)
    return {
      conversations,
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    }
  } catch (error) {
    throw error
  }
}

export async function findById(id, userId) {
  try {
    const conversation = await conversationsRepository.findByIdWithStats(id)
    if (!conversation) return null
    if (conversation.user_id !== userId) fail(403, 'You do not have access to this conversation')
    return conversation
  } catch (error) {
    throw error
  }
}

export async function getStats(userId, range = 'all') {
  try {
    const since = rangeToSince(range)
    const stats = await conversationsRepository.getStats(userId, since)
    return {
      total_conversations: Number(stats.total_conversations),
      total_messages: Number(stats.total_messages),
      total_user_messages: Number(stats.total_user_messages),
      total_assistant_messages: Number(stats.total_assistant_messages),
      last_active_at: stats.last_active_at,
    }
  } catch (error) {
    throw error
  }
}

export async function update(id, userId, { title, archived } = {}) {
  try {
    await assertOwnership(id, userId)
    if (title !== undefined) {
      await conversationsRepository.updateTitle(id, title)
    }
    if (archived !== undefined) {
      await conversationsRepository.setArchived(id, archived)
    }
    return await conversationsRepository.findByIdWithStats(id)
  } catch (error) {
    throw error
  }
}

export async function duplicate(id, userId) {
  try {
    const original = await assertOwnership(id, userId)
    const messages = await conversationMessagesRepository.findAllByConversationId(id)

    const copy = await conversationsRepository.create({
      userId,
      title: `${original.title} (copy)`,
    })

    for (const message of messages) {
      await conversationMessagesRepository.create({
        conversationId: copy.id,
        role: message.role,
        content: message.content,
      })
    }

    if (messages.length > 0) {
      await conversationsRepository.touchLastMessageAt(copy.id)
    }

    return await conversationsRepository.findByIdWithStats(copy.id)
  } catch (error) {
    throw error
  }
}

export async function exportConversation(id, userId, format) {
  try {
    const conversation = await assertOwnership(id, userId)
    const messages = await conversationMessagesRepository.findAllByConversationId(id)
    const slug = slugifyTitle(conversation.title)

    if (format === 'json') {
      return {
        content: JSON.stringify(
          {
            title: conversation.title,
            createdAt: conversation.created_at,
            messages: messages.map((m) => ({ role: m.role, content: m.content, createdAt: m.created_at })),
          },
          null,
          2,
        ),
        mimeType: EXPORT_MIME_TYPES.json,
        filename: `${slug}.json`,
      }
    }

    if (format === 'markdown') {
      return {
        content: formatMessagesAsMarkdown(conversation, messages),
        mimeType: EXPORT_MIME_TYPES.markdown,
        filename: `${slug}.md`,
      }
    }

    return {
      content: formatMessagesAsText(conversation, messages),
      mimeType: EXPORT_MIME_TYPES.txt,
      filename: `${slug}.txt`,
    }
  } catch (error) {
    throw error
  }
}

export async function findMessages(conversationId, userId) {
  try {
    await assertOwnership(conversationId, userId)
    return await conversationMessagesRepository.findAllByConversationId(conversationId)
  } catch (error) {
    throw error
  }
}

export async function sendMessage(conversationId, userId, content) {
  try {
    const conversation = await assertOwnership(conversationId, userId)

    const existingMessages = await conversationMessagesRepository.findAllByConversationId(conversationId)

    const userMessage = await conversationMessagesRepository.create({
      conversationId,
      role: 'user',
      content,
    })

    if (existingMessages.length === 0 && conversation.title === DEFAULT_TITLE) {
      await conversationsRepository.updateTitle(conversationId, deriveTitle(content))
    }

    const history = [...existingMessages, userMessage].map((message) => ({
      role: message.role,
      content: message.content,
    }))
    const { text, agentAction } = await geminiClient.generateReply(history)

    let assistantContent = text

    if (agentAction) {
      try {
        const actionReply = await agentActionsService.executeAgentAction(userId, agentAction)
        if (actionReply) assistantContent = actionReply
      } catch (error) {
        assistantContent = `I couldn't do that — ${error.message}.`
      }
    }

    if (!assistantContent) {
      assistantContent = "I'm here to help — could you tell me more about what you'd like to do?"
    }

    const assistantMessage = await conversationMessagesRepository.create({
      conversationId,
      role: 'assistant',
      content: assistantContent,
    })

    await conversationsRepository.touchLastMessageAt(conversationId)

    return { userMessage, assistantMessage }
  } catch (error) {
    throw error
  }
}

export async function updateMessage(conversationId, messageId, userId, content) {
  try {
    await assertMessageOwnership(conversationId, messageId, userId)
    return await conversationMessagesRepository.update(messageId, content)
  } catch (error) {
    throw error
  }
}

export async function deleteMessage(conversationId, messageId, userId) {
  try {
    await assertMessageOwnership(conversationId, messageId, userId)
    return await conversationMessagesRepository.remove(messageId)
  } catch (error) {
    throw error
  }
}

export async function remove(conversationId, userId) {
  try {
    await assertOwnership(conversationId, userId)
    return await conversationsRepository.remove(conversationId)
  } catch (error) {
    throw error
  }
}

export async function bulkRemove(userId, { ids, all } = {}) {
  try {
    if (all) {
      return await conversationsRepository.softDeleteAllForUser(userId)
    }
    if (!Array.isArray(ids) || ids.length === 0) {
      fail(400, 'ids must be a non-empty array when "all" is not set')
    }
    return await conversationsRepository.softDeleteMany(ids, userId)
  } catch (error) {
    throw error
  }
}
