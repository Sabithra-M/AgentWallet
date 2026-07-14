import { NavLink } from 'react-router-dom'

function MobileNavItem({ to, icon, label, highlighted = false }) {
  if (highlighted) {
    return (
      <NavLink to={to} className="flex flex-1 flex-col items-center justify-center">
        <span className="flex h-11 w-11 -translate-y-3 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg">
          {icon}
        </span>
      </NavLink>
    )
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium ${
          isActive ? 'text-indigo-600' : 'text-slate-500'
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  )
}

export default MobileNavItem
