import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

function BackLink({ to, label }) {
  return (
    <Link
      to={to}
      className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
    >
      <ArrowLeft size={16} />
      {label}
    </Link>
  )
}

export default BackLink
