import { Plane, ShoppingBag, UtensilsCrossed, Receipt } from 'lucide-react'

const CATEGORY_STYLES = {
  travel: { icon: Plane, className: 'bg-sky-50 text-sky-600' },
  shopping: { icon: ShoppingBag, className: 'bg-rose-50 text-rose-600' },
  food: { icon: UtensilsCrossed, className: 'bg-amber-50 text-amber-600' },
  bills: { icon: Receipt, className: 'bg-indigo-50 text-indigo-600' },
}

function WalletIcon({ category, size = 20 }) {
  const config = CATEGORY_STYLES[category] ?? CATEGORY_STYLES.bills
  const Icon = config.icon

  return (
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.className}`}>
      <Icon size={size} />
    </div>
  )
}

export default WalletIcon
