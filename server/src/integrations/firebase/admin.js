import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { env } from '../../config/env.js'

let firebaseApp = null

function getFirebaseApp() {
  if (firebaseApp) return firebaseApp

  if (!env.firebase.projectId || !env.firebase.clientEmail || !env.firebase.privateKey) {
    const error = new Error(
      'Firebase Admin credentials are not configured (FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY)',
    )
    error.status = 500
    throw error
  }

  firebaseApp = initializeApp({
    credential: cert({
      projectId: env.firebase.projectId,
      clientEmail: env.firebase.clientEmail,
      privateKey: env.firebase.privateKey,
    }),
  })

  return firebaseApp
}

export async function verifyGoogleIdToken(idToken) {
  const app = getFirebaseApp()
  return getAuth(app).verifyIdToken(idToken)
}
