import { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout.jsx'
import Card from '../components/common/Card.jsx'
import SectionHeader from '../components/common/SectionHeader.jsx'
import Button from '../components/common/Button.jsx'
import Input from '../components/common/Input.jsx'
import Dropdown from '../components/common/Dropdown.jsx'
import Badge from '../components/common/Badge.jsx'
import BackLink from '../components/common/BackLink.jsx'
import Skeleton from '../components/common/Skeleton.jsx'
import * as walletService from '../services/walletService.js'
import * as merchantService from '../services/merchantService.js'
import * as paymentRequestService from '../services/paymentRequestService.js'
import * as walletPolicyService from '../services/walletPolicyService.js'
import { getErrorMessage } from '../utils/errorMessage.js'
import { formatCurrency } from '../utils/formatCurrency.js'

const NEW_MERCHANT_VALUE = '__new__'

const POLICY_LABELS = {
  per_transaction_limit: 'Per-Transaction Limit',
  monthly_limit: 'Monthly Limit',
  merchant_allowlist: 'Merchant Allow-list',
  merchant_blocklist: 'Merchant Block-list',
  category_restriction: 'Category Restriction',
}

const CATEGORIES = [
  { value: 'travel', label: 'Travel' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'food', label: 'Food' },
  { value: 'bills', label: 'Bills' },
]

function FormSkeleton() {
  return (
    <>
      <Card className="flex flex-col gap-5">
        <Skeleton className="h-5 w-40" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
        <Skeleton className="h-11 w-full rounded-xl" />
      </Card>
      <Card className="flex flex-col gap-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </Card>
    </>
  )
}

function PaymentRequest() {
  const navigate = useNavigate()

  const [wallets, setWallets] = useState([])
  const [merchants, setMerchants] = useState([])
  const [policies, setPolicies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [walletId, setWalletId] = useState('')
  const [merchantId, setMerchantId] = useState('')
  const [newMerchantName, setNewMerchantName] = useState('')
  const [newMerchantCategory, setNewMerchantCategory] = useState('travel')
  const [amount, setAmount] = useState('')
  const [purpose, setPurpose] = useState('')

  useEffect(() => {
    let isMounted = true
    Promise.all([walletService.getWallets(), merchantService.getMerchants(), walletPolicyService.getWalletPolicies()])
      .then(([walletsData, merchantsData, policiesData]) => {
        if (!isMounted) return
        const aiWallets = walletsData.filter((wallet) => wallet.category === 'ai')
        setWallets(aiWallets)
        setMerchants(merchantsData)
        setPolicies(policiesData)
        if (aiWallets.length > 0) setWalletId(aiWallets[0].id)
        setMerchantId(merchantsData.length > 0 ? merchantsData[0].id : NEW_MERCHANT_VALUE)
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
  }, [])

  const selectedWallet = wallets.find((w) => w.id === walletId)
  const walletPolicies = useMemo(
    () => policies.filter((p) => p.walletId === walletId),
    [policies, walletId],
  )

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      let resolvedMerchantId = merchantId
      if (merchantId === NEW_MERCHANT_VALUE) {
        const merchant = await merchantService.createMerchant({
          name: newMerchantName,
          category: newMerchantCategory,
        })
        resolvedMerchantId = merchant.id
      }

      await paymentRequestService.createPaymentRequest({
        walletId,
        merchantId: resolvedMerchantId,
        amount: Number(amount),
        purpose: purpose || undefined,
      })
      navigate('/approvals')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isLoading && wallets.length === 0) {
    return (
      <AppLayout>
        <div className="flex flex-col gap-4">
          <BackLink to="/approvals" label="Back to Approvals" />
          <Card className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-base font-semibold text-slate-700">You need an AI Wallet first</p>
            <p className="max-w-sm text-sm text-slate-500">
              Create an AI Wallet from your Dashboard before requesting a payment from it.
            </p>
            <Link to="/dashboard">
              <Button type="button">Go to Dashboard</Button>
            </Link>
          </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <BackLink to="/approvals" label="Back to Approvals" />

        <div>
          <h1 className="text-xl font-semibold text-slate-800">Payment Request</h1>
          <p className="mt-1 text-sm text-slate-500">Create a new payment request for approval.</p>
        </div>

        {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}

        {isLoading ? (
          <FormSkeleton />
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <Card className="flex flex-col gap-5">
              <SectionHeader title="Request Details" />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Dropdown
                  label="Wallet"
                  id="request-wallet"
                  value={walletId}
                  onChange={(event) => setWalletId(event.target.value)}
                >
                  {wallets.map((wallet) => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name}
                    </option>
                  ))}
                </Dropdown>

                <Dropdown
                  label="Merchant"
                  id="request-merchant"
                  value={merchantId}
                  onChange={(event) => setMerchantId(event.target.value)}
                >
                  {merchants.map((merchant) => (
                    <option key={merchant.id} value={merchant.id}>
                      {merchant.name}
                    </option>
                  ))}
                  <option value={NEW_MERCHANT_VALUE}>+ Add new merchant</option>
                </Dropdown>
              </div>

              {merchantId === NEW_MERCHANT_VALUE && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Input
                    label="New Merchant Name"
                    id="new-merchant-name"
                    placeholder="e.g. IndiGo"
                    value={newMerchantName}
                    onChange={(event) => setNewMerchantName(event.target.value)}
                    required
                  />
                  <Dropdown
                    label="Merchant Category"
                    id="new-merchant-category"
                    value={newMerchantCategory}
                    onChange={(event) => setNewMerchantCategory(event.target.value)}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </Dropdown>
                </div>
              )}

              <Input
                label="Amount"
                id="request-amount"
                type="number"
                min="0"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
              />

              <div className="flex flex-col gap-1.5">
                <label htmlFor="request-purpose" className="text-sm font-semibold text-slate-700">
                  Purpose
                </label>
                <textarea
                  id="request-purpose"
                  rows={3}
                  value={purpose}
                  onChange={(event) => setPurpose(event.target.value)}
                  className="w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400/90 transition-all duration-200 hover:border-slate-300 focus:border-indigo-500 focus:shadow-sm focus:outline-none focus:ring-[4px] focus:ring-indigo-500/15"
                />
              </div>
            </Card>

            <Card className="flex flex-col gap-2">
              <SectionHeader title="Wallet Policies" />
              {walletPolicies.length > 0 ? (
                <div className="flex flex-col">
                  {walletPolicies.map((policy) => (
                    <div
                      key={policy.id}
                      className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-slate-400" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            {POLICY_LABELS[policy.policyType] ?? policy.policyType}
                          </p>
                          {policy.thresholdAmount !== null && (
                            <p className="text-xs text-slate-500">
                              Limit: {formatCurrency(policy.thresholdAmount)}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge status={policy.isActive ? 'Active' : 'Paused'} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-sm text-slate-400">No policies configured for this wallet.</p>
              )}
            </Card>

            {selectedWallet && (
              <Card className="flex flex-col gap-4">
                <SectionHeader title="Payment Summary" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Wallet Balance</p>
                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {formatCurrency(selectedWallet.balance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Wallet Status</p>
                    <p className="mt-1 text-sm font-medium text-slate-700">{selectedWallet.status}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Amount</p>
                    <p className="mt-1 text-xl font-semibold text-slate-800">
                      {amount ? formatCurrency(Number(amount)) : '—'}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link to="/approvals" className="w-full sm:w-auto">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? 'Submitting…' : 'Request Approval'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </AppLayout>
  )
}

export default PaymentRequest
