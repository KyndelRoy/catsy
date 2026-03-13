import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Trash2, EyeOff, Edit2 } from 'lucide-react'
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories } from '../services/productService'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Toast from '../components/ui/Toast'
import StatusBadge from '../components/ui/StatusBadge'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selected, setSelected] = useState([])
  const [modal, setModal] = useState(null) // null | 'add' | product object for edit
  const [confirm, setConfirm] = useState(null)
  const [toast, setToast] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      const [prods, cats] = await Promise.all([getProducts(), getCategories()])
      setProducts(prods)
      setCategories(cats)
    } catch {
      setToast({ message: 'Failed to load products', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = products.filter(p => {
    const matchSearch = p.product_name?.toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter
    return matchSearch && matchCat
  })

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    setSelected(prev => prev.length === filtered.length ? [] : filtered.map(p => p.id))
  }

  const handleDelete = async (ids) => {
    try {
      await Promise.all(ids.map(id => deleteProduct(id)))
      setSelected([])
      setToast({ message: `${ids.length} product(s) deleted`, type: 'success' })
      fetchData()
    } catch {
      setToast({ message: 'Delete failed', type: 'error' })
    }
    setConfirm(null)
  }

  const handleSave = async (formData) => {
    try {
      if (modal && modal.id) {
        await updateProduct(modal.id, formData)
        setToast({ message: 'Product updated', type: 'success' })
      } else {
        await createProduct(formData)
        setToast({ message: 'Product created', type: 'success' })
      }
      setModal(null)
      fetchData()
    } catch {
      setToast({ message: 'Save failed', type: 'error' })
    }
  }

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {confirm && (
        <ConfirmDialog
          title="Delete Products"
          message={`Are you sure you want to delete ${confirm.length} product(s)? This cannot be undone.`}
          onConfirm={() => handleDelete(confirm)}
          onCancel={() => setConfirm(null)}
        />
      )}

      {modal !== null && (
        <ProductFormModal
          product={modal === 'add' ? null : modal}
          categories={categories}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          onClick={() => setModal('add')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm outline-none"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
        >
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c.category_id} value={c.name}>{c.name}</option>
          ))}
        </select>
        <div
          className="flex items-center flex-1 border rounded-lg px-3 py-2"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
        >
          <Search size={16} style={{ color: 'var(--text-secondary)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="ml-2 w-full bg-transparent outline-none text-sm"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* Bulk actions */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
        >
          <span className="font-medium">{selected.length} selected</span>
          <button
            onClick={() => setConfirm(selected)}
            className="flex items-center gap-1 px-3 py-1 rounded-lg text-red-600 bg-red-50 dark:bg-red-500/10 text-xs font-medium"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleSelectAll} className="rounded" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center" style={{ color: 'var(--text-secondary)' }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center" style={{ color: 'var(--text-secondary)' }}>No products found</td></tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id} className="border-b last:border-0 hover:opacity-90" style={{ borderColor: 'var(--border-color)' }}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} className="rounded" />
                    </td>
                    <td className="px-4 py-3 font-medium">{p.product_name}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{p.category}</td>
                    <td className="px-4 py-3">₱{Number(p.product_price).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.product_is_available ? 'Available' : 'Unavailable'} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setModal(p)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700" style={{ color: 'var(--text-secondary)' }}>
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => setConfirm([p.id])} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ProductFormModal({ product, categories, onSave, onClose }) {
  const [form, setForm] = useState({
    product_name: product?.product_name || '',
    product_price: product?.product_price || '',
    category_id: product?.category_id || '',
    product_is_available: product?.product_is_available ?? true,
    product_is_reward: product?.product_is_reward ?? false,
    image_url: product?.image_url || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    await onSave({
      ...form,
      product_price: parseFloat(form.product_price),
      category_id: form.category_id ? parseInt(form.category_id) : null,
    })
    setSaving(false)
  }

  const inputStyle = { backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }

  return (
    <Modal title={product ? 'Edit Product' : 'Add Product'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>Product Name</label>
          <input
            required value={form.product_name} onChange={e => setForm(f => ({ ...f, product_name: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={inputStyle}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>Category</label>
            <select
              value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={inputStyle}
            >
              <option value="">None</option>
              {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>Price (₱)</label>
            <input
              required type="number" step="0.01" min="0" value={form.product_price}
              onChange={e => setForm(f => ({ ...f, product_price: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={inputStyle}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>Image URL</label>
          <input
            value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
            placeholder="https://..."
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={inputStyle}
          />
        </div>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.product_is_available} onChange={e => setForm(f => ({ ...f, product_is_available: e.target.checked }))} />
            Available
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.product_is_reward} onChange={e => setForm(f => ({ ...f, product_is_reward: e.target.checked }))} />
            Reward Item
          </label>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium border" style={{ borderColor: 'var(--border-color)' }}>
            Cancel
          </button>
          <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50" style={{ backgroundColor: 'var(--accent)' }}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
