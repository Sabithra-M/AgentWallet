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
import { useSimulatedLoading } from '../hooks/useSimulatedLoading.js'
import { approvals } from '../data/approvals.js'
import { formatCurrency } from '../utils/formatCurrency.js'

const pendingCount = approvals.filter((approval) => approval.status === 'Pending').length
const approvedCount = approvals.filter((approval) => approval.status === 'Approved').length
const rejectedCount = approvals.filter((approval) => approval.status === 'Rejected').length
const totalPendingAmount = approvals
  .filter((approval) => approval.status === 'Pending')
  .reduce((sum, approval) => sum + approval.amount, 0)

function Approvals() {
  const isLoading = useSimulatedLoading()

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Payment Approvals</h1>
            <p className="mt-1 text-sm text-slate-500">Review and manage AI payment requests.</p>
          </div>
          <Button type="button" variant="outline" icon={<RefreshCw size={16} />}>
            Refresh
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
                icon={<Clock size={18} />}
                label="Pending Requests"
                value={pendingCount}
                meta="Awaiting your action"
              />
              <StatCard
                icon={<CheckCircle2 size={18} />}
                label="Approved Today"
                value={approvedCount}
                meta="Completed"
              />
              <StatCard icon={<XCircle size={18} />} label="Rejected Today" value={rejectedCount} meta="Declined" />
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
            />
            <FilterSelect aria-label="Filter by status" defaultValue="All">
              <option>All</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
            </FilterSelect>
            <FilterSelect aria-label="Filter by wallet" defaultValue="All Wallets">
              <option>All Wallets</option>
              <option>Travel</option>
              <option>Shopping</option>
              <option>Food</option>
              <option>Bills</option>
            </FilterSelect>
          </div>
        </Card>

        <div>
          <SectionHeader
            title="Approval Requests"
            action={<span className="text-sm text-slate-400">{approvals.length} requests</span>}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {isLoading
              ? Array.from({ length: 4 }).map((_, index) => <ApprovalCardSkeleton key={index} />)
              : approvals.map((approval) => <ApprovalCard key={approval.id} approval={approval} />)}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default Approvals
