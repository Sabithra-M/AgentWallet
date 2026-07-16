import { useEffect, useRef, useState } from 'react'
import Button from '../common/Button.jsx'
import Input from '../common/Input.jsx'
import * as aiWalletPolicyService from '../../services/aiWalletPolicyService.js'
import * as merchantService from '../../services/merchantService.js'
import { getErrorMessage } from '../../utils/errorMessage.js'
import { useEscapeKey } from '../../hooks/useEscapeKey.js'
import { useFocusTrap } from '../../hooks/useFocusTrap.js'

const CATEGORY_OPTIONS = ['travel', 'shopping', 'food', 'bills']

function toggleInArray(array, value) {
  return array.includes(value) ? array.filter((v) => v !== value) : [...array, value]
}

function defaultFormState(wallet) {
  const budget = wallet.budget || 0
  return {
    maxWalletBudget: String(budget || ''),
    maxPerTransaction: String(budget || ''),
    dailyTransactionLimit: String(budget || ''),
    monthlyTransactionLimit: String(budget || ''),
    pinRequiredAbove: String(budget ? Math.round(budget * 0.5) : ''),
    allowedMerchantIds: [],
    blockedCategories: [],
    allowedCountriesText: '',
    autoExpireWithWallet: true,
    isEnabled: true,
  }
}

function formStateFromPolicy(policy) {
  return {
    maxWalletBudget: String(policy.maxWalletBudget),
    maxPerTransaction: String(policy.maxPerTransaction),
    dailyTransactionLimit: String(policy.dailyTransactionLimit),
    monthlyTransactionLimit: String(policy.monthlyTransactionLimit),
    pinRequiredAbove: String(policy.pinRequiredAbove),
    allowedMerchantIds: policy.allowedMerchantIds,
    blockedCategories: policy.blockedCategories,
    allowedCountriesText: policy.allowedCountries.join(', '),
    autoExpireWithWallet: policy.autoExpireWithWallet,
    isEnabled: policy.isEnabled,
  }
}

function parseCountries(text) {
  const seen = new Set()
  const countries = []
  for (const raw of text.split(',')) {
    const country = raw.trim()
    if (!country || seen.has(country.toLowerCase())) continue
    seen.add(country.toLowerCase())
    countries.push(country)
  }
  return countries
}

function validate(form) {
  const maxWalletBudget = Number(form.maxWalletBudget)
  const maxPerTransaction = Number(form.maxPerTransaction)
  const dailyTransactionLimit = Number(form.dailyTransactionLimit)
  const monthlyTransactionLimit = Number(form.monthlyTransactionLimit)
  const pinRequiredAbove = Number(form.pinRequiredAbove)

  if (!form.maxWalletBudget || !Number.isFinite(maxWalletBudget) || maxWalletBudget <= 0) {
    return 'Maximum Wallet Budget is required and must be greater than ₹0.'
  }
  if (!form.maxPerTransaction || !Number.isFinite(maxPerTransaction) || maxPerTransaction <= 0) {
    return 'Maximum Per Transaction is required and must be greater than ₹0.'
  }
  if (maxPerTransaction > maxWalletBudget) {
    return 'Maximum Per Transaction cannot exceed the Maximum Wallet Budget.'
  }
  if (!form.dailyTransactionLimit || !Number.isFinite(dailyTransactionLimit) || dailyTransactionLimit <= 0) {
    return 'Daily Transaction Limit is required and must be greater than ₹0.'
  }
  if (dailyTransactionLimit > maxWalletBudget) {
    return 'Daily Transaction Limit cannot exceed the Maximum Wallet Budget.'
  }
  if (!form.monthlyTransactionLimit || !Number.isFinite(monthlyTransactionLimit) || monthlyTransactionLimit <= 0) {
    return 'Monthly Transaction Limit is required and must be greater than ₹0.'
  }
  if (monthlyTransactionLimit > maxWalletBudget) {
    return 'Monthly Transaction Limit cannot exceed the Maximum Wallet Budget.'
  }
  if (!form.pinRequiredAbove || !Number.isFinite(pinRequiredAbove) || pinRequiredAbove <= 0) {
    return 'PIN threshold is required and must be greater than ₹0.'
  }
  return null
}

function AiWalletPolicyModal({ isOpen, wallet, onClose, onSaved }) {
  const [isLoading, setIsLoading] = useState(true)
  const [existingPolicy, setExistingPolicy] = useState(null)
  const [merchants, setMerchants] = useState([])
  const [form, setForm] = useState(null)
  const [resetState, setResetState] = useState(null)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!isOpen || !wallet) return
    let isMounted = true
    setIsLoading(true)
    setError('')

    Promise.all([
      aiWalletPolicyService.getPolicy(wallet.id).catch((err) => {
        if (err.response?.status === 404) return null
        throw err
      }),
      merchantService.getMerchants(),
    ])
      .then(([policy, merchantsData]) => {
        if (!isMounted) return
        setExistingPolicy(policy)
        setMerchants(merchantsData)
        const initialForm = policy ? formStateFromPolicy(policy) : defaultFormState(wallet)
        setForm(initialForm)
        setResetState(initialForm)
      })
      .catch((err) => {
        if (isMounted) setError(getErrorMessage(err))
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [isOpen, wallet])

  useEscapeKey(isOpen, onClose)
  useFocusTrap(dialogRef, isOpen)

  if (!isOpen || !wallet) return null

  function updateForm(patch) {
    setForm((prev) => ({ ...prev, ...patch }))
  }

  function handleReset() {
    setError('')
    setForm(resetState)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationError = validate(form)
    if (validationError) {
      setError(validationError)
      return
    }

    const payload = {
      maxWalletBudget: Number(form.maxWalletBudget),
      maxPerTransaction: Number(form.maxPerTransaction),
      dailyTransactionLimit: Number(form.dailyTransactionLimit),
      monthlyTransactionLimit: Number(form.monthlyTransactionLimit),
      pinRequiredAbove: Number(form.pinRequiredAbove),
      allowedMerchantIds: form.allowedMerchantIds,
      blockedCategories: form.blockedCategories,
      allowedCountries: parseCountries(form.allowedCountriesText),
      autoExpireWithWallet: form.autoExpireWithWallet,
      isEnabled: form.isEnabled,
    }

    setError('')
    setIsSubmitting(true)
    try {
      if (existingPolicy) {
        await aiWalletPolicyService.updatePolicy(wallet.id, payload)
      } else {
        await aiWalletPolicyService.createPolicy(wallet.id, payload)
      }
      onSaved?.()
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
        aria-label="Wallet Policy"
        className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 className="text-lg font-semibold text-slate-800">{wallet.name} Policy</h2>
        <p className="mt-1 text-sm text-slate-500">
          Set spending limits and restrictions for this AI Wallet.
        </p>

        {error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        {isLoading || !form ? (
          <p className="py-10 text-center text-sm text-slate-400">Loading policy…</p>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="mt-4 flex-1 overflow-y-auto">
            <div className="flex flex-col gap-4 pr-1">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Maximum Wallet Budget (₹)"
                  id="policy-max-wallet-budget"
                  type="number"
                  min="1"
                  step="0.01"
                  value={form.maxWalletBudget}
                  onChange={(event) => updateForm({ maxWalletBudget: event.target.value })}
                />
                <Input
                  label="Maximum Per Transaction (₹)"
                  id="policy-max-per-transaction"
                  type="number"
                  min="1"
                  step="0.01"
                  value={form.maxPerTransaction}
                  onChange={(event) => updateForm({ maxPerTransaction: event.target.value })}
                />
                <Input
                  label="Daily Transaction Limit (₹)"
                  id="policy-daily-limit"
                  type="number"
                  min="1"
                  step="0.01"
                  value={form.dailyTransactionLimit}
                  onChange={(event) => updateForm({ dailyTransactionLimit: event.target.value })}
                />
                <Input
                  label="Monthly Transaction Limit (₹)"
                  id="policy-monthly-limit"
                  type="number"
                  min="1"
                  step="0.01"
                  value={form.monthlyTransactionLimit}
                  onChange={(event) => updateForm({ monthlyTransactionLimit: event.target.value })}
                />
                <Input
                  label="Require PIN Above (₹)"
                  id="policy-pin-threshold"
                  type="number"
                  min="1"
                  step="0.01"
                  value={form.pinRequiredAbove}
                  onChange={(event) => updateForm({ pinRequiredAbove: event.target.value })}
                />
                <Input
                  label="Allowed Countries (optional)"
                  id="policy-allowed-countries"
                  placeholder="e.g. IN, US, GB"
                  value={form.allowedCountriesText}
                  onChange={(event) => updateForm({ allowedCountriesText: event.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-slate-700">Allowed Merchants</span>
                {merchants.length > 0 ? (
                  <div className="flex flex-col gap-1.5 rounded-xl border border-slate-200 p-3">
                    {merchants.map((merchant) => (
                      <label key={merchant.id} className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={form.allowedMerchantIds.includes(merchant.id)}
                          onChange={() =>
                            updateForm({ allowedMerchantIds: toggleInArray(form.allowedMerchantIds, merchant.id) })
                          }
                        />
                        {merchant.name}
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No merchants yet — all merchants stay unrestricted.</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-slate-700">Blocked Categories</span>
                <div className="flex flex-col gap-1.5 rounded-xl border border-slate-200 p-3">
                  {CATEGORY_OPTIONS.map((category) => (
                    <label key={category} className="flex items-center gap-2 text-sm capitalize text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.blockedCategories.includes(category)}
                        onChange={() =>
                          updateForm({ blockedCategories: toggleInArray(form.blockedCategories, category) })
                        }
                      />
                      {category}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.autoExpireWithWallet}
                    onChange={(event) => updateForm({ autoExpireWithWallet: event.target.checked })}
                  />
                  Auto-expire this policy when the wallet expires
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.isEnabled}
                    onChange={(event) => updateForm({ isEnabled: event.target.checked })}
                  />
                  Policy Enabled
                </label>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
              <Button type="button" variant="outline" onClick={handleReset}>
                Reset
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting} loadingText="Saving…">
                Save Policy
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default AiWalletPolicyModal
