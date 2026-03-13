import { apiFetch } from './api'

export async function getDashboardStats() {
  return apiFetch('/api/admin/dashboard')
}
