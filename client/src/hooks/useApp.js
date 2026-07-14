import { useContext } from 'react'
import { AppContext } from '../context/AppContext.jsx'

export function useApp() {
  return useContext(AppContext)
}
