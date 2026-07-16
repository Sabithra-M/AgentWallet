import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Plus,
  Mic,
  Send,
  Wallet,
  PanelLeft,
  BarChart3,
  Bot,
  Plane,
  CreditCard,
  ShieldCheck,
  LayoutDashboard,
  ShieldAlert,
} from 'lucide-react'
import AppLayout from '../components/layout/AppLayout.jsx'
import Card from '../components/common/Card.jsx'
import SectionHeader from '../components/common/SectionHeader.jsx'
import Button from '../components/common/Button.jsx'
import Input from '../components/common/Input.jsx'
import Skeleton from '../components/common/Skeleton.jsx'
import ConfirmModal from '../components/common/ConfirmModal.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import ChatBubble from '../components/ai/ChatBubble.jsx'
import ConversationHistoryPanel from '../components/ai/ConversationHistoryPanel.jsx'
import * as conversationService from '../services/conversationService.js'
import { getErrorMessage } from '../utils/errorMessage.js'
import { useConversationHistory } from '../hooks/useConversationHistory.js'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js'

const PROMPT_CATEGORIES = [
  {
    key: 'travel',
    label: 'Travel',
    icon: Plane,
    prompts: [
      'Book a flight from Chennai to Bangalore tomorrow under ₹3000.',
      'Find the cheapest flight to Delhi next Friday.',
      'Book a hotel in Bangalore under ₹2500.',
      'Show my travel itinerary.',
    ],
  },
  {
    key: 'payments',
    label: 'Payments',
    icon: Wallet,
    prompts: [
      'Pay ₹499 to Netflix.',
      'Pay ₹1999 to OpenAI.',
      'Pay ₹500 to Amazon.',
      'Transfer ₹1000 to my Main Wallet.',
      'Show my recent payments.',
    ],
  },
  {
    key: 'ai-wallet',
    label: 'AI Wallet',
    icon: Wallet,
    prompts: [
      'Create an AI Wallet named Marketing AI.',
      'Show my AI Wallet balance.',
      'Pause my Marketing AI Wallet.',
      'Resume my AI Wallet.',
    ],
  },
  {
    key: 'policy',
    label: 'Policy',
    icon: ShieldCheck,
    prompts: [
      'Set my wallet budget to ₹50,000.',
      'Allow payments only to OpenAI and AWS.',
      'Block shopping category.',
      'Require PIN for payments above ₹5000.',
      'Show my current wallet policy.',
    ],
  },
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    prompts: [
      'Show my dashboard summary.',
      "Show today's alerts.",
      'Show my audit logs.',
      'Show my virtual cards.',
      'Show payment statistics.',
    ],
  },
  {
    key: 'virtual-card',
    label: 'Virtual Card',
    icon: CreditCard,
    prompts: [
      'Show my active virtual cards.',
      'Show card details.',
      'Has my virtual card expired?',
      'Show cards generated today.',
    ],
  },
  {
    key: 'security',
    label: 'Security',
    icon: ShieldAlert,
    prompts: [
      'Why was my payment blocked?',
      'Show blocked payments.',
      'Show security alerts.',
      'Show high-risk payments.',
    ],
  },
]

const CONFIRM_COPY = {
  one: { title: 'Delete conversation?', description: 'This action cannot be undone.' },
  many: { title: 'Delete conversations?', description: 'This action cannot be undone.' },
  all: { title: 'Delete all conversations?', description: 'This action cannot be undone.' },
}

function formatTime(value) {
  return new Date(value).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function ChatSkeletonBubble({ align = 'left' }) {
  return (
    <div className={`flex ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
      <Skeleton className={`h-10 rounded-2xl ${align === 'right' ? 'w-52' : 'w-64'}`} />
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-3">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
      </div>
    </div>
  )
}

function AiAssistant() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedConversationId, setSelectedConversationId] = useState(() => searchParams.get('conversation'))
  const [messages, setMessages] = useState([])
  const [isMessagesLoading, setIsMessagesLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [pendingUserText, setPendingUserText] = useState(null)
  const [error, setError] = useState('')
  const [messageInput, setMessageInput] = useState('')
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [activeCategoryKey, setActiveCategoryKey] = useState(PROMPT_CATEGORIES[0].key)

  const history = useConversationHistory({
    onConversationsRemoved: (removedIds) => {
      if (selectedConversationId && removedIds.includes(selectedConversationId)) {
        setSelectedConversationId(null)
        setMessages([])
      }
    },
  })

  useEffect(() => {
    if (!history.isLoading && !selectedConversationId && history.conversations.length > 0) {
      setSelectedConversationId(history.conversations[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.isLoading])

  // Consumes the ?conversation= deep-link (from global search) once, so
  // picking a different conversation afterwards doesn't leave it stale in the URL.
  useEffect(() => {
    if (searchParams.get('conversation')) setSearchParams({}, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([])
      return
    }
    let isMounted = true
    setIsMessagesLoading(true)
    conversationService
      .getMessages(selectedConversationId)
      .then((data) => {
        if (isMounted) setMessages(data)
      })
      .catch((err) => {
        if (isMounted) setError(getErrorMessage(err))
      })
      .finally(() => {
        if (isMounted) setIsMessagesLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [selectedConversationId])

  async function handleNewConversation() {
    setError('')
    try {
      const conversation = await conversationService.createConversation()
      await history.refreshFirstPage()
      setSelectedConversationId(conversation.id)
      setIsHistoryOpen(false)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  function handleSelectConversation(id) {
    setSelectedConversationId(id)
    setIsHistoryOpen(false)
  }

  async function handleSend(content) {
    const text = (content ?? messageInput).trim()
    if (!text) return

    setError('')
    setIsSending(true)
    setPendingUserText(text)
    let conversationId = selectedConversationId

    try {
      if (!conversationId) {
        const conversation = await conversationService.createConversation()
        await history.refreshFirstPage()
        setSelectedConversationId(conversation.id)
        conversationId = conversation.id
      }

      setMessageInput('')
      const { userMessage, assistantMessage } = await conversationService.sendMessage(conversationId, text)
      setMessages((prev) => [...prev, userMessage, assistantMessage])
      await history.refreshFirstPage()
    } catch (err) {
      setError(getErrorMessage(err))
      if (conversationId) {
        conversationService
          .getMessages(conversationId)
          .then(setMessages)
          .catch(() => {})
      }
    } finally {
      setIsSending(false)
      setPendingUserText(null)
    }
  }

  async function handleEditMessage(messageId, newContent) {
    setError('')
    try {
      const updated = await conversationService.updateMessage(selectedConversationId, messageId, newContent)
      setMessages((prev) => prev.map((message) => (message.id === messageId ? updated : message)))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function handleDeleteMessage(messageId) {
    setError('')
    try {
      await conversationService.deleteMessage(selectedConversationId, messageId)
      setMessages((prev) => prev.filter((message) => message.id !== messageId))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const speech = useSpeechRecognition({
    getBaseText: () => messageInput,
    onTranscript: setMessageInput,
  })

  useEffect(() => {
    if (speech.error) setError(speech.error)
  }, [speech.error])

  function handleToggleVoiceInput() {
    setError('')
    speech.toggleListening()
  }

  const confirmCopy = history.confirmState ? CONFIRM_COPY[history.confirmState.type] : null
  const activeCategory = PROMPT_CATEGORIES.find((category) => category.key === activeCategoryKey)

  return (
    <AppLayout>
      <div className="flex gap-6">
        <div className={`hidden shrink-0 overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-200 lg:block ${isHistoryOpen ? 'w-80' : 'w-0'}`}>
          <div className="h-[600px] w-80">
            <ConversationHistoryPanel
              history={history}
              selectedConversationId={selectedConversationId}
              onSelectConversation={handleSelectConversation}
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-800">AI Assistant</h1>
              <p className="mt-1 text-sm text-slate-500">Ask me to book, pay, or manage anything.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                icon={<PanelLeft size={16} />}
                onClick={() => setIsHistoryOpen((prev) => !prev)}
              >
                History
              </Button>
              <Link to="/ai-activity">
                <Button type="button" variant="outline" icon={<BarChart3 size={16} />}>
                  Activity
                </Button>
              </Link>
              <Button type="button" icon={<Plus size={16} />} onClick={handleNewConversation}>
                New Conversation
              </Button>
            </div>
          </div>

          {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}

          <Card className="flex flex-col gap-4">
            <div className="flex max-h-[420px] flex-col gap-4 overflow-y-auto pr-1">
              {isMessagesLoading ? (
                <>
                  <ChatSkeletonBubble align="left" />
                  <ChatSkeletonBubble align="right" />
                  <ChatSkeletonBubble align="left" />
                </>
              ) : messages.length > 0 || pendingUserText ? (
                <>
                  {messages.map((message) => (
                    <ChatBubble
                      key={message.id}
                      message={{
                        sender: message.role === 'user' ? 'user' : 'ai',
                        text: message.content,
                        timestamp: formatTime(message.createdAt),
                        edited: message.edited,
                      }}
                      canModify={message.role === 'user'}
                      onEdit={(newContent) => handleEditMessage(message.id, newContent)}
                      onDelete={() => handleDeleteMessage(message.id)}
                    />
                  ))}
                  {pendingUserText && (
                    <ChatBubble message={{ sender: 'user', text: pendingUserText, timestamp: '' }} />
                  )}
                  {isSending && <TypingIndicator />}
                </>
              ) : (
                <EmptyState
                  icon={<Bot size={22} />}
                  title="Start a conversation"
                  description="Ask me to book, pay, or manage anything."
                />
              )}
            </div>
            <div className="flex items-center gap-2 border-t border-slate-100 pt-4">
              <Input
                aria-label="Message"
                placeholder="Type your message..."
                className="flex-1"
                value={messageInput}
                onChange={(event) => setMessageInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !isSending) handleSend()
                }}
                disabled={isSending}
              />
              <Button
                type="button"
                variant={speech.isListening ? 'danger' : 'outline'}
                icon={<Mic size={18} className={speech.isListening ? 'animate-pulse' : ''} />}
                className="!px-3"
                aria-label={speech.isListening ? 'Stop voice input' : 'Start voice input'}
                title={!speech.isSupported ? 'Voice input is not supported in this browser.' : undefined}
                disabled={isSending || !speech.isSupported}
                onClick={handleToggleVoiceInput}
              />
              <Button
                type="button"
                icon={<Send size={18} />}
                className="!px-3"
                aria-label="Send message"
                disabled={isSending}
                onClick={() => handleSend()}
              />
            </div>
          </Card>

          <Card>
            <SectionHeader title="Prompt Suggestions" />
            <div className="flex flex-wrap gap-1.5">
              {PROMPT_CATEGORIES.map((category) => (
                <button
                  key={category.key}
                  type="button"
                  onClick={() => setActiveCategoryKey(category.key)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    category.key === activeCategoryKey
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <category.icon size={13} />
                  {category.label}
                </button>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {activeCategory.prompts.map((prompt) => (
                <Button
                  key={prompt}
                  type="button"
                  variant="outline"
                  icon={<activeCategory.icon size={16} />}
                  className="w-full justify-start gap-3 text-left"
                  onClick={() => setMessageInput(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {isHistoryOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 transition-opacity"
            onClick={() => setIsHistoryOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm bg-white shadow-xl transition-transform">
            <ConversationHistoryPanel
              history={history}
              selectedConversationId={selectedConversationId}
              onSelectConversation={handleSelectConversation}
              onClose={() => setIsHistoryOpen(false)}
            />
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(history.confirmState)}
        title={confirmCopy?.title}
        description={confirmCopy?.description}
        confirmLabel="Delete"
        onConfirm={history.confirmDelete}
        onCancel={history.cancelConfirm}
      />
    </AppLayout>
  )
}

export default AiAssistant
