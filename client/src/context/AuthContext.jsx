import { createContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as authService from '../services/authService.js'
import { signInWithGoogle, getGoogleRedirectResult } from '../services/firebaseClient.js'
import { getToken, getStoredUser, setSession, clearSession } from '../services/tokenStorage.js'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [token, setToken] = useState(() => getToken())
  const [user, setUser] = useState(() => getStoredUser())

  useEffect(() => {
    function handleUnauthorized() {
      setToken(null)
      setUser(null)
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [])

  // Completes a Google sign-in that used signInWithRedirect() (Safari) — runs
  // once on app load; a no-op if the app wasn't just returned to from that
  // redirect.
  useEffect(() => {
    let isMounted = true

    async function completeRedirectSignIn() {
      const idToken = await getGoogleRedirectResult()
      if (!idToken || !isMounted) return
      const { token: newToken, user: newUser } = await authService.loginWithGoogle({ idToken })
      applySession(newToken, newUser)
      navigate('/dashboard')
    }

    completeRedirectSignIn().catch((error) => {
      console.error('Failed to complete Google redirect sign-in:', error)
    })

    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function applySession(newToken, newUser) {
    setSession(newToken, newUser)
    setToken(newToken)
    setUser(newUser)
    return newUser
  }

  async function login(credentials) {
    const { token: newToken, user: newUser } = await authService.login(credentials)
    return applySession(newToken, newUser)
  }

  async function loginWithGoogle() {
    const idToken = await signInWithGoogle()
    if (!idToken) return null // Safari redirect flow — page is navigating away
    const { token: newToken, user: newUser } = await authService.loginWithGoogle({ idToken })
    return applySession(newToken, newUser)
  }

  async function register(data) {
    return authService.register(data)
  }

  function logout() {
    clearSession()
    setToken(null)
    setUser(null)
  }

  function updateUser(partialUser) {
    const updatedUser = { ...user, ...partialUser }
    setSession(token, updatedUser)
    setUser(updatedUser)
    return updatedUser
  }

  const value = {
    user,
    isAuthenticated: Boolean(token),
    login,
    loginWithGoogle,
    register,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
