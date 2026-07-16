import { useState } from 'react'
import { Home, CheckCircle2, Sparkles, Activity, Menu } from 'lucide-react'
import MobileNavItem from './MobileNavItem.jsx'
import MoreDrawer from './MoreDrawer.jsx'

const MOBILE_NAV_ITEMS = [
  { to: '/dashboard', label: 'Home', icon: <Home size={20} /> },
  { to: '/approvals', label: 'Approvals', icon: <CheckCircle2 size={20} /> },
  { to: '/ai-assistant', label: 'AI', icon: <Sparkles size={20} />, highlighted: true },
  { to: '/transactions', label: 'Activity', icon: <Activity size={20} /> },
]

function MobileBottomNav() {
  const [isMoreOpen, setIsMoreOpen] = useState(false)

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-10 flex items-center border-t border-slate-200 bg-white px-2 lg:hidden">
        {MOBILE_NAV_ITEMS.map((item) => (
          <MobileNavItem key={item.to} {...item} />
        ))}
        <button
          type="button"
          onClick={() => setIsMoreOpen(true)}
          aria-label="More"
          className="flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium text-slate-500"
        >
          <Menu size={20} />
          More
        </button>
      </nav>
      <MoreDrawer isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} />
    </>
  )
}

export default MobileBottomNav
