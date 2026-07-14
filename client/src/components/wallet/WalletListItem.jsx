import { formatCurrency } from '../../utils/formatCurrency.js'
import WalletIcon from './WalletIcon.jsx'

function WalletListItem({ wallet }) {
  return (
    <div className="flex items-center justify-between gap-3 px-1 py-1.5">
      <div className="flex items-center gap-3">
        <WalletIcon category={wallet.category} />
        <span className="text-sm font-medium text-slate-700">{wallet.name}</span>
      </div>
      <span className="text-sm font-semibold text-slate-800">{formatCurrency(wallet.balance)}</span>
    </div>
  )
}

export default WalletListItem
