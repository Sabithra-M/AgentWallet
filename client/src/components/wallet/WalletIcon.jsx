import { Wallet, Sparkles } from 'lucide-react'

const CATEGORY_STYLES = {
  main: { icon: Wallet, className: 'bg-indigo-600 text-white' },
  ai: { icon: Sparkles, className: 'bg-violet-50 text-violet-600' },
}

function WalletIcon({ category, size = 20 }) {
  const config = CATEGORY_STYLES[category] ?? CATEGORY_STYLES.ai
  const Icon = config.icon

  return (
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.className}`}>
      <Icon size={size} />
    </div>
  )
}

export default WalletIcon
