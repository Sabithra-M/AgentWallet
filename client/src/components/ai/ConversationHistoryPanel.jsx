import { memo, useEffect, useRef, useState } from 'react'
import { Search, X, CheckSquare, Trash2, MessageSquare } from 'lucide-react'
import Input from '../common/Input.jsx'
import FilterSelect from '../common/FilterSelect.jsx'
import Skeleton from '../common/Skeleton.jsx'
import Button from '../common/Button.jsx'
import EmptyState from '../common/EmptyState.jsx'
import ConversationActionsMenu from './ConversationActionsMenu.jsx'

function formatRelativeTime(value) {
  if (!value) return ''
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000))
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function RowSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-xl px-3 py-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  )
}

const ConversationRow = memo(function ConversationRow({
  conversation,
  isSelected,
  isSelectMode,
  isActive,
  isRenaming,
  onSelectConversation,
  onToggleSelected,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onToggleArchived,
  onDuplicate,
  onExport,
  onRequestDelete,
}) {
  const [draftTitle, setDraftTitle] = useState(conversation.title)

  useEffect(() => {
    if (isRenaming) setDraftTitle(conversation.title)
  }, [isRenaming, conversation.title])

  function commit() {
    const trimmed = draftTitle.trim()
    if (trimmed && trimmed !== conversation.title) {
      onCommitRename(conversation.id, trimmed)
    } else {
      onCancelRename()
    }
  }

  return (
    <div
      className={`group flex items-start gap-2 rounded-xl px-3 py-3 transition-colors ${
        isActive ? 'bg-indigo-50' : 'hover:bg-slate-50'
      }`}
    >
      {isSelectMode && (
        <input
          type="checkbox"
          aria-label={`Select ${conversation.title}`}
          checked={isSelected}
          onChange={() => onToggleSelected(conversation.id)}
          className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
      )}

      <button
        type="button"
        onClick={() => (isSelectMode ? onToggleSelected(conversation.id) : onSelectConversation(conversation.id))}
        className="flex-1 min-w-0 text-left"
      >
        {isRenaming ? (
          <input
            autoFocus
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commit()
              if (event.key === 'Escape') onCancelRename()
            }}
            onBlur={commit}
            className="w-full rounded-lg border border-indigo-300 px-2 py-1 text-sm focus:outline-none"
          />
        ) : (
          <p className="truncate text-sm font-medium text-slate-800">
            {conversation.title}
            {conversation.archivedAt && (
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                Archived
              </span>
            )}
          </p>
        )}
        <p className="mt-0.5 truncate text-xs text-slate-500">
          {conversation.lastMessagePreview || 'No messages yet'}
        </p>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
          <span>{formatRelativeTime(conversation.lastMessageAt || conversation.createdAt)}</span>
          <span>·</span>
          <span>{conversation.messageCount} message{conversation.messageCount === 1 ? '' : 's'}</span>
        </div>
      </button>

      {!isSelectMode && !isRenaming && (
        <div className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
          <ConversationActionsMenu
            conversation={conversation}
            onRename={() => onStartRename(conversation.id)}
            onArchive={() => onToggleArchived(conversation)}
            onDuplicate={() => onDuplicate(conversation.id)}
            onExport={(format) => onExport(conversation.id, format)}
            onDelete={() => onRequestDelete(conversation.id)}
          />
        </div>
      )}
    </div>
  )
})

function ConversationHistoryPanel({ history, selectedConversationId, onSelectConversation, onClose }) {
  const sentinelRef = useRef(null)

  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) history.loadMore()
      },
      { threshold: 0.1 },
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.hasMore, history.isLoadingMore, history.conversations.length])

  return (
    <div className="flex h-full min-w-0 flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 p-4">
        <h2 className="text-sm font-semibold text-slate-800">Conversation History</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={history.toggleSelectMode}
            aria-label="Select conversations"
            className={`rounded-lg p-1.5 transition-colors ${
              history.isSelectMode ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'
            }`}
          >
            <CheckSquare size={16} />
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close history"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 border-b border-slate-100 p-4">
        <Input
          aria-label="Search conversations"
          placeholder="Search conversations..."
          icon={<Search size={15} />}
          value={history.search}
          onChange={(event) => history.setSearch(event.target.value)}
        />
        <div className="flex items-center gap-2">
          <FilterSelect
            aria-label="Sort conversations"
            value={history.sort}
            onChange={(event) => history.setSort(event.target.value)}
            className="flex-1 sm:w-auto"
          >
            <option value="updated">Recently Updated</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </FilterSelect>
          <label className="flex items-center gap-1.5 whitespace-nowrap text-xs text-slate-500">
            <input
              type="checkbox"
              checked={history.includeArchived}
              onChange={(event) => history.setIncludeArchived(event.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Show archived
          </label>
        </div>
      </div>

      {history.isSelectMode && (
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
          <span className="text-xs text-slate-500">{history.selectedIds.length} selected</span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="danger"
              className="!px-2.5 !py-1.5 !text-xs"
              icon={<Trash2 size={13} />}
              disabled={history.selectedIds.length === 0}
              onClick={history.requestDeleteSelected}
            >
              Delete Selected
            </Button>
            <Button
              type="button"
              variant="outline"
              className="!px-2.5 !py-1.5 !text-xs"
              onClick={history.requestDeleteAll}
            >
              Delete All
            </Button>
          </div>
        </div>
      )}

      {history.error && (
        <p className="border-b border-slate-100 bg-red-50 px-4 py-2 text-xs text-red-600">{history.error}</p>
      )}

      <div className="flex-1 overflow-y-auto p-2">
        {history.isLoading ? (
          <>
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
          </>
        ) : history.conversations.length > 0 ? (
          <>
            {history.conversations.map((conversation) => (
              <ConversationRow
                key={conversation.id}
                conversation={conversation}
                isSelected={history.selectedIds.includes(conversation.id)}
                isSelectMode={history.isSelectMode}
                isActive={conversation.id === selectedConversationId}
                isRenaming={history.renamingId === conversation.id}
                onSelectConversation={onSelectConversation}
                onToggleSelected={history.toggleSelected}
                onStartRename={history.setRenamingId}
                onCommitRename={history.rename}
                onCancelRename={() => history.setRenamingId(null)}
                onToggleArchived={history.toggleArchived}
                onDuplicate={history.duplicate}
                onExport={history.exportOne}
                onRequestDelete={history.requestDeleteOne}
              />
            ))}
            <div ref={sentinelRef} className="h-1" />
            {history.isLoadingMore && <RowSkeleton />}
          </>
        ) : (
          <EmptyState
            icon={<MessageSquare size={22} />}
            title={history.search ? 'No conversations match your search' : 'No conversations yet'}
            description={history.search ? 'Try a different search term.' : 'Start chatting with the AI Assistant to see it here.'}
          />
        )}
      </div>
    </div>
  )
}

export default ConversationHistoryPanel
