import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

let firebaseApp = null
let auth = null

function getFirebaseAuth() {
  console.log(`[DEBUG] getFirebaseAuth() ENTER cached=${Boolean(firebaseApp)}`)
  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
    throw new Error('Firebase is not configured. Set VITE_FIREBASE_* environment variables.')
  }
  if (!firebaseApp) {
    firebaseApp = initializeApp(firebaseConfig)
    auth = getAuth(firebaseApp)
    console.log('[DEBUG] getFirebaseAuth() cold-initialized a new app+auth instance')
  }
  return auth
}

// Safari's popup-gesture heuristic is stricter than Chromium's and does not
// tolerate the async call chain between the click and signInWithPopup() —
// it reports auth/popup-blocked on the first click every time. A full-page
// redirect has no such requirement, so Safari (and any other browser running
// on iOS, since they all use WebKit there regardless of their own branding)
// uses signInWithRedirect() instead.
function isSafariBrowser() {
  const ua = navigator.userAgent
  return /^((?!chrome|android).)*safari/i.test(ua)
}

// Returns the Google ID token directly (popup flow), or null if a redirect
// was started instead — in that case the browser is navigating away and
// getGoogleRedirectResult() picks up the result after the app reloads.
export async function signInWithGoogle() {
  console.log('[DEBUG] signInWithGoogle() ENTER, userAgent =', navigator.userAgent)
  const firebaseAuth = getFirebaseAuth()
  const provider = new GoogleAuthProvider()

  const useRedirect = isSafariBrowser()
  console.log('[DEBUG] isSafariBrowser() =', useRedirect, '-> branch:', useRedirect ? 'REDIRECT' : 'POPUP')

  if (useRedirect) {
    sessionStorage.setItem('google_redirect_debug_marker', String(Date.now()))
    console.log('[DEBUG] wrote sessionStorage marker, calling signInWithRedirect() now')
    await signInWithRedirect(firebaseAuth, provider)
    console.log('[DEBUG] signInWithRedirect() awaited call returned (should not usually be reached — page should have navigated away)')
    return null
  }

  console.log('[DEBUG] calling signInWithPopup() now')
  try {
    const result = await signInWithPopup(firebaseAuth, provider)
    console.log('[DEBUG] signInWithPopup() RESOLVED, result =', result)
    console.log('[DEBUG] result.user exists?', Boolean(result?.user))
    const idToken = await result.user.getIdToken()
    console.log('[DEBUG] getIdToken() resolved, length =', idToken?.length)
    return idToken
  } catch (error) {
    console.log('[DEBUG] signInWithPopup() REJECTED. code =', error.code, 'name =', error.name, 'message =', error.message)
    throw error
  }
}

// Call once on app load. Resolves to null on a normal load; resolves to the
// Google ID token if the app just reloaded after signInWithRedirect().
export async function getGoogleRedirectResult() {
  console.log('[DEBUG] getGoogleRedirectResult() ENTER')
  console.log('[DEBUG] sessionStorage marker present?', sessionStorage.getItem('google_redirect_debug_marker'))
  const firebaseAuth = getFirebaseAuth()
  try {
    const result = await getRedirectResult(firebaseAuth)
    console.log('[DEBUG] getRedirectResult() RESOLVED, result =', result)
    if (!result) {
      console.log('[DEBUG] getRedirectResult() returned null — no pending redirect found')
      return null
    }
    console.log('[DEBUG] result.user exists?', Boolean(result?.user))
    const idToken = await result.user.getIdToken()
    console.log('[DEBUG] getIdToken() (redirect path) resolved, length =', idToken?.length)
    return idToken
  } catch (error) {
    console.log('[DEBUG] getRedirectResult() REJECTED. code =', error.code, 'name =', error.name, 'message =', error.message)
    throw error
  }
}
