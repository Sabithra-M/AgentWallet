import Skeleton from './Skeleton.jsx'

function StatCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
      <Skeleton className="h-7 w-28" />
      <Skeleton className="h-3 w-24" />
    </div>
  )
}

export default StatCardSkeleton
