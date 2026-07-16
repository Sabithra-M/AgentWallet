import { useEffect } from 'react'
import { CheckCircle2, X } from 'lucide-react'

function Toast({ message, onDismiss, duration = 3000 }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => onDismiss?.(), duration)
    return () => clearTimeout(timer)
  }, [message, duration, onDismiss])

  if (!message) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-slate-800 px-4 py-3 text-sm text-white shadow-xl">
      <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
      <span>{message}</span>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onDismiss}
        className="ml-1 rounded p-0.5 text-slate-400 hover:text-white"
      >
        <X size={14} />
      </button>
    </div>
  )
}

export default Toast
