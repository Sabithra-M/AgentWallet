import { Link } from 'react-router-dom'
import Button from './Button.jsx'

function EmptyState({ icon, title, description, actionLabel, onAction, actionHref, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 rounded-xl px-6 py-10 text-center ${className}`}>
      {icon && <div className="rounded-full bg-slate-100 p-3 text-slate-500">{icon}</div>}
      <div className="space-y-1">
        <p className="text-sm font-medium text-slate-700">{title}</p>
        {description && <p className="text-sm text-slate-500">{description}</p>}
      </div>
      {actionLabel && onAction && (
        <Button variant="outline" onClick={onAction} className="mt-1">
          {actionLabel}
        </Button>
      )}
      {actionLabel && actionHref && (
        <Link
          to={actionHref}
          className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  )
}

export default EmptyState
