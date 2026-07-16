import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Pencil, PauseCircle, PlayCircle, Trash2, ShieldCheck, Bell, ScrollText, Receipt } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout.jsx'
import Card from '../components/common/Card.jsx'
import SectionHeader from '../components/common/SectionHeader.jsx'
import Badge from '../components/common/Badge.jsx'
import BackLink from '../components/common/BackLink.jsx'
import ProgressBar from '../components/common/ProgressBar.jsx'
import Skeleton from '../components/common/Skeleton.jsx'
import Button from '../components/common/Button.jsx'
import ConfirmModal from '../components/common/ConfirmModal.jsx'
import Toast from '../components/common/Toast.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import WalletIcon from '../components/wallet/WalletIcon.jsx'
import EditAiWalletModal from '../components/wallet/EditAiWalletModal.jsx'
import AiWalletPolicyModal from '../components/wallet/AiWalletPolicyModal.jsx'
import PaymentRequestRow from '../components/payments/PaymentRequestRow.jsx'
import * as walletService from '../services/walletService.js'
import * as merchantService from '../services/merchantService.js'
import * as paymentRequestService from '../services/paymentRequestService.js'
import * as aiWalletPolicyService from '../services/aiWalletPolicyService.js'
import * as notificationService from '../services/notificationService.js'
import * as auditLogService from '../services/auditLogService.js'
import { getErrorMessage } from '../utils/errorMessage.js'
import { formatCurrency } from '../utils/formatCurrency.js'
import { formatDateTime } from '../utils/formatDateTime.js'

const AUDIT_ACTION_LABELS = {
  'payment_request.approved': 'Payment request approved',
  'payment_request.rejected': 'Payment request rejected',
  'payment_request.executed': 'Payment executed',
}

function SummaryCardSkeleton() {
  return (
    <Card className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-32" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-32" />
        </div>
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
      <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5">
        <Skeleton className="h-9 w-28 rounded-lg" />
        <Skeleton className="h-9 w-28 rounded-lg" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
    </Card>
  )
}

function WalletDetails() {
  const { walletId } = useParams()
  const navigate = useNavigate()

  const [wallet, setWallet] = useState(null)
  const [merchants, setMerchants] = useState([])
  const [paymentRequests, setPaymentRequests] = useState([])
  const [policy, setPolicy] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  function loadAll() {
    return Promise.all([
      walletService.getWallet(walletId),
      merchantService.getMerchants(),
      paymentRequestService.getPaymentRequests(),
      aiWalletPolicyService.getPolicy(walletId).catch((err) => {
        if (err.response?.status === 404) return null
        throw err
      }),
      notificationService.getNotifications(),
      auditLogService.getAuditLogs(),
    ]).then(([walletData, merchantsData, paymentRequestsData, policyData, notificationsData, auditLogsData]) => {
      setWallet(walletData)
      setMerchants(merchantsData)
      setPaymentRequests(paymentRequestsData)
      setPolicy(policyData)
      setNotifications(notificationsData)
      setAuditLogs(auditLogsData)
    })
  }

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    setError('')
    loadAll()
      .catch((err) => {
        if (isMounted) setError(getErrorMessage(err))
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletId])

  useEffect(() => {
    if (wallet && wallet.isMain) navigate('/dashboard', { replace: true })
  }, [wallet, navigate])

  async function handleEdit(data) {
    await walletService.updateWallet(wallet.id, data)
    await loadAll()
    setIsEditOpen(false)
    setToastMessage('AI Wallet updated successfully.')
  }

  async function handleToggleStatus() {
    setError('')
    try {
      const nextStatus = wallet.status === 'Active' ? 'paused' : 'active'
      await walletService.updateWallet(wallet.id, { status: nextStatus })
      await loadAll()
      setToastMessage(`${wallet.name} is now ${nextStatus === 'active' ? 'active' : 'inactive'}.`)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function handleConfirmDelete() {
    setError('')
    try {
      await walletService.deleteWallet(wallet.id)
      navigate('/dashboard')
    } catch (err) {
      setError(getErrorMessage(err))
      setIsDeleteOpen(false)
    }
  }

  if (!isLoading && (error || !wallet)) {
    return (
      <AppLayout>
        <div className="flex flex-col gap-4">
          <BackLink to="/dashboard" label="Back to Dashboard" />
          <Card className="flex flex-col items-center gap-2 py-16 text-center">
            <p className="text-base font-semibold text-slate-700">Wallet not found</p>
            <p className="max-w-sm text-sm text-slate-500">
              The wallet you&apos;re looking for doesn&apos;t exist or may have been removed.
            </p>
            <Link
              to="/dashboard"
              className="mt-2 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
            >
              Go back to Dashboard
            </Link>
          </Card>
        </div>
      </AppLayout>
    )
  }

  if (isLoading || !wallet || wallet.isMain) {
    return (
      <AppLayout>
        <div className="flex flex-col gap-6">
          <BackLink to="/dashboard" label="Back to Dashboard" />
          <SummaryCardSkeleton />
        </div>
      </AppLayout>
    )
  }

  const merchantNameById = merchants.reduce((map, m) => {
    map[m.id] = m.name
    return map
  }, {})

  const walletPaymentRequests = paymentRequests
    .filter((r) => r.walletId === wallet.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const walletAlerts = notifications
    .filter((n) => n.walletId === wallet.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const walletRequestIds = new Set(walletPaymentRequests.map((r) => r.id))
  const walletAuditLogs = auditLogs
    .filter((log) => log.entityType === 'payment_request' && walletRequestIds.has(log.entityId))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const isExpired = wallet.expiresAt && new Date(wallet.expiresAt).getTime() < Date.now()
  const displayStatus = isExpired ? 'Expired' : wallet.status === 'Paused' ? 'Inactive' : wallet.status
  const isActive = wallet.status === 'Active'

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <BackLink to="/dashboard" label="Back to Dashboard" />

        {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}

        <Card className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <WalletIcon category="ai" size={24} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-slate-800">{wallet.name}</h1>
                <Badge status={displayStatus} />
              </div>
              {wallet.description && <p className="mt-1 text-sm text-slate-500">{wallet.description}</p>}
              <p className="mt-1 text-xs text-slate-400">
                Created {formatDateTime(wallet.createdAt)}
                {wallet.expiresAt && ` · Expires ${formatDateTime(wallet.expiresAt)}`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Remaining Balance</p>
              <p className="mt-1 text-2xl font-semibold text-slate-800">{formatCurrency(wallet.balance)}</p>
              <p className="text-xs text-slate-500">of {formatCurrency(wallet.budget)} allocated</p>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Budget Usage</span>
                <span className="font-medium text-slate-700">
                  {Math.min(100, Math.round(((wallet.budget - wallet.balance) / wallet.budget) * 100))}%
                </span>
              </div>
              <ProgressBar value={wallet.budget - wallet.balance} max={wallet.budget} className="mt-2" />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5">
            <Button type="button" variant="outline" icon={<Pencil size={16} />} onClick={() => setIsEditOpen(true)}>
              Edit Wallet
            </Button>
            <Button
              type="button"
              variant="outline"
              icon={isActive ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
              onClick={handleToggleStatus}
            >
              {isActive ? 'Pause Wallet' : 'Resume Wallet'}
            </Button>
            <Button
              type="button"
              variant="outline"
              icon={<ShieldCheck size={16} />}
              onClick={() => setIsPolicyModalOpen(true)}
            >
              {policy ? 'Edit Policy' : 'Set Up Policy'}
            </Button>
            <Button
              type="button"
              variant="danger"
              icon={<Trash2 size={16} />}
              onClick={() => setIsDeleteOpen(true)}
            >
              Delete Wallet
            </Button>
          </div>
        </Card>

        <Card>
          <SectionHeader
            title="Policy"
            action={policy && <Badge status={policy.isEnabled ? 'Enabled' : 'Disabled'} />}
          />
          {policy ? (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Maximum Wallet Budget
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {formatCurrency(policy.maxWalletBudget)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Maximum Per Transaction
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {formatCurrency(policy.maxPerTransaction)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Daily Transaction Limit
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {formatCurrency(policy.dailyTransactionLimit)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Monthly Transaction Limit
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {formatCurrency(policy.monthlyTransactionLimit)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Require PIN Above
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {formatCurrency(policy.pinRequiredAbove)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Auto-Expire With Wallet
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {policy.autoExpireWithWallet ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Allowed Merchants ({policy.allowedMerchantIds.length})
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {policy.allowedMerchantIds.length > 0
                      ? policy.allowedMerchantIds.map((id) => merchantNameById[id] ?? 'Unknown Merchant').join(', ')
                      : 'All merchants allowed'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Blocked Categories ({policy.blockedCategories.length})
                  </p>
                  <p className="mt-1 text-sm capitalize text-slate-600">
                    {policy.blockedCategories.length > 0 ? policy.blockedCategories.join(', ') : 'None'}
                  </p>
                </div>
                {policy.allowedCountries.length > 0 && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Allowed Countries</p>
                    <p className="mt-1 text-sm text-slate-600">{policy.allowedCountries.join(', ')}</p>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-400">Last updated {formatDateTime(policy.updatedAt)}</p>
            </div>
          ) : (
            <EmptyState
              icon={<ShieldCheck size={22} />}
              title="No policy configured yet"
              description="Set one up to define this wallet's spending limits."
              actionLabel="Set Up Policy"
              onAction={() => setIsPolicyModalOpen(true)}
            />
          )}
        </Card>

        <Card>
          <SectionHeader title="Recent AI Payment Requests" />
          {walletPaymentRequests.length > 0 ? (
            <div className="flex flex-col divide-y divide-slate-100">
              {walletPaymentRequests.slice(0, 8).map((request) => (
                <PaymentRequestRow
                  key={request.id}
                  merchantName={merchantNameById[request.merchantId] ?? 'Unknown Merchant'}
                  showWallet={false}
                  amount={request.amount}
                  status={request.status}
                  date={request.createdAt}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Receipt size={22} />}
              title="No payment requests for this wallet yet"
              description="Ask the AI Assistant to spend from this wallet."
              actionLabel="Open AI Assistant"
              actionHref="/ai-assistant"
            />
          )}
        </Card>

        <Card>
          <SectionHeader title="Alerts" />
          {walletAlerts.length > 0 ? (
            <div className="flex flex-col divide-y divide-slate-100">
              {walletAlerts.slice(0, 8).map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 py-3">
                  <Bell size={16} className="mt-0.5 shrink-0 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">{alert.title}</p>
                    {alert.description && <p className="text-xs text-slate-500">{alert.description}</p>}
                    <p className="text-xs text-slate-400">{formatDateTime(alert.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<Bell size={22} />} title="No alerts for this wallet yet" />
          )}
        </Card>

        <Card>
          <SectionHeader title="Audit Logs" />
          {walletAuditLogs.length > 0 ? (
            <div className="flex flex-col divide-y divide-slate-100">
              {walletAuditLogs.slice(0, 8).map((log) => (
                <div key={log.id} className="flex items-start gap-3 py-3">
                  <ScrollText size={16} className="mt-0.5 shrink-0 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {AUDIT_ACTION_LABELS[log.action] ?? log.action}
                    </p>
                    <p className="text-xs text-slate-400">{formatDateTime(log.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<ScrollText size={22} />} title="No audit log entries for this wallet yet" />
          )}
        </Card>
      </div>

      <EditAiWalletModal isOpen={isEditOpen} wallet={wallet} onClose={() => setIsEditOpen(false)} onSubmit={handleEdit} />

      <AiWalletPolicyModal
        isOpen={isPolicyModalOpen}
        wallet={wallet}
        onClose={() => setIsPolicyModalOpen(false)}
        onSaved={() => {
          loadAll()
          setIsPolicyModalOpen(false)
          setToastMessage('Policy saved successfully.')
        }}
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        title="Delete AI Wallet?"
        description={`${formatCurrency(wallet.balance)} will be returned to your Main Wallet. This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />

      <Toast message={toastMessage} onDismiss={() => setToastMessage('')} />
    </AppLayout>
  )
}

export default WalletDetails
