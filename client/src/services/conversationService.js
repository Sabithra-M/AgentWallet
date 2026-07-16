import api from './api.js'

function normalizeConversation(conversation) {
  return {
    id: conversation.id,
    title: conversation.title,
    createdAt: conversation.created_at,
    updatedAt: conversation.updated_at,
    archivedAt: conversation.archived_at,
    lastMessageAt: conversation.last_message_at,
    messageCount: Number(conversation.message_count ?? 0),
    lastMessagePreview: conversation.last_message_content,
  }
}

function normalizeMessage(message) {
  return {
    id: message.id,
    conversationId: message.conversation_id,
    role: message.role,
    content: message.content,
    createdAt: message.created_at,
    edited: Boolean(message.updated_at),
  }
}

function normalizeStats(stats) {
  return {
    totalConversations: Number(stats.total_conversations),
    totalMessages: Number(stats.total_messages),
    totalUserMessages: Number(stats.total_user_messages),
    totalAssistantMessages: Number(stats.total_assistant_messages),
    // Every user message is a prompt sent to Gemini and every assistant message
    // is a reply from it — same underlying counts, just the framing Feature 2 asks for.
    totalPromptsSent: Number(stats.total_user_messages),
    totalGeminiResponses: Number(stats.total_assistant_messages),
    lastActiveAt: stats.last_active_at,
  }
}

export async function getConversations({ page, limit, search, sort, includeArchived } = {}) {
  const response = await api.get('/conversations', {
    params: {
      page,
      limit,
      search: search || undefined,
      sort,
      includeArchived: includeArchived ? 'true' : undefined,
    },
  })
  return {
    conversations: response.data.conversations.map(normalizeConversation),
    pagination: response.data.pagination,
  }
}

export async function getConversationStats(range) {
  const response = await api.get('/conversations/stats', { params: { range } })
  return normalizeStats(response.data)
}

export async function getConversation(id) {
  const response = await api.get(`/conversations/${id}`)
  return normalizeConversation(response.data)
}

export async function createConversation(title) {
  const response = await api.post('/conversations', title ? { title } : {})
  return normalizeConversation(response.data)
}

export async function renameConversation(id, title) {
  const response = await api.patch(`/conversations/${id}`, { title })
  return normalizeConversation(response.data)
}

export async function setConversationArchived(id, archived) {
  const response = await api.patch(`/conversations/${id}`, { archived })
  return normalizeConversation(response.data)
}

export async function duplicateConversation(id) {
  const response = await api.post(`/conversations/${id}/duplicate`)
  return normalizeConversation(response.data)
}

export async function exportConversation(id, format) {
  const response = await api.post(
    `/conversations/${id}/export`,
    { format },
    { responseType: 'blob' },
  )
  const disposition = response.headers['content-disposition'] || ''
  const match = disposition.match(/filename="(.+)"/)
  return {
    blob: response.data,
    filename: match ? match[1] : `conversation.${format}`,
  }
}

export async function deleteConversation(id) {
  await api.delete(`/conversations/${id}`)
}

export async function bulkDeleteConversations({ ids, all } = {}) {
  const response = await api.delete('/conversations', { data: all ? { all: true } : { ids } })
  return response.data.removedIds
}

export async function getMessages(conversationId) {
  const response = await api.get(`/conversations/${conversationId}/messages`)
  return response.data.map(normalizeMessage)
}

export async function sendMessage(conversationId, content) {
  const response = await api.post(`/conversations/${conversationId}/messages`, { content })
  return {
    userMessage: normalizeMessage(response.data.userMessage),
    assistantMessage: normalizeMessage(response.data.assistantMessage),
  }
}

export async function updateMessage(conversationId, messageId, content) {
  const response = await api.put(`/conversations/${conversationId}/messages/${messageId}`, { content })
  return normalizeMessage(response.data)
}

export async function deleteMessage(conversationId, messageId) {
  await api.delete(`/conversations/${conversationId}/messages/${messageId}`)
}
