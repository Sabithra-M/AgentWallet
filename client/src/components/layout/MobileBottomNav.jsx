import { Home, Wallet, Sparkles, Activity, User } from 'lucide-react'
import MobileNavItem from './MobileNavItem.jsx'

const MOBILE_NAV_ITEMS = [
  { to: '/dashboard', label: 'Home', icon: <Home size={20} /> },
  { to: '/wallets', label: 'Wallets', icon: <Wallet size={20} /> },
  { to: '/ai-assistant', label: 'AI', icon: <Sparkles size={20} />, highlighted: true },
  { to: '/transactions', label: 'Activity', icon: <Activity size={20} /> },
  { to: '/settings', label: 'Profile', icon: <User size={20} /> },
]

function MobileBottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex items-center border-t border-slate-200 bg-white px-2 lg:hidden">
      {MOBILE_NAV_ITEMS.map((item) => (
        <MobileNavItem key={item.to} {...item} />
      ))}
    </nav>
  )
}

export default MobileBottomNav
