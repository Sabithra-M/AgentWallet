import { Loader2 } from 'lucide-react'
import { useApp } from '../../hooks/useApp.js'

function ConnectionStatus() {
  const { sseStatus } = useApp()

  if (sseStatus === 'open' || sseStatus === 'closed') return null

  return (
    <span
      role="status"
      className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600"
    >
      <Loader2 size={12} className="animate-spin" aria-hidden="true" />
      Reconnecting…
    </span>
  )
}

export default ConnectionStatus
