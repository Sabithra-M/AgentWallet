import { Plus, Mic, Send, Receipt, ArrowLeftRight, Wallet, History, Sparkles } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout.jsx'
import Card from '../components/common/Card.jsx'
import SectionHeader from '../components/common/SectionHeader.jsx'
import Button from '../components/common/Button.jsx'
import Input from '../components/common/Input.jsx'
import Skeleton from '../components/common/Skeleton.jsx'
import ChatBubble from '../components/ai/ChatBubble.jsx'
import ActivityListItem from '../components/ai/ActivityListItem.jsx'
import ActivityListItemSkeleton from '../components/ai/ActivityListItemSkeleton.jsx'
import { chatMessages } from '../data/chatMessages.js'
import { promptSuggestions } from '../data/promptSuggestions.js'
import { conversationHistory } from '../data/conversationHistory.js'
import { aiActivity } from '../data/aiActivity.js'
import { useSimulatedLoading } from '../hooks/useSimulatedLoading.js'

const SUGGESTION_ICONS = {
  bills: Receipt,
  transfer: ArrowLeftRight,
  wallet: Wallet,
  transactions: History,
}

function ChatSkeletonBubble({ align = 'left' }) {
  return (
    <div className={`flex ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
      <Skeleton className={`h-10 rounded-2xl ${align === 'right' ? 'w-52' : 'w-64'}`} />
    </div>
  )
}

function SuggestionButton({ suggestion, className = '' }) {
  const Icon = SUGGESTION_ICONS[suggestion.type] ?? Sparkles
  return (
    <Button type="button" variant="outline" icon={<Icon size={16} />} className={`w-full justify-start gap-3 ${className}`}>
      {suggestion.label}
    </Button>
  )
}

function AiAssistant() {
  const isLoading = useSimulatedLoading()

  const recentActions = aiActivity.slice(0, 3)

  return (
    <AppLayout>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-800">AI Assistant</h1>
              <p className="mt-1 text-sm text-slate-500">Ask me to book, pay, or manage anything.</p>
            </div>
            <Button type="button" icon={<Plus size={16} />}>
              New Conversation
            </Button>
          </div>

          <Card className="flex flex-col gap-4">
            <div className="flex max-h-[420px] flex-col gap-4 overflow-y-auto pr-1">
              {isLoading ? (
                <>
                  <ChatSkeletonBubble align="left" />
                  <ChatSkeletonBubble align="right" />
                  <ChatSkeletonBubble align="left" />
                </>
              ) : (
                chatMessages.map((message) => <ChatBubble key={message.id} message={message} />)
              )}
            </div>
            <div className="flex items-center gap-2 border-t border-slate-100 pt-4">
              <Input aria-label="Message" placeholder="Type your message..." className="flex-1" />
              <Button
                type="button"
                variant="outline"
                icon={<Mic size={18} />}
                className="!px-3"
                aria-label="Voice input"
              />
              <Button type="button" icon={<Send size={18} />} className="!px-3" aria-label="Send message" />
            </div>
          </Card>

          <Card>
            <SectionHeader title="Prompt Suggestions" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {isLoading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-11 w-full rounded-lg" />
                  ))
                : promptSuggestions.map((suggestion) => (
                    <SuggestionButton key={suggestion.id} suggestion={suggestion} />
                  ))}
            </div>
          </Card>

          <Card>
            <SectionHeader title="AI Activity" />
            <div className="flex flex-col divide-y divide-slate-100">
              {isLoading
                ? Array.from({ length: 4 }).map((_, index) => <ActivityListItemSkeleton key={index} />)
                : aiActivity.map((activity) => <ActivityListItem key={activity.id} activity={activity} />)}
            </div>
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Card>
            <SectionHeader title="Conversation History" />
            <div className="flex flex-col divide-y divide-slate-100">
              {isLoading
                ? Array.from({ length: 4 }).map((_, index) => <ActivityListItemSkeleton key={index} />)
                : conversationHistory.map((item) => <ActivityListItem key={item.id} activity={item} />)}
            </div>
          </Card>

          <Card>
            <SectionHeader title="Recent AI Actions" />
            <div className="flex flex-col divide-y divide-slate-100">
              {isLoading
                ? Array.from({ length: 3 }).map((_, index) => <ActivityListItemSkeleton key={index} />)
                : recentActions.map((activity) => <ActivityListItem key={activity.id} activity={activity} />)}
            </div>
          </Card>

          <Card>
            <SectionHeader title="Suggested Commands" />
            <div className="flex flex-col gap-2">
              {isLoading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-9 w-full rounded-lg" />
                  ))
                : promptSuggestions.map((suggestion) => (
                    <SuggestionButton key={suggestion.id} suggestion={suggestion} className="!text-xs" />
                  ))}
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}

export default AiAssistant
