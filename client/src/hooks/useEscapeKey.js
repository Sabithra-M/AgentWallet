import { useEffect } from 'react'

// Closes a dialog/modal on Escape while it's open — the shared version of a
// pattern every modal in this app previously implemented independently.
export function useEscapeKey(isActive, onEscape) {
  useEffect(() => {
    if (!isActive) return
    function handleKeyDown(event) {
      if (event.key === 'Escape') onEscape?.()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isActive, onEscape])
}
