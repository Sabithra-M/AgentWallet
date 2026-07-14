import {
  Wallet,
  LayoutDashboard,
  Sparkles,
  Receipt,
  CheckCircle2,
  Settings,
  LogOut,
} from 'lucide-react'
import NavItem from './NavItem.jsx'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/wallets', label: 'Wallets', icon: <Wallet size={18} /> },
  { to: '/ai-assistant', label: 'AI Assistant', icon: <Sparkles size={18} /> },
  { to: '/transactions', label: 'Transactions', icon: <Receipt size={18} /> },
  { to: '/approvals', label: 'Approvals', icon: <CheckCircle2 size={18} /> },
  { to: '/settings', label: 'Settings', icon: <Settings size={18} /> },
]

function Sidebar() {
  return (
    <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white p-4 lg:flex">
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <Wallet size={18} />
        </div>
        <span className="text-lg font-semibold text-slate-800">AgentWallet</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      <div className="mt-4 border-t border-slate-200 pt-4">
        <NavItem to="/" label="Logout" icon={<LogOut size={18} />} />
      </div>
    </aside>
  )
}

export default Sidebar
