import { apiFetch } from './api'

export async function getMaterials() {
  return apiFetch('/api/materials')
}

export async function createMaterial(data) {
  return apiFetch('/api/materials', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateMaterial(id, data) {
  return apiFetch(`/api/materials/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteMaterial(id) {
  return apiFetch(`/api/materials/${id}`, { method: 'DELETE' })
}
