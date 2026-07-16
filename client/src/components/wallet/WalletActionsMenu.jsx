import { useEffect, useRef, useState } from 'react'
import { MoreVertical, Pencil, PlayCircle, PauseCircle, Trash2, Eye } from 'lucide-react'

function MenuItem({ icon, label, onClick, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
        danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-50'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function WalletActionsMenu({ wallet, onEdit, onToggleStatus, onViewDetails, onDelete }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  function runAction(action) {
    setIsOpen(false)
    action()
  }

  const isActive = wallet.status === 'Active'

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-label="Wallet actions"
        onClick={(event) => {
          event.stopPropagation()
          setIsOpen((prev) => !prev)
        }}
        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div
          onClick={(event) => event.stopPropagation()}
          className="absolute right-0 top-full z-20 mt-1 w-48 rounded-xl border border-slate-100 bg-white py-1.5 shadow-lg"
        >
          <MenuItem icon={<Eye size={14} />} label="View Details" onClick={() => runAction(onViewDetails)} />
          <MenuItem icon={<Pencil size={14} />} label="Edit" onClick={() => runAction(onEdit)} />
          <MenuItem
            icon={isActive ? <PauseCircle size={14} /> : <PlayCircle size={14} />}
            label={isActive ? 'Deactivate' : 'Activate'}
            onClick={() => runAction(onToggleStatus)}
          />
          <div className="my-1 border-t border-slate-100" />
          <MenuItem icon={<Trash2 size={14} />} label="Delete" danger onClick={() => runAction(onDelete)} />
        </div>
      )}
    </div>
  )
}

export default WalletActionsMenu
