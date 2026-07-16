import { useEffect, useState } from 'react'
import Sidebar from './Sidebar.jsx'
import TopBar from './TopBar.jsx'
import MobileBottomNav from './MobileBottomNav.jsx'
import SearchPalette from '../search/SearchPalette.jsx'

function AppLayout({ children }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  useEffect(() => {
    function handleKeyDown(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setIsSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onOpenSearch={() => setIsSearchOpen(true)} />
        <main className="min-w-0 flex-1 overflow-y-auto p-4 pb-20 lg:p-6 lg:pb-6">{children}</main>
      </div>
      <MobileBottomNav />
      <SearchPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  )
}

export default AppLayout
