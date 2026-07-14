import { Plane, ShoppingCart, UtensilsCrossed, Tv, Receipt, ArrowLeftRight, Wallet, History } from 'lucide-react'

const TYPE_ICONS = {
  flight: Plane,
  shopping: ShoppingCart,
  food: UtensilsCrossed,
  subscription: Tv,
  bills: Receipt,
  transfer: ArrowLeftRight,
  wallet: Wallet,
  transactions: History,
}

function ActivityListItem({ activity }) {
  const Icon = TYPE_ICONS[activity.type] ?? Plane

  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <Icon size={16} />
      </div>
      <div className="flex flex-1 items-center justify-between gap-2">
        <p className="text-sm text-slate-700">{activity.title}</p>
        <span className="whitespace-nowrap text-xs text-slate-400">{activity.timestamp}</span>
      </div>
    </div>
  )
}

export default ActivityListItem
