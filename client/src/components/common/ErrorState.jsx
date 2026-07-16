import { AlertTriangle, WifiOff, RefreshCw } from 'lucide-react'
import Button from './Button.jsx'
import { getErrorMessage } from '../../utils/errorMessage.js'

function ErrorState({ error, message, onRetry, className = '' }) {
  const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false
  const text = message || getErrorMessage(error)
  const Icon = isOffline ? WifiOff : AlertTriangle

  return (
    <div className={`flex flex-col items-center justify-center gap-3 rounded-xl bg-red-50 px-6 py-8 text-center ${className}`}>
      <Icon size={28} className="text-red-500" aria-hidden="true" />
      <p className="text-sm font-medium text-red-700">{text}</p>
      {onRetry && (
        <Button variant="outline" icon={<RefreshCw size={16} />} onClick={onRetry} className="mt-1">
          Retry
        </Button>
      )}
    </div>
  )
}

export default ErrorState
