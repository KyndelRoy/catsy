import { useState, useEffect, useCallback } from 'react'
import { Plus, List, CalendarDays, Search, Check, X as XIcon, CheckCircle } from 'lucide-react'
import { getReservations, createReservation, updateReservationStatus } from '../services/reservationService'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Toast from '../components/ui/Toast'
import StatusBadge from '../components/ui/StatusBadge'

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modal, setModal] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const [toast, setToast] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setReservations(await getReservations())
    } catch {
      setToast({ message: 'Failed to load reservations', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = reservations.filter(r => {
    const matchSearch = (r.customer_name || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleStatusChange = async (id, status) => {
    try {
      await updateReservationStatus(id, status)
      setToast({ message: `Reservation ${status}`, type: 'success' })
      fetchData()
    } catch {
      setToast({ message: 'Update failed', type: 'error' })
    }
    setConfirm(null)
  }

  const handleCreate = async (formData) => {
    try {
      await createReservation(formData)
      setToast({ message: 'Reservation created', type: 'success' })
      setModal(false)
      fetchData()
    } catch {
      setToast({ message: 'Create failed', type: 'error' })
    }
  }

  // Calendar helpers
  const [calendarDate, setCalendarDate] = useState(new Date())
  const year = calendarDate.getFullYear()
  const month = calendarDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const monthName = calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const reservationsByDate = {}
  reservations.forEach(r => {
    const d = r.reservation_date
    if (d) reservationsByDate[d] = (reservationsByDate[d] || 0) + 1
  })

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {confirm && (
        <ConfirmDialog
          title={`${confirm.action} Reservation`}
          message={`Are you sure you want to ${confirm.action.toLowerCase()} this reservation?`}
          confirmLabel={confirm.action}
          danger={confirm.action === 'Cancel'}
          onConfirm={() => handleStatusChange(confirm.id, confirm.status)}
          onCancel={() => setConfirm(null)}
        />
      )}
      {modal && <ReservationFormModal onSave={handleCreate} onClose={() => setModal(false)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reservations</h1>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
            <button onClick={() => setView('list')}
              className={`p-2 transition-colors ${view === 'list' ? 'bg-[var(--accent)] text-white' : ''}`}
              style={view !== 'list' ? { backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)' } : {}}
            ><List size={16} /></button>
            <button onClick={() => setView('calendar')}
              className={`p-2 transition-colors ${view === 'calendar' ? 'bg-[var(--accent)] text-white' : ''}`}
              style={view !== 'calendar' ? { backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)' } : {}}
            ><CalendarDays size={16} /></button>
          </div>
          <button onClick={() => setModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: 'var(--accent)' }}>
            <Plus size={16} /> New
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm outline-none"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <div className="flex items-center flex-1 border rounded-lg px-3 py-2" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <Search size={16} style={{ color: 'var(--text-secondary)' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name..." className="ml-2 w-full bg-transparent outline-none text-sm" style={{ color: 'var(--text-primary)' }} />
        </div>
      </div>

      {/* List View */}
      {view === 'list' && (
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                  {['Name', 'Date', 'Time', 'Guests', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center" style={{ color: 'var(--text-secondary)' }}>Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center" style={{ color: 'var(--text-secondary)' }}>No reservations found</td></tr>
                ) : (
                  filtered.map(r => (
                    <tr key={r.id} className="border-b last:border-0 hover:opacity-90" style={{ borderColor: 'var(--border-color)' }}>
                      <td className="px-4 py-3 font-medium">{r.customer_name || `Customer #${r.customer_id || '?'}`}</td>
                      <td className="px-4 py-3">{r.reservation_date}</td>
                      <td className="px-4 py-3">{r.time}</td>
                      <td className="px-4 py-3">{r.guests}</td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {r.status === 'pending' && (
                            <>
                              <button onClick={() => setConfirm({ id: r.id, status: 'confirmed', action: 'Confirm' })} className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-500/10 text-green-600" title="Confirm">
                                <Check size={15} />
                              </button>
                              <button onClick={() => setConfirm({ id: r.id, status: 'cancelled', action: 'Cancel' })} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500" title="Cancel">
                                <XIcon size={15} />
                              </button>
                            </>
                          )}
                          {r.status === 'confirmed' && (
                            <button onClick={() => setConfirm({ id: r.id, status: 'completed', action: 'Complete' })} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-600" title="Complete">
                              <CheckCircle size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="rounded-xl border p-5" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCalendarDate(new Date(year, month - 1, 1))} className="px-3 py-1 rounded-lg text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>◀</button>
            <span className="font-semibold">{monthName}</span>
            <button onClick={() => setCalendarDate(new Date(year, month + 1, 1))} className="px-3 py-1 rounded-lg text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>▶</button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const count = reservationsByDate[dateStr] || 0
              const isToday = dateStr === new Date().toISOString().split('T')[0]
              return (
                <div key={day} className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm cursor-pointer transition-colors ${isToday ? 'ring-2 ring-[var(--accent)]' : ''} hover:opacity-80`}
                  style={{ backgroundColor: count > 0 ? 'var(--bg-primary)' : 'transparent' }}
                  onClick={() => {
                    setSearch('')
                    setStatusFilter('all')
                    setView('list')
                  }}
                >
                  <span className={count > 0 ? 'font-semibold' : ''}>{day}</span>
                  {count > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: Math.min(count, 3) }).map((_, j) => (
                        <span key={j} className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function ReservationFormModal({ onSave, onClose }) {
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    reservation_date: new Date().toISOString().split('T')[0],
    time: '',
    guests: 1,
    special_requests: '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    await onSave({ ...form, guests: parseInt(form.guests) })
    setSaving(false)
  }

  const inputStyle = { backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }

  return (
    <Modal title="New Walk-in Reservation" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>Customer Name</label>
          <input required value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={inputStyle} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
            <input type="email" value={form.customer_email} onChange={e => setForm(f => ({ ...f, customer_email: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>Phone</label>
            <input value={form.customer_phone} onChange={e => setForm(f => ({ ...f, customer_phone: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={inputStyle} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>Date</label>
            <input required type="date" value={form.reservation_date} onChange={e => setForm(f => ({ ...f, reservation_date: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>Time</label>
            <input required type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>Guests</label>
            <input required type="number" min="1" max="20" value={form.guests} onChange={e => setForm(f => ({ ...f, guests: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={inputStyle} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>Special Requests</label>
          <textarea value={form.special_requests} onChange={e => setForm(f => ({ ...f, special_requests: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none" style={inputStyle} />
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium border" style={{ borderColor: 'var(--border-color)' }}>Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50" style={{ backgroundColor: 'var(--accent)' }}>{saving ? 'Saving...' : 'Create'}</button>
        </div>
      </form>
    </Modal>
  )
}
