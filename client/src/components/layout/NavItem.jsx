import { NavLink } from 'react-router-dom'

function NavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  )
}

export default NavItem
