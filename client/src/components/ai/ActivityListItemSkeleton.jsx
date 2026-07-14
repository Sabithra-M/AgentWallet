import Skeleton from '../common/Skeleton.jsx'

function ActivityListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <Skeleton className="h-9 w-9 rounded-xl" />
      <div className="flex flex-1 items-center justify-between gap-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  )
}

export default ActivityListItemSkeleton
