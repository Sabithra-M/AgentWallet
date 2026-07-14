function StatCard({ icon, label, value, meta, trend, variant = 'default' }) {
  const isHighlighted = variant === 'highlighted'

  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl p-5 shadow-sm ${
        isHighlighted ? 'bg-indigo-600 text-white' : 'bg-white text-slate-800'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${isHighlighted ? 'text-indigo-100' : 'text-slate-500'}`}>
          {label}
        </span>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            isHighlighted ? 'bg-white/15 text-white' : 'bg-indigo-50 text-indigo-600'
          }`}
        >
          {icon}
        </div>
      </div>
      <div className="text-2xl font-semibold">{value}</div>
      {(meta || trend) && (
        <div className={`text-xs ${isHighlighted ? 'text-indigo-100' : 'text-slate-500'}`}>
          {trend && <span className="mr-1 font-semibold text-emerald-500">{trend}</span>}
          {meta}
        </div>
      )}
    </div>
  )
}

export default StatCard
