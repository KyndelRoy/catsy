import { apiFetch } from './api'

export async function getProducts() {
  return apiFetch('/products')
}

export async function createProduct(data) {
  return apiFetch('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateProduct(id, data) {
  return apiFetch(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteProduct(id) {
  return apiFetch(`/products/${id}`, { method: 'DELETE' })
}

export async function getCategories() {
  return apiFetch('/categories')
}

export async function createCategory(data) {
  return apiFetch('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateCategory(id, data) {
  return apiFetch(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteCategory(id) {
  return apiFetch(`/categories/${id}`, { method: 'DELETE' })
}
