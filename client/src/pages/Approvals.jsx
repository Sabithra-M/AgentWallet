import { useEffect, useMemo, useState } from 'react'
import { RefreshCw, Search, Clock, CheckCircle2, XCircle, Wallet } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout.jsx'
import Card from '../components/common/Card.jsx'
import SectionHeader from '../components/common/SectionHeader.jsx'
import Button from '../components/common/Button.jsx'
import Input from '../components/common/Input.jsx'
import StatCard from '../components/common/StatCard.jsx'
import StatCardSkeleton from '../components/common/StatCardSkeleton.jsx'
import FilterSelect from '../components/common/FilterSelect.jsx'
import ApprovalCard from '../components/approvals/ApprovalCard.jsx'
import ApprovalCardSkeleton from '../components/approvals/ApprovalCardSkeleton.jsx'
import * as walletService from '../services/walletService.js'
import * as merchantService from '../services/merchantService.js'
import * as paymentRequestService from '../services/paymentRequestService.js'
import { getErrorMessage } from '../utils/errorMessage.js'
import { formatCurrency } from '../utils/formatCurrency.js'
import { toLookup } from '../utils/toLookup.js'

function isToday(value) {
  const date = new Date(value)
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

function formatRelativeTime(value) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000))
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

function Approvals() {
  const [wallets, setWallets] = useState([])
  const [merchants, setMerchants] = useState([])
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionPendingId, setActionPendingId] = useState(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [walletFilter, setWalletFilter] = useState('All Wallets')

  function loadAll() {
    setIsLoading(true)
    return Promise.all([
      walletService.getWallets(),
      merchantService.getMerchants(),
      paymentRequestService.getPaymentRequests(),
    ])
      .then(([walletsData, merchantsData, requestsData]) => {
        setWallets(walletsData)
        setMerchants(merchantsData)
        setRequests(requestsData)
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    let isMounted = true
    loadAll().then(() => {
      if (!isMounted) return
    })
    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const walletNameById = toLookup(wallets, (w) => w.name)
  const merchantNameById = toLookup(merchants, (m) => m.name)
  const merchantCategoryById = toLookup(merchants, (m) => m.category)

  const approvals = useMemo(
    () =>
      requests.map((r) => ({
        id: r.id,
        merchant: merchantNameById[r.merchantId] ?? 'Unknown Merchant',
        category: merchantCategoryById[r.merchantId] ?? 'bills',
        wallet: walletNameById[r.walletId] ?? 'Unknown Wallet',
        amount: r.amount,
        requestedTime: formatRelativeTime(r.createdAt),
        reason: r.purpose || 'No purpose provided',
        status: r.status,
        updatedAt: r.updatedAt,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [requests, wallets, merchants],
  )

  const filteredApprovals = approvals.filter((approval) => {
    if (search && !approval.merchant.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter !== 'All' && approval.status !== statusFilter) return false
    if (walletFilter !== 'All Wallets' && approval.wallet !== walletFilter) return false
    return true
  })

  const pendingCount = approvals.filter((a) => a.status === 'Pending').length
  const approvedTodayCount = approvals.filter((a) => a.status === 'Approved' && isToday(a.updatedAt)).length
  const rejectedTodayCount = approvals.filter((a) => a.status === 'Rejected' && isToday(a.updatedAt)).length
  const totalPendingAmount = approvals
    .filter((a) => a.status === 'Pending')
    .reduce((sum, a) => sum + a.amount, 0)

  async function handleApprove(approval) {
    setError('')
    setActionPendingId(approval.id)
    try {
      await paymentRequestService.approvePaymentRequest(approval.id)
      await loadAll()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setActionPendingId(null)
    }
  }

  async function handleReject(approval) {
    setError('')
    setActionPendingId(approval.id)
    try {
      await paymentRequestService.rejectPaymentRequest(approval.id)
      await loadAll()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setActionPendingId(null)
    }
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Payment Approvals</h1>
            <p className="mt-1 text-sm text-slate-500">Review and manage AI payment requests.</p>
          </div>
          <Button type="button" variant="outline" icon={<RefreshCw size={16} />} onClick={loadAll}>
            Refresh
          </Button>
        </div>

        {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                variant="highlighted"
                icon={<Clock size={18} />}
                label="Pending Requests"
                value={pendingCount}
                meta="Awaiting your action"
              />
              <StatCard
                icon={<CheckCircle2 size={18} />}
                label="Approved Today"
                value={approvedTodayCount}
                meta="Completed"
              />
              <StatCard
                icon={<XCircle size={18} />}
                label="Rejected Today"
                value={rejectedTodayCount}
                meta="Declined"
              />
              <StatCard
                icon={<Wallet size={18} />}
                label="Total Amount Pending"
                value={formatCurrency(totalPendingAmount)}
                meta="Across pending requests"
              />
            </>
          )}
        </div>

        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              aria-label="Search approvals"
              placeholder="Search approvals..."
              icon={<Search size={16} />}
              className="sm:max-w-xs"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <FilterSelect
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>All</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
            </FilterSelect>
            <FilterSelect
              aria-label="Filter by wallet"
              value={walletFilter}
              onChange={(event) => setWalletFilter(event.target.value)}
            >
              <option>All Wallets</option>
              {wallets.map((wallet) => (
                <option key={wallet.id}>{wallet.name}</option>
              ))}
            </FilterSelect>
          </div>
        </Card>

        <div>
          <SectionHeader
            title="Approval Requests"
            action={<span className="text-sm text-slate-400">{filteredApprovals.length} requests</span>}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => <ApprovalCardSkeleton key={index} />)
            ) : filteredApprovals.length > 0 ? (
              filteredApprovals.map((approval) => (
                <ApprovalCard
                  key={approval.id}
                  approval={approval}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  isActionPending={actionPendingId === approval.id}
                />
              ))
            ) : (
              <p className="col-span-full py-10 text-center text-sm text-slate-400">
                {requests.length === 0 ? 'No payment requests yet.' : 'No approvals match your filters.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default Approvals
