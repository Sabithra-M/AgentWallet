import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Wallet, PlusCircle, ScrollText, Bot } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout.jsx'
import Card from '../components/common/Card.jsx'
import SectionHeader from '../components/common/SectionHeader.jsx'
import Button from '../components/common/Button.jsx'
import Skeleton from '../components/common/Skeleton.jsx'
import StatCard from '../components/common/StatCard.jsx'
import StatCardSkeleton from '../components/common/StatCardSkeleton.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import AddMoneyModal from '../components/wallet/AddMoneyModal.jsx'
import CreateAiWalletModal from '../components/wallet/CreateAiWalletModal.jsx'
import EditAiWalletModal from '../components/wallet/EditAiWalletModal.jsx'
import AiWalletCard from '../components/wallet/AiWalletCard.jsx'
import AiWalletPolicyModal from '../components/wallet/AiWalletPolicyModal.jsx'
import ConfirmModal from '../components/common/ConfirmModal.jsx'
import Toast from '../components/common/Toast.jsx'
import PaymentRequestRow from '../components/payments/PaymentRequestRow.jsx'
import AlertsPanel from '../components/dashboard/AlertsPanel.jsx'
import VirtualCardsPanel from '../components/dashboard/VirtualCardsPanel.jsx'
import { useApp } from '../hooks/useApp.js'
import * as walletService from '../services/walletService.js'
import * as paymentRequestService from '../services/paymentRequestService.js'
import * as paymentTransactionService from '../services/paymentTransactionService.js'
import * as merchantService from '../services/merchantService.js'
import * as auditLogService from '../services/auditLogService.js'
import * as aiWalletPolicyService from '../services/aiWalletPolicyService.js'
import * as virtualCardService from '../services/virtualCardService.js'
import { getErrorMessage } from '../utils/errorMessage.js'
import { formatCurrency } from '../utils/formatCurrency.js'
import { formatDate, formatDateTime } from '../utils/formatDateTime.js'
import { toLookup } from '../utils/toLookup.js'

const AUDIT_ACTION_LABELS = {
  'payment_request.approved': 'Payment request approved',
  'payment_request.rejected': 'Payment request rejected',
  'payment_request.executed': 'Payment executed',
}

function Dashboard() {
  const { user, alerts, markAlertRead, markAllAlertsRead, deleteAlert, clearReadAlerts } = useApp()
  const navigate = useNavigate()

  const [wallets, setWallets] = useState([])
  const [transactions, setTransactions] = useState([])
  const [paymentRequests, setPaymentRequests] = useState([])
  const [merchants, setMerchants] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [policies, setPolicies] = useState([])
  const [virtualCards, setVirtualCards] = useState([])
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false)
  const [isCreateAiWalletOpen, setIsCreateAiWalletOpen] = useState(false)
  const [editingAiWallet, setEditingAiWallet] = useState(null)
  const [deletingAiWallet, setDeletingAiWallet] = useState(null)
  const [policyWallet, setPolicyWallet] = useState(null)
  const [toastMessage, setToastMessage] = useState('')
  const [error, setError] = useState('')
  const [loadError, setLoadError] = useState(null)

  function loadDashboard() {
    return Promise.all([
      walletService.getWallets(),
      paymentTransactionService.getTransactions(),
      paymentRequestService.getPaymentRequests(),
      merchantService.getMerchants(),
      auditLogService.getAuditLogs(),
      aiWalletPolicyService.getPolicies(),
      virtualCardService.getVirtualCards(),
    ]).then(
      ([
        walletsData,
        transactionsData,
        paymentRequestsData,
        merchantsData,
        auditLogsData,
        policiesData,
        virtualCardsData,
      ]) => {
        setWallets(walletsData)
        setTransactions(transactionsData)
        setPaymentRequests(paymentRequestsData)
        setMerchants(merchantsData)
        setAuditLogs(auditLogsData)
        setPolicies(policiesData)
        setVirtualCards(virtualCardsData)
      },
    )
  }

  function loadDashboardWithErrorHandling() {
    setLoadError(null)
    return loadDashboard()
      .catch((err) => setLoadError(err))
      .finally(() => setIsDataLoading(false))
  }

  useEffect(() => {
    let isMounted = true
    setIsDataLoading(true)
    loadDashboard()
      .catch((err) => {
        if (isMounted) setLoadError(err)
      })
      .finally(() => {
        if (isMounted) setIsDataLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  async function handleAddMoney(amount) {
    await walletService.addMoney(mainWallet.id, amount)
    await loadDashboard()
    setIsAddMoneyOpen(false)
    setToastMessage(`₹${amount.toLocaleString('en-IN')} added to your Main Wallet.`)
  }

  async function handleCreateAiWallet(data) {
    await walletService.createAiWallet(data)
    await loadDashboard()
    setIsCreateAiWalletOpen(false)
    setToastMessage(`${data.name} was created successfully.`)
  }

  async function handleEditAiWallet(data) {
    await walletService.updateWallet(editingAiWallet.id, data)
    await loadDashboard()
    setEditingAiWallet(null)
    setToastMessage('AI Wallet updated successfully.')
  }

  async function handleToggleStatus(wallet) {
    setError('')
    try {
      await walletService.updateWallet(wallet.id, { status: wallet.status === 'Active' ? 'paused' : 'active' })
      await loadDashboard()
      setToastMessage(`${wallet.name} is now ${wallet.status === 'Active' ? 'inactive' : 'active'}.`)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function handleConfirmDeleteAiWallet() {
    if (!deletingAiWallet) return
    setError('')
    try {
      await walletService.deleteWallet(deletingAiWallet.id)
      await loadDashboard()
      setToastMessage(`${deletingAiWallet.name} was deleted and its remaining budget returned to your Main Wallet.`)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setDeletingAiWallet(null)
    }
  }

  const firstName = user.name.split(' ')[0]

  const mainWallet = wallets.find((wallet) => wallet.isMain)
  const aiWallets = wallets.filter((wallet) => wallet.category === 'ai')
  const activeAiWalletsCount = aiWallets.filter((wallet) => wallet.status === 'Active').length
  const totalAllocatedBudget = aiWallets.reduce((sum, wallet) => sum + wallet.budget, 0)

  const totalBalance = [mainWallet, ...aiWallets]
    .filter(Boolean)
    .reduce((sum, wallet) => sum + wallet.balance, 0)

  const merchantNameById = toLookup(merchants)
  const walletNameById = toLookup(wallets)
  const policyByWalletId = policies.reduce((map, policy) => {
    map[policy.walletId] = policy
    return map
  }, {})

  const recentTopups = transactions
    .filter((t) => t.type === 'Credit' && mainWallet && t.walletId === mainWallet.id)
    .slice(0, 5)

  const recentPayments = [...paymentRequests]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  const recentAuditLogs = [...auditLogs]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Good Morning, {firstName}! 👋</h1>
          <p className="mt-1 text-sm text-slate-500">
            Here&apos;s what&apos;s happening with your AI wallets today.
          </p>
        </div>

        {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}

        {!isDataLoading && loadError ? (
          <ErrorState error={loadError} onRetry={loadDashboardWithErrorHandling} />
        ) : (
          <>
        {isDataLoading ? (
          <StatCardSkeleton />
        ) : (
          <StatCard
            variant="highlighted"
            icon={<Wallet size={18} />}
            label="Total Balance"
            value={formatCurrency(totalBalance)}
            meta={`Main Wallet + ${aiWallets.length} AI Wallet${aiWallets.length === 1 ? '' : 's'}`}
          />
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium text-slate-500">Main Wallet</p>
              {isDataLoading ? (
                <Skeleton className="mt-2 h-8 w-32" />
              ) : (
                <p className="mt-1 text-2xl font-semibold text-slate-800">
                  {formatCurrency(mainWallet?.balance ?? 0)}
                </p>
              )}
            </div>
            <Button
              type="button"
              icon={<PlusCircle size={16} />}
              disabled={isDataLoading || !mainWallet}
              title={!isDataLoading && !mainWallet ? 'Your Main Wallet is still being set up. Please refresh.' : undefined}
              onClick={() => setIsAddMoneyOpen(true)}
            >
              Add Money
            </Button>
          </Card>

          <Card>
            <SectionHeader title="Recent Top-ups" />
            <div className="flex flex-col divide-y divide-slate-100">
              {isDataLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between py-2.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))
              ) : recentTopups.length > 0 ? (
                recentTopups.map((topup) => (
                  <div key={topup.id} className="flex items-center justify-between py-2.5">
                    <span className="text-sm text-slate-600">{formatDate(topup.transactedAt)}</span>
                    <span className="text-sm font-semibold text-emerald-600">
                      +{formatCurrency(topup.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="py-6 text-center text-sm text-slate-400">No top-ups yet.</p>
              )}
            </div>
          </Card>
        </div>

        <div>
          <SectionHeader
            title="AI Wallets"
            action={
              <div className="flex items-center gap-4">
                <span className="hidden text-sm text-slate-400 sm:inline">
                  {activeAiWalletsCount} active · {formatCurrency(totalAllocatedBudget)} allocated
                </span>
                <Button
                  type="button"
                  icon={<PlusCircle size={16} />}
                  disabled={isDataLoading || !mainWallet}
                  onClick={() => setIsCreateAiWalletOpen(true)}
                >
                  Create AI Wallet
                </Button>
              </div>
            }
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {isDataLoading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : aiWallets.length > 0 ? (
              aiWallets.map((wallet) => (
                <AiWalletCard
                  key={wallet.id}
                  wallet={wallet}
                  policy={policyByWalletId[wallet.id]}
                  onEdit={() => setEditingAiWallet(wallet)}
                  onToggleStatus={() => handleToggleStatus(wallet)}
                  onViewDetails={() => navigate(`/wallets/${wallet.id}`)}
                  onDelete={() => setDeletingAiWallet(wallet)}
                  onOpenPolicy={() => setPolicyWallet(wallet)}
                />
              ))
            ) : (
              <Card className="sm:col-span-2 lg:col-span-3">
                <EmptyState
                  icon={<Wallet size={22} />}
                  title="No AI Wallets yet"
                  description="Create one to allocate budget for a specific task."
                  actionLabel="Create AI Wallet"
                  onAction={() => setIsCreateAiWalletOpen(true)}
                />
              </Card>
            )}
          </div>
        </div>

        <Card>
          <SectionHeader
            title="Recent AI Payments"
            action={
              <Link to="/payment-requests" className="text-sm font-medium text-indigo-600">
                View all
              </Link>
            }
          />
          {isDataLoading ? (
            <div className="flex flex-col divide-y divide-slate-100">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between py-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : recentPayments.length > 0 ? (
            <div className="flex flex-col divide-y divide-slate-100">
              {recentPayments.map((request) => (
                <PaymentRequestRow
                  key={request.id}
                  merchantName={merchantNameById[request.merchantId] ?? 'Unknown Merchant'}
                  walletName={walletNameById[request.walletId] ?? 'Unknown Wallet'}
                  amount={request.amount}
                  status={request.status}
                  date={request.createdAt}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Bot size={22} />}
              title="No AI payment requests yet"
              description="Ask the AI Assistant to book, buy, or pay for something."
              actionLabel="Open AI Assistant"
              actionHref="/ai-assistant"
            />
          )}
        </Card>

        <Card>
          <SectionHeader title="Virtual Cards" />
          {isDataLoading ? (
            <div className="flex flex-col divide-y divide-slate-100">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between py-3">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <VirtualCardsPanel
              cards={virtualCards}
              walletNameById={walletNameById}
              merchantNameById={merchantNameById}
            />
          )}
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            {isDataLoading ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <AlertsPanel
                alerts={alerts}
                onMarkRead={markAlertRead}
                onMarkAllRead={markAllAlertsRead}
                onDelete={deleteAlert}
                onClearRead={clearReadAlerts}
              />
            )}
          </Card>

          <Card>
            <SectionHeader title="Recent Audit Logs" />
            {isDataLoading ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : recentAuditLogs.length > 0 ? (
              <div className="flex flex-col divide-y divide-slate-100">
                {recentAuditLogs.map((log) => (
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
              <EmptyState
                icon={<ScrollText size={22} />}
                title="No audit log entries yet"
                description="Actions like approvals and payments will show up here."
              />
            )}
          </Card>
        </div>
        </>
        )}
      </div>

      <AddMoneyModal
        isOpen={isAddMoneyOpen}
        onClose={() => setIsAddMoneyOpen(false)}
        onSubmit={handleAddMoney}
      />

      <CreateAiWalletModal
        isOpen={isCreateAiWalletOpen}
        onClose={() => setIsCreateAiWalletOpen(false)}
        onSubmit={handleCreateAiWallet}
        mainWalletBalance={mainWallet?.balance ?? 0}
      />

      <EditAiWalletModal
        isOpen={Boolean(editingAiWallet)}
        wallet={editingAiWallet}
        onClose={() => setEditingAiWallet(null)}
        onSubmit={handleEditAiWallet}
      />

      <ConfirmModal
        isOpen={Boolean(deletingAiWallet)}
        title="Delete AI Wallet?"
        description={
          deletingAiWallet
            ? `${formatCurrency(deletingAiWallet.balance)} will be returned to your Main Wallet. This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        onConfirm={handleConfirmDeleteAiWallet}
        onCancel={() => setDeletingAiWallet(null)}
      />

      <AiWalletPolicyModal
        isOpen={Boolean(policyWallet)}
        wallet={policyWallet}
        onClose={() => setPolicyWallet(null)}
        onSaved={() => {
          loadDashboard()
          setPolicyWallet(null)
          setToastMessage('Policy saved successfully.')
        }}
      />

      <Toast message={toastMessage} onDismiss={() => setToastMessage('')} />
    </AppLayout>
  )
}

export default Dashboard
