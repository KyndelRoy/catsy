import { apiFetch } from './api'

// TODO: Remove dev bypass before production
const DEV_ACCOUNT = {
  email: 'admin@catsy.com',
  password: 'admin123',
}

export async function loginAdmin(email, password) {
  // Dev bypass — works even if backend is offline
  if (email === DEV_ACCOUNT.email && password === DEV_ACCOUNT.password) {
    return {
      id: 'dev-admin-001',
      email: DEV_ACCOUNT.email,
      first_name: 'Dev',
      last_name: 'Admin',
      role: 'admin',
      token: 'dev-token',
    }
  }

  return apiFetch('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}
