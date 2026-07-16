import { useState } from 'react'
import { Info, AlertTriangle, ShieldAlert, Check, Trash2, CheckCheck, Eraser, Bell } from 'lucide-react'
import SectionHeader from '../common/SectionHeader.jsx'
import Badge from '../common/Badge.jsx'
import Button from '../common/Button.jsx'
import EmptyState from '../common/EmptyState.jsx'
import { capitalize } from '../../utils/capitalize.js'
import { formatDateTime } from '../../utils/formatDateTime.js'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'critical', label: 'Critical' },
  { value: 'warning', label: 'Warnings' },
  { value: 'info', label: 'Info' },
]

const SEVERITY_ICON = {
  info: Info,
  warning: AlertTriangle,
  critical: ShieldAlert,
}

const SEVERITY_ICON_STYLE = {
  info: 'bg-blue-50 text-blue-600',
  warning: 'bg-orange-50 text-orange-600',
  critical: 'bg-red-50 text-red-600',
}

function AlertsPanel({ alerts, onMarkRead, onMarkAllRead, onDelete, onClearRead }) {
  const [filter, setFilter] = useState('all')

  const unreadCount = alerts.filter((alert) => !alert.read).length
  const hasReadAlerts = alerts.some((alert) => alert.read)

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'all') return true
    if (filter === 'unread') return !alert.read
    return alert.severity === filter
  })

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader
        title="Security Alerts"
        action={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              icon={<CheckCheck size={14} />}
              disabled={unreadCount === 0}
              onClick={onMarkAllRead}
              className="px-2.5 py-1.5 text-xs"
            >
              Mark All Read
            </Button>
            <Button
              type="button"
              variant="outline"
              icon={<Eraser size={14} />}
              disabled={!hasReadAlerts}
              onClick={onClearRead}
              className="px-2.5 py-1.5 text-xs"
            >
              Clear Read
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFilter(option.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === option.value
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {filteredAlerts.length > 0 ? (
        <div className="flex flex-col divide-y divide-slate-100">
          {filteredAlerts.map((alert) => {
            const Icon = SEVERITY_ICON[alert.severity] ?? Info
            return (
              <div key={alert.id} className={`flex items-start gap-3 py-3 ${alert.read ? '' : 'bg-indigo-50/30'}`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${SEVERITY_ICON_STYLE[alert.severity] ?? 'bg-slate-100 text-slate-500'}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-700">{alert.title}</p>
                    <Badge status={capitalize(alert.severity)} />
                    {!alert.read && <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" aria-label="Unread" />}
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500">{alert.message}</p>
                  <p className="mt-1 text-xs text-slate-400">{formatDateTime(alert.createdAt)}</p>
                </div>
                <div className="flex items-center gap-1">
                  {!alert.read && (
                    <button
                      type="button"
                      aria-label="Mark read"
                      onClick={() => onMarkRead(alert.id)}
                      className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    >
                      <Check size={14} />
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label="Delete alert"
                    onClick={() => onDelete(alert.id)}
                    className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Bell size={22} />}
          title={alerts.length === 0 ? 'No security alerts yet' : 'No alerts match this filter'}
          description={
            alerts.length === 0
              ? "You'll be notified here when a payment is approved, blocked, or needs attention."
              : 'Try a different filter.'
          }
        />
      )}
    </div>
  )
}

export default AlertsPanel
