import {
  Package,
  CalendarDays,
  PackageX,
  XCircle,
  Bell,
} from 'lucide-react'
import { useNotificationContext } from '../context/NotificationContext'

const iconMap = {
  low_stock: PackageX,
  new_reservation: CalendarDays,
  cancelled_reservation: XCircle,
  product_out_of_stock: Package,
  stock_depleted: PackageX,
}

const colorMap = {
  low_stock: 'text-amber-600',
  new_reservation: 'text-blue-600',
  cancelled_reservation: 'text-red-600',
  product_out_of_stock: 'text-red-600',
  stock_depleted: 'text-red-600',
}

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead } = useNotificationContext()

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {notifications.length > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ color: 'var(--text-secondary)' }}
          >
            Mark All Read
          </button>
        )}
      </div>

      {/* List */}
      <div
        className="rounded-xl border overflow-hidden divide-y"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
          '--tw-divide-color': 'var(--border-color)',
        }}
      >
        {notifications.length === 0 ? (
          <div className="py-12 text-center">
            <Bell size={40} className="mx-auto mb-3 opacity-20" />
            <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>
              No notifications yet
            </p>
          </div>
        ) : (
          notifications.map((n, i) => {
            const Icon = iconMap[n.type] || Bell
            const color = colorMap[n.type] || 'text-[var(--text-secondary)]'
            return (
              <div
                key={n.id || i}
                onClick={() => !n.is_read && markAsRead(n.id)}
                className="flex items-start gap-3 px-5 py-4 cursor-pointer transition-colors hover:opacity-90"
                style={{
                  backgroundColor: n.is_read ? 'transparent' : 'var(--bg-primary)',
                }}
              >
                <div className="mt-0.5">
                  {!n.is_read && <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2" />}
                </div>
                <Icon size={18} className={`${color} mt-0.5 shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {n.message}
                  </p>
                </div>
                <span className="text-xs shrink-0" style={{ color: 'var(--text-secondary)' }}>
                  {n.time_ago || ''}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
