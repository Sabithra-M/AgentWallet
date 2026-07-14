function Input({ label, icon, id, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}
      <div className="group relative">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400 transition-colors duration-200 group-focus-within:text-indigo-500">
            {icon}
          </span>
        )}
        <input
          id={id}
          className={`w-full rounded-xl border border-slate-200 py-3 pr-3 text-sm text-slate-800 placeholder:text-slate-400/90 transition-all duration-200 hover:border-slate-300 focus:border-indigo-500 focus:shadow-sm focus:outline-none focus:ring-[4px] focus:ring-indigo-500/15 ${icon ? 'pl-10' : 'pl-3'} ${className}`}
          {...props}
        />
      </div>
    </div>
  )
}

export default Input
