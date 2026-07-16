import { Search } from 'lucide-react'
import { useApp } from '../../hooks/useApp.js'
import Avatar from '../common/Avatar.jsx'
import NotificationBell from './NotificationBell.jsx'
import ConnectionStatus from './ConnectionStatus.jsx'

function TopBar({ onOpenSearch }) {
  const { user } = useApp()

  return (
    <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-4 lg:px-6">
      <button
        type="button"
        onClick={onOpenSearch}
        aria-label="Open search"
        className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-500"
      >
        <Search size={15} aria-hidden="true" />
        <span className="hidden sm:inline">Search…</span>
        <kbd className="hidden rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 sm:inline">
          Ctrl K
        </kbd>
      </button>
      <div className="flex flex-1 items-center justify-end gap-4">
        <ConnectionStatus />
        <NotificationBell />
        <div className="flex items-center gap-2">
          <Avatar name={user.name} size={36} />
          <span className="hidden text-sm font-medium text-slate-700 sm:inline">{user.name}</span>
        </div>
      </div>
    </header>
  )
}

export default TopBar
