import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'

function AddWalletCard() {
  return (
    <Link
      to="/wallets/new"
      className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 transition hover:border-indigo-300 hover:text-indigo-500"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400 transition group-hover:bg-indigo-50">
        <Plus size={20} />
      </div>
      <span className="text-sm font-medium">Add New Wallet</span>
    </Link>
  )
}

export default AddWalletCard
