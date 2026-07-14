import Skeleton from '../common/Skeleton.jsx'

function WalletListItemSkeleton() {
  return (
    <div className="flex items-center justify-between gap-3 px-1 py-1.5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  )
}

export default WalletListItemSkeleton
