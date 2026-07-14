import { useParams, Link } from 'react-router-dom'
import { PlusCircle, Pencil, PauseCircle } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout.jsx'
import Card from '../components/common/Card.jsx'
import SectionHeader from '../components/common/SectionHeader.jsx'
import Badge from '../components/common/Badge.jsx'
import BackLink from '../components/common/BackLink.jsx'
import ProgressBar from '../components/common/ProgressBar.jsx'
import Skeleton from '../components/common/Skeleton.jsx'
import Button from '../components/common/Button.jsx'
import WalletIcon from '../components/wallet/WalletIcon.jsx'
import TransactionsTable from '../components/transactions/TransactionsTable.jsx'
import TransactionsTableSkeleton from '../components/transactions/TransactionsTableSkeleton.jsx'
import { useSimulatedLoading } from '../hooks/useSimulatedLoading.js'
import { wallets } from '../data/wallets.js'
import { transactions } from '../data/transactions.js'
import { formatCurrency } from '../utils/formatCurrency.js'

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

function InsightsCardSkeleton() {
  return (
    <Card className="flex flex-col gap-4">
      <Skeleton className="h-4 w-32" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    </Card>
  )
}

function WalletDetails() {
  const { walletId } = useParams()
  const wallet = wallets.find((item) => item.id === walletId)
  const isLoading = useSimulatedLoading()

  if (!isLoading && !wallet) {
    return (
      <AppLayout>
        <div className="flex flex-col gap-4">
          <BackLink to="/wallets" label="Back to Wallets" />
          <Card className="flex flex-col items-center gap-2 py-16 text-center">
            <p className="text-base font-semibold text-slate-700">Wallet not found</p>
            <p className="max-w-sm text-sm text-slate-500">
              The wallet you&apos;re looking for doesn&apos;t exist or may have been removed.
            </p>
            <Link
              to="/wallets"
              className="mt-2 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
            >
              Go back to Wallets
            </Link>
          </Card>
        </div>
      </AppLayout>
    )
  }

  if (isLoading || !wallet) {
    return (
      <AppLayout>
        <div className="flex flex-col gap-6">
          <BackLink to="/wallets" label="Back to Wallets" />
          <SummaryCardSkeleton />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <SectionHeader title="Recent Transactions" />
              <TransactionsTableSkeleton />
            </Card>
            <InsightsCardSkeleton />
          </div>
        </div>
      </AppLayout>
    )
  }

  const percentage = Math.min(100, Math.round((wallet.balance / wallet.budget) * 100))
  const totalSpent = wallet.budget - wallet.balance
  const walletTransactions = transactions.filter((transaction) => transaction.wallet === wallet.name)

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <BackLink to="/wallets" label="Back to Wallets" />

        <Card className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <WalletIcon category={wallet.category} size={24} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-slate-800">{wallet.name}</h1>
                <Badge status={wallet.status} />
              </div>
              <p className="mt-1 text-sm text-slate-500">{wallet.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Current Balance
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-800">
                {formatCurrency(wallet.balance)}
              </p>
              <p className="text-xs text-slate-500">of {formatCurrency(wallet.budget)} budget</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Monthly Limit
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-800">
                {formatCurrency(wallet.monthlyLimit)}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Budget Usage</span>
              <span className="font-medium text-slate-700">{percentage}%</span>
            </div>
            <ProgressBar value={wallet.balance} max={wallet.budget} className="mt-2" />
          </div>

          <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5">
            <Button type="button" icon={<PlusCircle size={16} />}>
              Add Funds
            </Button>
            <Button type="button" variant="outline" icon={<Pencil size={16} />}>
              Edit Wallet
            </Button>
            <Button type="button" variant="outline" icon={<PauseCircle size={16} />}>
              Pause Wallet
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <SectionHeader title="Recent Transactions" />
            {walletTransactions.length > 0 ? (
              <TransactionsTable transactions={walletTransactions} />
            ) : (
              <p className="py-6 text-center text-sm text-slate-400">
                No transactions yet for this wallet.
              </p>
            )}
          </Card>

          <Card className="flex flex-col gap-4">
            <SectionHeader title="Spending Insights" />
            <div className="flex flex-col divide-y divide-slate-100">
              <div className="flex items-center justify-between py-3 first:pt-0">
                <span className="text-sm text-slate-500">Total Spent</span>
                <span className="text-sm font-semibold text-slate-800">
                  {formatCurrency(totalSpent)}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-slate-500">Remaining Budget</span>
                <span className="text-sm font-semibold text-slate-800">
                  {formatCurrency(wallet.balance)}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 last:pb-0">
                <span className="text-sm text-slate-500">Monthly Limit</span>
                <span className="text-sm font-semibold text-slate-800">
                  {formatCurrency(wallet.monthlyLimit)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}

export default WalletDetails
