import { useApp } from '../../hooks/useApp.js'
import Avatar from '../common/Avatar.jsx'
import NotificationBell from './NotificationBell.jsx'

function TopBar() {
  const { user } = useApp()

  return (
    <header className="flex h-16 items-center justify-end gap-4 border-b border-slate-200 bg-white px-4 lg:px-6">
      <NotificationBell />
      <div className="flex items-center gap-2">
        <Avatar name={user.name} size={36} />
        <span className="hidden text-sm font-medium text-slate-700 sm:inline">{user.name}</span>
      </div>
    </header>
  )
}

export default TopBar
