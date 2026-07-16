import Skeleton from './Skeleton.jsx'

function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="flex flex-col gap-3" role="status" aria-label="Loading table data">
      <div className="flex gap-4 border-b border-slate-100 pb-2">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-1.5">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export default TableSkeleton
