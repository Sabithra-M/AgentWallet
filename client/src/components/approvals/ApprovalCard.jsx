import { memo } from 'react'
import { Check, X } from 'lucide-react'
import Card from '../common/Card.jsx'
import Badge from '../common/Badge.jsx'
import Button from '../common/Button.jsx'
import WalletIcon from '../wallet/WalletIcon.jsx'
import { formatCurrency } from '../../utils/formatCurrency.js'

function ApprovalCard({ approval, onApprove, onReject, isActionPending = false }) {
  const isPending = approval.status === 'Pending'

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <WalletIcon category={approval.category} />
          <div>
            <p className="font-semibold text-slate-800">{approval.merchant}</p>
            <p className="text-xs text-slate-500">{approval.wallet}</p>
          </div>
        </div>
        <Badge status={approval.status} />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Amount</p>
          <p className="mt-1 text-xl font-semibold text-slate-800">{formatCurrency(approval.amount)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Requested</p>
          <p className="mt-1 text-sm text-slate-600">{approval.requestedTime}</p>
        </div>
      </div>

      <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">{approval.reason}</p>

      {isPending && (
        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          <Button
            type="button"
            variant="success"
            icon={<Check size={16} />}
            className="flex-1 justify-center"
            disabled={isActionPending}
            onClick={() => onApprove?.(approval)}
          >
            Approve
          </Button>
          <Button
            type="button"
            variant="danger"
            icon={<X size={16} />}
            className="flex-1 justify-center"
            disabled={isActionPending}
            onClick={() => onReject?.(approval)}
          >
            Reject
          </Button>
        </div>
      )}
    </Card>
  )
}

export default memo(ApprovalCard)
