import { apiFetch } from './api'

export async function getReservations() {
  return apiFetch('/api/staff/reservations')
}

export async function createReservation(data) {
  return apiFetch('/api/staff/reservations', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateReservationStatus(id, status) {
  return apiFetch(`/api/staff/reservations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}
