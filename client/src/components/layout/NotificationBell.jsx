import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { useApp } from '../../hooks/useApp.js'
import NotificationPanel from '../notifications/NotificationPanel.jsx'

function NotificationBell() {
  const { alerts, unreadAlertCount, markAlertRead } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-label={unreadAlertCount > 0 ? `Alerts, ${unreadAlertCount} unread` : 'Alerts'}
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
      >
        <Bell size={20} />
        {unreadAlertCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
            {unreadAlertCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-20 mt-2 w-80 rounded-2xl border border-slate-100 bg-white shadow-lg">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-800">Security Alerts</p>
          </div>
          <NotificationPanel alerts={alerts.slice(0, 8)} onMarkRead={markAlertRead} />
        </div>
      )}
    </div>
  )
}

export default NotificationBell
