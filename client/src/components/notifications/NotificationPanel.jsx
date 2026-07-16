const SEVERITY_DOT = {
  info: 'bg-blue-500',
  warning: 'bg-orange-500',
  critical: 'bg-red-500',
}

function formatRelativeTime(value) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000))
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

function NotificationPanel({ alerts, onMarkRead }) {
  if (alerts.length === 0) {
    return <p className="px-4 py-8 text-center text-sm text-slate-400">No alerts yet.</p>
  }

  return (
    <div className="flex max-h-96 flex-col divide-y divide-slate-100 overflow-y-auto">
      {alerts.map((alert) => (
        <button
          key={alert.id}
          type="button"
          onClick={() => !alert.read && onMarkRead?.(alert.id)}
          className={`flex items-start gap-2.5 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
            alert.read ? '' : 'bg-indigo-50/40'
          }`}
        >
          <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${SEVERITY_DOT[alert.severity] ?? 'bg-slate-400'}`} />
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-slate-800">{alert.title}</span>
            {alert.message && <span className="text-xs text-slate-500">{alert.message}</span>}
            <span className="text-xs text-slate-400">{formatRelativeTime(alert.createdAt)}</span>
          </div>
        </button>
      ))}
    </div>
  )
}

export default NotificationPanel
