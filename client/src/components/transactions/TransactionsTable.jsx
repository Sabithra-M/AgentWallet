import { MoreVertical } from 'lucide-react'
import Badge from '../common/Badge.jsx'
import { formatCurrency } from '../../utils/formatCurrency.js'

const BASE_COLUMNS = ['Merchant', 'Wallet', 'Amount', 'Status', 'Date']
const DETAIL_COLUMNS = ['Date', 'Merchant', 'Wallet', 'Amount', 'Status', 'Type', 'Actions']

function TransactionsTable({ transactions, showDetails = false }) {
  const columns = showDetails ? DETAIL_COLUMNS : BASE_COLUMNS

  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-left text-sm ${showDetails ? 'min-w-[720px]' : 'min-w-[560px]'}`}>
        <thead>
          <tr className="border-b border-slate-100 text-xs font-medium uppercase tracking-wide text-slate-400">
            {columns.map((column) => (
              <th key={column} className="whitespace-nowrap py-2 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {transactions.map((transaction) =>
            showDetails ? (
              <tr key={transaction.id}>
                <td className="py-3 text-slate-500">{transaction.date}</td>
                <td className="py-3 font-medium text-slate-700">{transaction.merchant}</td>
                <td className="py-3 text-slate-500">{transaction.wallet}</td>
                <td className="py-3 font-medium text-slate-700">{formatCurrency(transaction.amount)}</td>
                <td className="py-3">
                  <Badge status={transaction.status} />
                </td>
                <td className="py-3 text-slate-500">{transaction.type}</td>
                <td className="py-3">
                  <button
                    type="button"
                    className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    aria-label={`Actions for ${transaction.merchant} transaction`}
                  >
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ) : (
              <tr key={transaction.id}>
                <td className="py-3 font-medium text-slate-700">{transaction.merchant}</td>
                <td className="py-3 text-slate-500">{transaction.wallet}</td>
                <td className="py-3 font-medium text-slate-700">{formatCurrency(transaction.amount)}</td>
                <td className="py-3">
                  <Badge status={transaction.status} />
                </td>
                <td className="py-3 text-slate-500">{transaction.date}</td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  )
}

export default TransactionsTable
