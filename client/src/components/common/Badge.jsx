const STATUS_STYLES = {
  Completed: 'bg-emerald-50 text-emerald-700',
  Active: 'bg-emerald-50 text-emerald-700',
  Approved: 'bg-emerald-50 text-emerald-700',
  Pending: 'bg-amber-50 text-amber-700',
  Rejected: 'bg-red-50 text-red-700',
  Blocked: 'bg-red-50 text-red-700',
  Failed: 'bg-red-50 text-red-700',
  Inactive: 'bg-slate-100 text-slate-600',
  Enabled: 'bg-emerald-50 text-emerald-700',
  Disabled: 'bg-slate-100 text-slate-600',
  Expired: 'bg-red-50 text-red-700',
  Used: 'bg-slate-100 text-slate-600',
  'High Confidence': 'bg-emerald-50 text-emerald-700',
  'Medium Confidence': 'bg-amber-50 text-amber-700',
  'Low Confidence': 'bg-red-50 text-red-700',
  'Low Risk': 'bg-emerald-50 text-emerald-700',
  'Medium Risk': 'bg-amber-50 text-amber-700',
  'High Risk': 'bg-red-50 text-red-700',
  Low: 'bg-emerald-50 text-emerald-700',
  Medium: 'bg-amber-50 text-amber-700',
  High: 'bg-orange-50 text-orange-700',
  Info: 'bg-blue-50 text-blue-700',
  Warning: 'bg-orange-50 text-orange-700',
  Critical: 'bg-red-50 text-red-700',
}

function Badge({ status }) {
  const className = STATUS_STYLES[status] ?? 'bg-slate-100 text-slate-600'

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      {status}
    </span>
  )
}

export default Badge
