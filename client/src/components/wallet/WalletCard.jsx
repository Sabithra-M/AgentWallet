import { Link } from 'react-router-dom'
import { ChevronRight, MoreVertical } from 'lucide-react'
import Card from '../common/Card.jsx'
import Badge from '../common/Badge.jsx'
import ProgressBar from '../common/ProgressBar.jsx'
import WalletIcon from './WalletIcon.jsx'
import { formatCurrency } from '../../utils/formatCurrency.js'

function WalletCard({ wallet }) {
  const percentage = Math.min(100, Math.round((wallet.balance / wallet.budget) * 100))

  return (
    <Link to={`/wallets/${wallet.id}`} className="group block h-full">
      <Card className="flex h-full flex-col gap-4 transition hover:shadow-md hover:ring-1 hover:ring-indigo-100">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <WalletIcon category={wallet.category} />
            <div>
              <p className="font-semibold text-slate-800">{wallet.name}</p>
              <p className="text-xs text-slate-500">{wallet.description}</p>
            </div>
          </div>
          <ChevronRight
            size={18}
            className="mt-1 shrink-0 text-slate-300 transition group-hover:text-indigo-500"
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-semibold text-slate-800">{formatCurrency(wallet.balance)}</span>
            <span className="text-xs text-slate-500">of {formatCurrency(wallet.budget)}</span>
          </div>
          <ProgressBar value={wallet.balance} max={wallet.budget} className="mt-2" />
          <p className="mt-1 text-right text-xs font-medium text-slate-500">{percentage}%</p>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
          <span className="text-slate-500">
            Monthly Limit: <span className="font-medium text-slate-700">{formatCurrency(wallet.monthlyLimit)}</span>
          </span>
          <div className="flex items-center gap-2">
            <Badge status={wallet.status} />
            <MoreVertical size={16} className="text-slate-300" aria-hidden="true" />
          </div>
        </div>
      </Card>
    </Link>
  )
}

export default WalletCard
