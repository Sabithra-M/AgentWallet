import Sidebar from './Sidebar.jsx'
import TopBar from './TopBar.jsx'
import MobileBottomNav from './MobileBottomNav.jsx'

function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="min-w-0 flex-1 overflow-y-auto p-4 pb-20 lg:p-6 lg:pb-6">{children}</main>
      </div>
      <MobileBottomNav />
    </div>
  )
}

export default AppLayout
