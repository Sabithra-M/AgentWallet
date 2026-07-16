import { useEffect, useRef, useState } from 'react'
import Button from '../common/Button.jsx'
import Input from '../common/Input.jsx'
import { getErrorMessage } from '../../utils/errorMessage.js'
import { useEscapeKey } from '../../hooks/useEscapeKey.js'
import { useFocusTrap } from '../../hooks/useFocusTrap.js'

function AddMoneyModal({ isOpen, onClose, onSubmit }) {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const dialogRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setAmount('')
      setError('')
    }
  }, [isOpen])

  useEscapeKey(isOpen, onClose)
  useFocusTrap(dialogRef, isOpen)

  if (!isOpen) return null

  async function handleSubmit(event) {
    event.preventDefault()
    const parsed = Number(amount)
    if (!amount || !Number.isFinite(parsed) || parsed <= 0) {
      setError('Enter an amount greater than ₹0.')
      return
    }

    setError('')
    setIsSubmitting(true)
    try {
      await onSubmit(parsed)
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
        aria-label="Add Money"
        className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 className="text-lg font-semibold text-slate-800">Add Money</h2>
        <p className="mt-1 text-sm text-slate-500">Top up your Main Wallet balance.</p>

        <form onSubmit={handleSubmit} noValidate className="mt-5 flex flex-col gap-4">
          <Input
            label="Amount (₹)"
            id="topup-amount"
            type="number"
            min="1"
            step="0.01"
            placeholder="e.g. 1000"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            autoFocus
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} loadingText="Adding…">
              Add Money
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddMoneyModal
