import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Edit2, Trash2, AlertTriangle, CheckCircle } from 'lucide-react'
import { getMaterials, createMaterial, updateMaterial, deleteMaterial } from '../services/inventoryService'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Toast from '../components/ui/Toast'

function stockStatus(stock, reorder) {
  if (stock <= 0) return { label: 'Depleted', color: 'text-red-600', icon: AlertTriangle }
  if (stock <= reorder) return { label: 'Low', color: 'text-amber-600', icon: AlertTriangle }
  return { label: 'Good', color: 'text-green-600', icon: CheckCircle }
}

export default function InventoryPage() {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [toast, setToast] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setMaterials(await getMaterials())
    } catch {
      setToast({ message: 'Failed to load materials', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = materials.filter(m =>
    m.material_name?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id) => {
    try {
      await deleteMaterial(id)
      setToast({ message: 'Material deleted', type: 'success' })
      fetchData()
    } catch {
      setToast({ message: 'Delete failed', type: 'error' })
    }
    setConfirm(null)
  }

  const handleSave = async (formData) => {
    try {
      if (modal?.material_id) {
        await updateMaterial(modal.material_id, formData)
        setToast({ message: 'Material updated', type: 'success' })
      } else {
        await createMaterial(formData)
        setToast({ message: 'Material added', type: 'success' })
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
          title="Delete Material"
          message="Are you sure? This cannot be undone."
          onConfirm={() => handleDelete(confirm)}
          onCancel={() => setConfirm(null)}
        />
      )}
      {modal !== null && (
        <MaterialFormModal material={modal === 'add' ? null : modal} onSave={handleSave} onClose={() => setModal(null)} />
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <button onClick={() => setModal('add')} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: 'var(--accent)' }}>
          <Plus size={16} /> Add Material
        </button>
      </div>

      <div className="flex items-center border rounded-lg px-3 py-2 max-w-sm" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <Search size={16} style={{ color: 'var(--text-secondary)' }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search materials..." className="ml-2 w-full bg-transparent outline-none text-sm" style={{ color: 'var(--text-primary)' }} />
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                {['Name', 'Unit', 'Stock', 'Reorder Level', 'Cost/Unit', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center" style={{ color: 'var(--text-secondary)' }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center" style={{ color: 'var(--text-secondary)' }}>No materials found</td></tr>
              ) : (
                filtered.map(m => {
                  const status = stockStatus(m.material_stock, m.material_reorder_level)
                  const StatusIcon = status.icon
                  return (
                    <tr key={m.material_id} className="border-b last:border-0 hover:opacity-90" style={{ borderColor: 'var(--border-color)' }}>
                      <td className="px-4 py-3 font-medium">{m.material_name}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{m.material_unit}</td>
                      <td className="px-4 py-3">{Number(m.material_stock).toLocaleString()}</td>
                      <td className="px-4 py-3">{Number(m.material_reorder_level).toLocaleString()}</td>
                      <td className="px-4 py-3">₱{Number(m.cost_per_unit).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1 text-xs font-semibold ${status.color}`}>
                          <StatusIcon size={14} /> {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setModal(m)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700" style={{ color: 'var(--text-secondary)' }}>
                            <Edit2 size={15} />
                          </button>
                          <button onClick={() => setConfirm(m.material_id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function MaterialFormModal({ material, onSave, onClose }) {
  const [form, setForm] = useState({
    material_name: material?.material_name || '',
    material_unit: material?.material_unit || 'grams',
    material_stock: material?.material_stock ?? '',
    material_reorder_level: material?.material_reorder_level ?? '',
    cost_per_unit: material?.cost_per_unit ?? '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    await onSave({
      ...form,
      material_stock: parseFloat(form.material_stock),
      material_reorder_level: parseFloat(form.material_reorder_level),
      cost_per_unit: parseFloat(form.cost_per_unit),
    })
    setSaving(false)
  }

  const inputStyle = { backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }
  const units = ['grams', 'ml', 'pieces', 'liters', 'kg', 'cups', 'bags']

  return (
    <Modal title={material ? 'Edit Material' : 'Add Material'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>Material Name</label>
          <input required value={form.material_name} onChange={e => setForm(f => ({ ...f, material_name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={inputStyle} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>Unit</label>
            <select value={form.material_unit} onChange={e => setForm(f => ({ ...f, material_unit: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={inputStyle}>
              {units.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>Cost per Unit (₱)</label>
            <input required type="number" step="0.01" min="0" value={form.cost_per_unit} onChange={e => setForm(f => ({ ...f, cost_per_unit: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={inputStyle} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>Current Stock</label>
            <input required type="number" step="0.01" min="0" value={form.material_stock} onChange={e => setForm(f => ({ ...f, material_stock: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>Reorder Level</label>
            <input required type="number" step="0.01" min="0" value={form.material_reorder_level} onChange={e => setForm(f => ({ ...f, material_reorder_level: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={inputStyle} />
          </div>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium border" style={{ borderColor: 'var(--border-color)' }}>Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50" style={{ backgroundColor: 'var(--accent)' }}>{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  )
}
