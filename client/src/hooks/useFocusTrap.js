import { useEffect } from 'react'

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

function getFocusable(container) {
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.disabled && el.offsetParent !== null,
  )
}

// Traps Tab/Shift+Tab focus inside containerRef while isActive, and restores
// focus to whatever was focused before the dialog opened once it closes.
export function useFocusTrap(containerRef, isActive) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return
    const container = containerRef.current
    const previouslyFocused = document.activeElement

    const focusable = getFocusable(container)
    if (focusable.length > 0 && !container.contains(document.activeElement)) {
      focusable[0].focus()
    }

    function handleKeyDown(event) {
      if (event.key !== 'Tab') return
      const items = getFocusable(container)
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => {
      container.removeEventListener('keydown', handleKeyDown)
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [isActive, containerRef])
}
