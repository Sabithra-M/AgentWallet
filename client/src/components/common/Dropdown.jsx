function Dropdown({ label, id, className = '', children, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-indigo-500 focus:shadow-sm focus:outline-none focus:ring-[4px] focus:ring-indigo-500/15 ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}

export default Dropdown
