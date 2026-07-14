import { Download, Search, Receipt, CheckCircle2, Clock, XCircle } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout.jsx'
import Card from '../components/common/Card.jsx'
import SectionHeader from '../components/common/SectionHeader.jsx'
import Button from '../components/common/Button.jsx'
import Input from '../components/common/Input.jsx'
import StatCard from '../components/common/StatCard.jsx'
import StatCardSkeleton from '../components/common/StatCardSkeleton.jsx'
import FilterSelect from '../components/common/FilterSelect.jsx'
import TransactionsTable from '../components/transactions/TransactionsTable.jsx'
import TransactionsTableSkeleton from '../components/transactions/TransactionsTableSkeleton.jsx'
import { useSimulatedLoading } from '../hooks/useSimulatedLoading.js'
import { transactions } from '../data/transactions.js'

const totalCount = transactions.length
const successfulCount = transactions.filter((transaction) => transaction.status === 'Completed').length
const pendingCount = transactions.filter((transaction) => transaction.status === 'Pending').length
const failedCount = transactions.filter((transaction) => transaction.status === 'Failed').length

function Transactions() {
  const isLoading = useSimulatedLoading()

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Transactions</h1>
            <p className="mt-1 text-sm text-slate-500">Track all your wallet transactions.</p>
          </div>
          <Button type="button" variant="outline" icon={<Download size={16} />}>
            Export
          </Button>
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
            />
            <FilterSelect aria-label="Filter by status" defaultValue="All">
              <option>All</option>
              <option>Success</option>
              <option>Pending</option>
              <option>Failed</option>
            </FilterSelect>
            <FilterSelect aria-label="Filter by wallet" defaultValue="All Wallets">
              <option>All Wallets</option>
              <option>Travel</option>
              <option>Shopping</option>
              <option>Food</option>
              <option>Bills</option>
            </FilterSelect>
          </div>

          <div className="pt-4">
            {isLoading ? (
              <TransactionsTableSkeleton rows={8} showDetails />
            ) : (
              <TransactionsTable transactions={transactions} showDetails />
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}

export default Transactions
