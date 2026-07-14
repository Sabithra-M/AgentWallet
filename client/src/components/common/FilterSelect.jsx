const FILTER_SELECT_CLASSNAME =
  'rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 transition-all duration-200 hover:border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-[4px] focus:ring-indigo-500/15 sm:w-40'

function FilterSelect({ className = '', children, ...props }) {
  return (
    <select className={`${FILTER_SELECT_CLASSNAME} ${className}`} {...props}>
      {children}
    </select>
  )
}

export default FilterSelect
