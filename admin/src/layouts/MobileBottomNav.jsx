import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  CalendarDays,
  Bell,
  BarChart3,
} from 'lucide-react'
import { useNotificationContext } from '../context/NotificationContext'

const tabs = [
  { to: '/', icon: LayoutDashboard, label: 'Home', end: true },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/reservations', icon: CalendarDays, label: 'Reserve' },
  { to: '/notifications', icon: Bell, label: 'Notifs' },
  { to: '/analysis', icon: BarChart3, label: 'Analysis' },
]

export default function MobileBottomNav() {
  const { unreadCount } = useNotificationContext()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 border-t flex items-center justify-around h-16 z-40"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-color)',
      }}
    >
      {tabs.map(({ to, icon: Icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors relative ${
              isActive
                ? 'text-[var(--accent)]'
                : 'text-[var(--text-secondary)]'
            }`
          }
        >
          <div className="relative">
            <Icon size={20} />
            {label === 'Notifs' && unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
