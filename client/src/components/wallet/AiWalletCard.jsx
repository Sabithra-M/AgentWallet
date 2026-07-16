import { memo } from 'react'
import { ShieldCheck } from 'lucide-react'
import Card from '../common/Card.jsx'
import Badge from '../common/Badge.jsx'
import Button from '../common/Button.jsx'
import WalletIcon from './WalletIcon.jsx'
import WalletActionsMenu from './WalletActionsMenu.jsx'
import PolicySummary from './PolicySummary.jsx'
import { formatCurrency } from '../../utils/formatCurrency.js'
import { formatDate } from '../../utils/formatDateTime.js'

function AiWalletCard({ wallet, policy, onEdit, onToggleStatus, onViewDetails, onDelete, onOpenPolicy }) {
  const isExpired = wallet.expiresAt && new Date(wallet.expiresAt).getTime() < Date.now()
  const displayStatus = isExpired ? 'Expired' : wallet.status === 'Paused' ? 'Inactive' : wallet.status

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <WalletIcon category="ai" />
          <div>
            <p className="font-semibold text-slate-800">{wallet.name}</p>
            {wallet.description && <p className="text-xs text-slate-500">{wallet.description}</p>}
          </div>
        </div>
        <WalletActionsMenu
          wallet={wallet}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
          onViewDetails={onViewDetails}
          onDelete={onDelete}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Remaining Budget</p>
          <p className="mt-1 text-xl font-semibold text-slate-800">{formatCurrency(wallet.balance)}</p>
          <p className="text-xs text-slate-500">of {formatCurrency(wallet.budget)} allocated</p>
        </div>
        <Badge status={displayStatus} />
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span>Expires {wallet.expiresAt ? formatDate(wallet.expiresAt) : '—'}</span>
        <span>Created {formatDate(wallet.createdAt)}</span>
      </div>

      <div className="border-t border-slate-100 pt-3">
        <PolicySummary policy={policy} />
      </div>

      <Button
        type="button"
        variant="outline"
        icon={<ShieldCheck size={16} />}
        className="w-full justify-center"
        onClick={onOpenPolicy}
      >
        Policies
      </Button>
    </Card>
  )
}

export default memo(AiWalletCard)
