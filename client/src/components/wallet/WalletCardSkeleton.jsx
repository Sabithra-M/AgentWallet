import Card from '../common/Card.jsx'
import Skeleton from '../common/Skeleton.jsx'

function WalletCardSkeleton() {
  return (
    <Card className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="h-4 w-4" />
      </div>

      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
    </Card>
  )
}

export default WalletCardSkeleton
