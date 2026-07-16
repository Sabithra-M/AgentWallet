import api from './api.js'

function normalizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    theme: user.theme,
    notificationsEnabled: user.notifications_enabled,
    emailAlertsEnabled: user.email_alerts_enabled,
    pushNotificationsEnabled: user.push_notifications_enabled,
    darkModeEnabled: user.dark_mode_enabled,
    defaultWalletId: user.default_wallet_id,
    monthlySpendingLimit: user.monthly_spending_limit === null ? null : Number(user.monthly_spending_limit),
    preferredCurrency: user.preferred_currency,
  }
}

export async function getMe() {
  const response = await api.get('/users/me')
  return normalizeUser(response.data)
}

export async function updateProfile(data) {
  const response = await api.put('/users/me/profile', data)
  return normalizeUser(response.data)
}

export async function updateSettings(data) {
  const response = await api.put('/users/me/settings', data)
  return normalizeUser(response.data)
}
