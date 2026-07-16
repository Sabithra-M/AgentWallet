import { useEffect, useMemo, useState } from 'react'
import { Search, Receipt, CheckCircle2, Clock, XCircle } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout.jsx'
import Card from '../components/common/Card.jsx'
import SectionHeader from '../components/common/SectionHeader.jsx'
import Input from '../components/common/Input.jsx'
import StatCard from '../components/common/StatCard.jsx'
import StatCardSkeleton from '../components/common/StatCardSkeleton.jsx'
import FilterSelect from '../components/common/FilterSelect.jsx'
import TransactionsTable from '../components/transactions/TransactionsTable.jsx'
import TransactionsTableSkeleton from '../components/transactions/TransactionsTableSkeleton.jsx'
import * as walletService from '../services/walletService.js'
import * as paymentTransactionService from '../services/paymentTransactionService.js'
import * as merchantService from '../services/merchantService.js'
import { getErrorMessage } from '../utils/errorMessage.js'
import { formatDate } from '../utils/formatDateTime.js'
import { toLookup } from '../utils/toLookup.js'

function Transactions() {
  const [wallets, setWallets] = useState([])
  const [merchants, setMerchants] = useState([])
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [walletFilter, setWalletFilter] = useState('All Wallets')

  useEffect(() => {
    let isMounted = true
    Promise.all([walletService.getWallets(), merchantService.getMerchants(), paymentTransactionService.getTransactions()])
      .then(([walletsData, merchantsData, transactionsData]) => {
        if (!isMounted) return
        setWallets(walletsData)
        setMerchants(merchantsData)
        setTransactions(transactionsData)
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

  const walletNameById = toLookup(wallets)
  const merchantNameById = toLookup(merchants)

  const rows = useMemo(
    () =>
      transactions.map((t) => ({
        id: t.id,
        merchant: merchantNameById[t.merchantId] ?? 'Unknown Merchant',
        wallet: walletNameById[t.walletId] ?? 'Unknown Wallet',
        amount: t.amount,
        status: t.status,
        type: t.type,
        date: formatDate(t.transactedAt),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transactions, wallets, merchants],
  )

  const filteredRows = rows.filter((row) => {
    if (search && !row.merchant.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter !== 'All' && row.status !== statusFilter) return false
    if (walletFilter !== 'All Wallets' && row.wallet !== walletFilter) return false
    return true
  })

  const totalCount = transactions.length
  const successfulCount = transactions.filter((t) => t.status === 'Completed').length
  const pendingCount = transactions.filter((t) => t.status === 'Pending').length
  const failedCount = transactions.filter((t) => t.status === 'Failed').length

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Transactions</h1>
            <p className="mt-1 text-sm text-slate-500">Track all your wallet transactions.</p>
          </div>
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
                icon={<Receipt size={18} />}
                label="Total Transactions"
                value={totalCount}
                meta="All transactions"
              />
              <StatCard
                icon={<CheckCircle2 size={18} />}
                label="Successful"
                value={successfulCount}
                meta="Completed"
              />
              <StatCard icon={<Clock size={18} />} label="Pending" value={pendingCount} meta="Awaiting completion" />
              <StatCard icon={<XCircle size={18} />} label="Failed" value={failedCount} meta="Needs attention" />
            </>
          )}
        </div>

        <Card>
          <SectionHeader title="All Transactions" />

          <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
            <Input
              aria-label="Search transactions"
              placeholder="Search transactions..."
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
              <option>Completed</option>
              <option>Pending</option>
              <option>Failed</option>
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

          <div className="pt-4">
            {isLoading ? (
              <TransactionsTableSkeleton rows={8} showDetails />
            ) : filteredRows.length > 0 ? (
              <TransactionsTable transactions={filteredRows} showDetails />
            ) : (
              <p className="py-10 text-center text-sm text-slate-400">
                {transactions.length === 0 ? 'No transactions yet.' : 'No transactions match your filters.'}
              </p>
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}

export default Transactions
