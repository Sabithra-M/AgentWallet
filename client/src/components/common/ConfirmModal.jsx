import { useRef } from 'react'
import Button from './Button.jsx'
import { useEscapeKey } from '../../hooks/useEscapeKey.js'
import { useFocusTrap } from '../../hooks/useFocusTrap.js'

function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isDangerous = true,
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null)
  useEscapeKey(isOpen, onCancel)
  useFocusTrap(dialogRef, isOpen)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 transition-opacity"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button type="button" variant={isDangerous ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
