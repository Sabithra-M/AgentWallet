import { useEffect, useRef, useState } from 'react'
import Button from '../common/Button.jsx'
import Input from '../common/Input.jsx'
import { getErrorMessage } from '../../utils/errorMessage.js'
import { useEscapeKey } from '../../hooks/useEscapeKey.js'
import { useFocusTrap } from '../../hooks/useFocusTrap.js'

const DAY_PRESETS = [7, 30, 90]

function todayPlusDays(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function CreateAiWalletModal({ isOpen, onClose, onSubmit, mainWalletBalance }) {
  const [name, setName] = useState('')
  const [budget, setBudget] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const dialogRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setName('')
      setBudget('')
      setExpiryDate(todayPlusDays(30))
      setDescription('')
      setError('')
    }
  }, [isOpen])

  useEscapeKey(isOpen, onClose)
  useFocusTrap(dialogRef, isOpen)

  if (!isOpen) return null

  async function handleSubmit(event) {
    event.preventDefault()

    if (!name.trim()) {
      setError('Wallet name is required.')
      return
    }
    const parsedBudget = Number(budget)
    if (!budget || !Number.isFinite(parsedBudget) || parsedBudget <= 0) {
      setError('Budget must be greater than ₹0.')
      return
    }
    if (parsedBudget > mainWalletBalance) {
      setError(`Budget cannot exceed your Main Wallet balance of ₹${mainWalletBalance.toLocaleString('en-IN')}.`)
      return
    }
    if (!expiryDate) {
      setError('Expiry date is required.')
      return
    }
    const expiresAt = new Date(`${expiryDate}T23:59:59`)
    if (expiresAt.getTime() <= Date.now()) {
      setError('Expiry must be in the future.')
      return
    }

    setError('')
    setIsSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        budget: parsedBudget,
        expiresAt: expiresAt.toISOString(),
        description: description.trim() || undefined,
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
        aria-label="Create AI Wallet"
        className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 className="text-lg font-semibold text-slate-800">Create AI Wallet</h2>
        <p className="mt-1 text-sm text-slate-500">
          Allocate budget from your Main Wallet (₹{mainWalletBalance.toLocaleString('en-IN')} available).
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-5 flex flex-col gap-4">
          <Input
            label="Wallet Name"
            id="ai-wallet-name"
            placeholder="e.g. Travel Booking Assistant"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
          />

          <Input
            label="Budget (₹)"
            id="ai-wallet-budget"
            type="number"
            min="1"
            step="0.01"
            placeholder="e.g. 5000"
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="ai-wallet-expiry" className="text-sm font-semibold text-slate-700">
              Expiry Date
            </label>
            <Input
              id="ai-wallet-expiry"
              type="date"
              value={expiryDate}
              onChange={(event) => setExpiryDate(event.target.value)}
            />
            <div className="flex gap-2">
              {DAY_PRESETS.map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setExpiryDate(todayPlusDays(days))}
                  className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-500 transition-colors hover:border-indigo-300 hover:text-indigo-600"
                >
                  {days} days
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="ai-wallet-description" className="text-sm font-semibold text-slate-700">
              Description <span className="text-slate-400">(optional)</span>
            </label>
            <textarea
              id="ai-wallet-description"
              rows={2}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What is this AI Wallet for?"
              className="w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400/90 transition-all duration-200 hover:border-slate-300 focus:border-indigo-500 focus:shadow-sm focus:outline-none focus:ring-[4px] focus:ring-indigo-500/15"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} loadingText="Creating…">
              Create AI Wallet
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateAiWalletModal
