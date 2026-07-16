import { useEffect, useState } from 'react'
import { MessageSquare, Bot, User, Clock, Send, Sparkles } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout.jsx'
import BackLink from '../components/common/BackLink.jsx'
import StatCard from '../components/common/StatCard.jsx'
import StatCardSkeleton from '../components/common/StatCardSkeleton.jsx'
import FilterSelect from '../components/common/FilterSelect.jsx'
import * as conversationService from '../services/conversationService.js'
import { getErrorMessage } from '../utils/errorMessage.js'

function formatDate(value) {
  if (!value) return 'Never'
  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function AiActivity() {
  const [range, setRange] = useState('all')
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    conversationService
      .getConversationStats(range)
      .then((data) => {
        if (isMounted) setStats(data)
      })
      .catch((err) => {
        if (isMounted) setError(getErrorMessage(err))
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [range])

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <BackLink to="/ai-assistant" label="Back to AI Assistant" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">AI Activity</h1>
            <p className="mt-1 text-sm text-slate-500">See how you've been using the AI Assistant.</p>
          </div>
          <FilterSelect aria-label="Filter by range" value={range} onChange={(event) => setRange(event.target.value)}>
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </FilterSelect>
        </div>

        {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                variant="highlighted"
                icon={<MessageSquare size={18} />}
                label="Total Conversations"
                value={stats.totalConversations}
                meta="Across all time in range"
              />
              <StatCard icon={<Bot size={18} />} label="Total AI Messages" value={stats.totalAssistantMessages} meta="Replies from Gemini" />
              <StatCard icon={<User size={18} />} label="Total User Messages" value={stats.totalUserMessages} meta="Sent by you" />
              <StatCard icon={<Clock size={18} />} label="Last Active" value={formatDate(stats.lastActiveAt)} meta="Most recent message" />
              <StatCard icon={<Send size={18} />} label="Total Prompts Sent" value={stats.totalPromptsSent} meta="Requests to the assistant" />
              <StatCard icon={<Sparkles size={18} />} label="Total Gemini Responses" value={stats.totalGeminiResponses} meta="Generated replies" />
            </>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

export default AiActivity
