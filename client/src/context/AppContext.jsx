import { createContext, useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth.js'
import * as alertService from '../services/alertService.js'

export const AppContext = createContext(null)

export function AppProvider({ children }) {
  const { user, isAuthenticated } = useAuth()
  const [alerts, setAlerts] = useState([])
  const [sseStatus, setSseStatus] = useState('closed')

  useEffect(() => {
    if (!isAuthenticated) {
      setAlerts([])
      setSseStatus('closed')
      return
    }

    let isMounted = true
    alertService
      .getAlerts()
      .then((data) => {
        if (isMounted) setAlerts(data)
      })
      .catch(() => {})

    // Realtime: the Policy Evaluation Engine pushes a new alert over SSE the
    // instant it decides a payment, so the Dashboard/bell update without any
    // polling or refresh.
    const unsubscribe = alertService.subscribeToAlerts(
      (alert) => {
        if (!isMounted) return
        setAlerts((prev) => (prev.some((a) => a.id === alert.id) ? prev : [alert, ...prev]))
      },
      (status) => {
        if (isMounted) setSseStatus(status)
      },
    )

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [isAuthenticated])

  function refreshAlerts() {
    return alertService.getAlerts().then(setAlerts).catch(() => {})
  }

  async function markAlertRead(id) {
    await alertService.markAlertRead(id)
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)))
  }

  async function markAllAlertsRead() {
    await alertService.markAllAlertsRead()
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })))
  }

  async function deleteAlert(id) {
    await alertService.deleteAlert(id)
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }

  async function clearReadAlerts() {
    await alertService.clearReadAlerts()
    setAlerts((prev) => prev.filter((a) => !a.read))
  }

  const value = {
    user,
    alerts,
    unreadAlertCount: alerts.filter((alert) => !alert.read).length,
    sseStatus,
    refreshAlerts,
    markAlertRead,
    markAllAlertsRead,
    deleteAlert,
    clearReadAlerts,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
