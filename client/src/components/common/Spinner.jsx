import { Loader2 } from 'lucide-react'

function Spinner({ size = 16, className = '' }) {
  return <Loader2 size={size} className={`animate-spin ${className}`} aria-hidden="true" />
}

export default Spinner
