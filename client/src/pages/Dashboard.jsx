import { Link } from 'react-router-dom'
import { Wallet, TrendingUp, Clock, Receipt } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout.jsx'
import Card from '../components/common/Card.jsx'
import SectionHeader from '../components/common/SectionHeader.jsx'
import StatCard from '../components/common/StatCard.jsx'
import StatCardSkeleton from '../components/common/StatCardSkeleton.jsx'
import WalletListItem from '../components/wallet/WalletListItem.jsx'
import WalletListItemSkeleton from '../components/wallet/WalletListItemSkeleton.jsx'
import ActivityListItem from '../components/ai/ActivityListItem.jsx'
import ActivityListItemSkeleton from '../components/ai/ActivityListItemSkeleton.jsx'
import TransactionsTable from '../components/transactions/TransactionsTable.jsx'
import TransactionsTableSkeleton from '../components/transactions/TransactionsTableSkeleton.jsx'
import { useApp } from '../hooks/useApp.js'
import { useSimulatedLoading } from '../hooks/useSimulatedLoading.js'
import { wallets } from '../data/wallets.js'
import { aiActivity } from '../data/aiActivity.js'
import { transactions } from '../data/transactions.js'
import { dashboardStats } from '../data/dashboardStats.js'
import { formatCurrency } from '../utils/formatCurrency.js'

const RECENT_TRANSACTIONS = transactions.slice(0, 4)

function Dashboard() {
  const { user } = useApp()
  const isLoading = useSimulatedLoading()

  const firstName = user.name.split(' ')[0]

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Good Morning, {firstName}! 👋</h1>
          <p className="mt-1 text-sm text-slate-500">
            Here&apos;s what&apos;s happening with your wallets today.
          </p>
        </div>

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
                icon={<Wallet size={18} />}
                label="Total Balance"
                value={formatCurrency(dashboardStats.totalBalance)}
                meta={`Across ${dashboardStats.totalWallets} Wallets`}
              />
              <StatCard
                icon={<TrendingUp size={18} />}
                label="Total Spent (This Month)"
                value={formatCurrency(dashboardStats.totalSpent)}
                trend={dashboardStats.spentTrend}
                meta="vs last month"
              />
              <StatCard
                icon={<Clock size={18} />}
                label="Pending Approvals"
                value={dashboardStats.pendingApprovals}
                meta="Requires your action"
              />
              <StatCard
                icon={<Receipt size={18} />}
                label="Total Transactions"
                value={dashboardStats.totalTransactions}
                meta="This month"
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <SectionHeader
              title="Your Wallets"
              action={
                <Link to="/wallets" className="text-sm font-medium text-indigo-600">
                  View all
                </Link>
              }
            />
            <div className="flex flex-col gap-2">
              {isLoading
                ? Array.from({ length: 4 }).map((_, index) => <WalletListItemSkeleton key={index} />)
                : wallets.map((wallet) => <WalletListItem key={wallet.id} wallet={wallet} />)}
            </div>
          </Card>

          <Card>
            <SectionHeader
              title="Recent AI Activity"
              action={
                <Link to="/ai-assistant" className="text-sm font-medium text-indigo-600">
                  View all
                </Link>
              }
            />
            <div className="flex flex-col gap-1">
              {isLoading
                ? Array.from({ length: 4 }).map((_, index) => <ActivityListItemSkeleton key={index} />)
                : aiActivity.map((activity) => <ActivityListItem key={activity.id} activity={activity} />)}
            </div>
          </Card>
        </div>

        <Card>
          <SectionHeader
            title="Recent Transactions"
            action={
              <Link to="/transactions" className="text-sm font-medium text-indigo-600">
                View all
              </Link>
            }
          />
          {isLoading ? (
            <TransactionsTableSkeleton />
          ) : (
            <TransactionsTable transactions={RECENT_TRANSACTIONS} />
          )}
        </Card>
      </div>
    </AppLayout>
  )
}

export default Dashboard
