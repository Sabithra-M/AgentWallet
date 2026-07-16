import api from './api.js'

export async function register({ name, email, password }) {
  const response = await api.post('/auth/register', { name, email, password })
  return response.data
}

export async function login({ email, password }) {
  const response = await api.post('/auth/login', { email, password })
  return response.data
}

export async function loginWithGoogle({ idToken }) {
  const response = await api.post('/auth/google', { idToken })
  return response.data
}

export async function forgotPassword({ email }) {
  const response = await api.post('/auth/forgot-password', { email })
  return response.data
}

export async function resetPassword({ token, password }) {
  const response = await api.post('/auth/reset-password', { token, password })
  return response.data
}
