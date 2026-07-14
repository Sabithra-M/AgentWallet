import { createContext } from 'react'
import { currentUser } from '../data/user.js'
import { notifications } from '../data/notifications.js'

export const AppContext = createContext(null)

export function AppProvider({ children }) {
  const value = {
    user: currentUser,
    notifications,
    unreadCount: notifications.filter((notification) => !notification.read).length,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
