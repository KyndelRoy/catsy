const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export async function apiFetch(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const user = localStorage.getItem('catsy-admin-user')
  if (user) {
    try {
      const { token } = JSON.parse(user)
      if (token) headers['Authorization'] = `Bearer ${token}`
    } catch {}
  }

  const res = await fetch(url, { ...options, headers })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(error.detail || `HTTP ${res.status}`)
  }

  return res.json()
}
