import { useEffect, useRef, useState } from 'react'
import Button from '../common/Button.jsx'
import Input from '../common/Input.jsx'
import { getErrorMessage } from '../../utils/errorMessage.js'
import { useEscapeKey } from '../../hooks/useEscapeKey.js'
import { useFocusTrap } from '../../hooks/useFocusTrap.js'

function EditAiWalletModal({ isOpen, onClose, onSubmit, wallet }) {
  const [name, setName] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const dialogRef = useRef(null)

  useEffect(() => {
    if (isOpen && wallet) {
      setName(wallet.name)
      setExpiryDate(wallet.expiresAt ? new Date(wallet.expiresAt).toISOString().slice(0, 10) : '')
      setDescription(wallet.description || '')
      setError('')
    }
  }, [isOpen, wallet])

  useEscapeKey(isOpen, onClose)
  useFocusTrap(dialogRef, isOpen)

  if (!isOpen || !wallet) return null

  async function handleSubmit(event) {
    event.preventDefault()

    if (!name.trim()) {
      setError('Wallet name is required.')
      return
    }
    if (!expiryDate) {
      setError('Expiry date is required.')
      return
    }
    const expiresAt = new Date(`${expiryDate}T23:59:59`)

    setError('')
    setIsSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        expiresAt: expiresAt.toISOString(),
      })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Edit AI Wallet"
        className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 className="text-lg font-semibold text-slate-800">Edit AI Wallet</h2>
        <p className="mt-1 text-sm text-slate-500">Budget can't be changed here — delete and recreate to reallocate.</p>

        <form onSubmit={handleSubmit} noValidate className="mt-5 flex flex-col gap-4">
          <Input
            label="Wallet Name"
            id="edit-ai-wallet-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-ai-wallet-expiry" className="text-sm font-semibold text-slate-700">
              Expiry Date
            </label>
            <Input
              id="edit-ai-wallet-expiry"
              type="date"
              value={expiryDate}
              onChange={(event) => setExpiryDate(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-ai-wallet-description" className="text-sm font-semibold text-slate-700">
              Description <span className="text-slate-400">(optional)</span>
            </label>
            <textarea
              id="edit-ai-wallet-description"
              rows={2}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400/90 transition-all duration-200 hover:border-slate-300 focus:border-indigo-500 focus:shadow-sm focus:outline-none focus:ring-[4px] focus:ring-indigo-500/15"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} loadingText="Saving…">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditAiWalletModal
