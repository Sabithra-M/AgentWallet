import axios from 'axios'
import { getToken, clearSession } from './tokenStorage.js'

const baseURL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api`

const api = axios.create({ baseURL })

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearSession()
      window.dispatchEvent(new Event('auth:unauthorized'))
    }
    return Promise.reject(error)
  },
)

export default api
