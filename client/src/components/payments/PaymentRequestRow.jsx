import { memo } from 'react'
import Badge from '../common/Badge.jsx'
import { formatCurrency } from '../../utils/formatCurrency.js'
import { formatDate } from '../../utils/formatDateTime.js'

function PaymentRequestRow({ merchantName, walletName, amount, status, date, showWallet = true }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div>
        <p className="text-sm font-medium text-slate-700">{merchantName}</p>
        <p className="text-xs text-slate-500">
          {showWallet && walletName ? `${walletName} · ` : ''}
          {formatDate(date)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-slate-800">{formatCurrency(amount)}</span>
        <Badge status={status} />
      </div>
    </div>
  )
}

export default memo(PaymentRequestRow)
