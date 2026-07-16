import { useState } from 'react'
import { Pencil, Trash2, Check, X } from 'lucide-react'

function ChatBubble({ message, canModify = false, onEdit, onDelete }) {
  const isUser = message.sender === 'user'
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(message.text)

  function startEdit() {
    setDraft(message.text)
    setIsEditing(true)
  }

  function cancelEdit() {
    setIsEditing(false)
  }

  function saveEdit() {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== message.text) {
      onEdit?.(trimmed)
    }
    setIsEditing(false)
  }

  function handleDelete() {
    if (window.confirm('Delete this message? This cannot be undone.')) {
      onDelete?.()
    }
  }

  return (
    <div className={`group flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className="flex max-w-[80%] items-start gap-1.5">
        {isUser && canModify && !isEditing && (
          <div className="mt-2 flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              aria-label="Edit message"
              onClick={startEdit}
              className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              aria-label="Delete message"
              onClick={handleDelete}
              className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
        <div
          className={`min-w-0 break-words rounded-2xl px-4 py-2.5 text-sm ${
            isUser ? 'rounded-br-sm bg-indigo-600 text-white' : 'rounded-bl-sm bg-slate-100 text-slate-700'
          }`}
        >
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <textarea
                autoFocus
                rows={2}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                className="w-full min-w-[200px] resize-none rounded-lg bg-white/15 px-2 py-1.5 text-sm text-white placeholder:text-indigo-200 focus:outline-none"
              />
              <div className="flex justify-end gap-1.5">
                <button
                  type="button"
                  aria-label="Cancel edit"
                  onClick={cancelEdit}
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-white/15 transition-colors hover:bg-white/25"
                >
                  <X size={13} />
                </button>
                <button
                  type="button"
                  aria-label="Save edit"
                  onClick={saveEdit}
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-white/15 transition-colors hover:bg-white/25"
                >
                  <Check size={13} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="whitespace-pre-line">{message.text}</p>
              <p className={`mt-1 text-[11px] ${isUser ? 'text-indigo-200' : 'text-slate-400'}`}>
                {message.timestamp}
                {message.edited && ' · edited'}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatBubble
