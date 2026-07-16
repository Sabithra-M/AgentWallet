import { memo, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard } from 'lucide-react'
import Badge from '../common/Badge.jsx'
import EmptyState from '../common/EmptyState.jsx'
import { formatCurrency } from '../../utils/formatCurrency.js'
import { capitalize } from '../../utils/capitalize.js'

function useCountdown(expiresAt, status) {
  const [label, setLabel] = useState('')

  useEffect(() => {
    if (status !== 'active') return undefined

    function tick() {
      const remainingMs = new Date(expiresAt).getTime() - Date.now()
      if (remainingMs <= 0) {
        setLabel('Expired')
        return
      }
      const minutes = Math.floor(remainingMs / 60000)
      const seconds = Math.floor((remainingMs % 60000) / 1000)
      setLabel(`${minutes}:${String(seconds).padStart(2, '0')}`)
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [expiresAt, status])

  return label
}

const VirtualCardRow = memo(function VirtualCardRow({ card, walletName, merchantName }) {
  const navigate = useNavigate()
  const countdown = useCountdown(card.expiresAt, card.status)
  const displayStatus = card.status === 'active' && countdown === 'Expired' ? 'Expired' : capitalize(card.status)

  return (
    <button
      type="button"
      onClick={() => navigate(`/virtual-cards/${card.id}`)}
      className="flex w-full items-center justify-between gap-3 py-3 text-left transition-colors hover:bg-slate-50"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <CreditCard size={16} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700">{card.cardNumber}</p>
          <p className="text-xs text-slate-500">
            {walletName} · {merchantName}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-slate-800">{formatCurrency(card.spendingLimit)}</p>
        <div className="mt-0.5 flex items-center justify-end gap-2">
          {card.status === 'active' && <span className="text-xs text-slate-400">{countdown}</span>}
          <Badge status={displayStatus} />
        </div>
      </div>
    </button>
  )
})

function VirtualCardsPanel({ cards, walletNameById, merchantNameById }) {
  const sortedCards = [...cards].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  if (sortedCards.length === 0) {
    return (
      <EmptyState
        icon={<CreditCard size={22} />}
        title="No virtual cards yet"
        description="One is created automatically whenever an AI payment is approved."
      />
    )
  }

  return (
    <div className="flex flex-col divide-y divide-slate-100">
      {sortedCards.map((card) => (
        <VirtualCardRow
          key={card.id}
          card={card}
          walletName={walletNameById[card.walletId] ?? 'Unknown Wallet'}
          merchantName={merchantNameById[card.merchantId] ?? 'Unknown Merchant'}
        />
      ))}
    </div>
  )
}

export default VirtualCardsPanel
