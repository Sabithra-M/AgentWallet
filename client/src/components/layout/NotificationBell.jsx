import { Bell } from 'lucide-react'
import { useApp } from '../../hooks/useApp.js'

function NotificationBell() {
  const { unreadCount } = useApp()

  return (
    <button
      type="button"
      aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
      className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
    >
      <Bell size={20} />
      {unreadCount > 0 && (
        <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
          {unreadCount}
        </span>
      )}
    </button>
  )
}

export default NotificationBell
