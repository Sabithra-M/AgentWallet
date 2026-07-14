function ProgressBar({ value, max, className = '' }) {
  const percentage = Math.min(100, Math.round((value / max) * 100))

  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-slate-100 ${className}`}>
      <div className="h-full rounded-full bg-indigo-600" style={{ width: `${percentage}%` }} />
    </div>
  )
}

export default ProgressBar
