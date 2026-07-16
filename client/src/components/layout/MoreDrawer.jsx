import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Receipt, Activity, Settings, X } from 'lucide-react'
import { useEscapeKey } from '../../hooks/useEscapeKey.js'
import { useFocusTrap } from '../../hooks/useFocusTrap.js'

const MORE_ITEMS = [
  { to: '/payment-requests', label: 'Payment Requests', icon: Receipt },
  { to: '/observability', label: 'Observability', icon: Activity },
  { to: '/settings', label: 'Settings', icon: Settings },
]

function MoreDrawer({ isOpen, onClose }) {
  const navigate = useNavigate()
  const drawerRef = useRef(null)

  useEscapeKey(isOpen, onClose)
  useFocusTrap(drawerRef, isOpen)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:hidden" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/40" aria-hidden="true" />
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="More navigation"
        className="relative z-10 w-full rounded-t-2xl bg-white p-4 pb-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">More</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex flex-col gap-1">
          {MORE_ITEMS.map((item) => (
            <button
              key={item.to}
              type="button"
              onClick={() => {
                navigate(item.to)
                onClose()
              }}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <item.icon size={18} className="text-slate-400" aria-hidden="true" />
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MoreDrawer
