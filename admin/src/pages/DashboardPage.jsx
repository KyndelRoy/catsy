import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DollarSign, CalendarDays, PackageX, Bell } from 'lucide-react'
import { getDashboardStats } from '../services/dashboardService'
import StatusBadge from '../components/ui/StatusBadge'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  const cards = [
    {
      label: 'Total Products',
      value: stats?.total_products ?? '—',
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-500/10',
    },
    {
      label: 'Active Reservations',
      value: stats?.active_reservations ?? '—',
      icon: CalendarDays,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-500/10',
    },
    {
      label: 'Stock Alerts',
      value: stats?.low_stock_alerts ?? '—',
      icon: PackageX,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-500/10',
    },
    {
      label: 'Notifications',
      value: '0',
      icon: Bell,
      color: 'text-red-600',
      bg: 'bg-red-50 dark:bg-red-500/10',
    },
  ]

  const reservations = stats?.todays_reservations || []

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="rounded-xl border p-4"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
              <div className={`p-2 rounded-lg ${bg}`}>
                <Icon size={16} className={color} />
              </div>
            </div>
            <p className="text-2xl font-bold">
              {loading ? <span className="inline-block w-12 h-7 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" /> : value}
            </p>
          </div>
        ))}
      </div>

      {/* Today's Reservations */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="font-semibold">Today's Reservations</h2>
          <button
            onClick={() => navigate('/reservations')}
            className="text-sm font-medium hover:opacity-70"
            style={{ color: 'var(--text-secondary)' }}
          >
            View All →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                {['Name', 'Time', 'Guests', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center" style={{ color: 'var(--text-secondary)' }}>Loading...</td></tr>
              ) : reservations.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center" style={{ color: 'var(--text-secondary)' }}>No reservations today</td></tr>
              ) : (
                reservations.map((r) => (
                  <tr key={r.id} className="border-b last:border-0 hover:opacity-80" style={{ borderColor: 'var(--border-color)' }}>
                    <td className="px-5 py-3 font-medium">{r.customer_name || `Customer #${r.customer_id}`}</td>
                    <td className="px-5 py-3">{r.time}</td>
                    <td className="px-5 py-3">{r.guests}</td>
                    <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
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
