import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, Sun, Moon, User } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../hooks/useAuth'
import { useNotificationContext } from '../context/NotificationContext'

export default function Header() {
  const { dark, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const { unreadCount, notifications } = useNotificationContext()
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const bellRef = useRef(null)
  const profileRef = useRef(null)

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const recentNotifs = notifications.slice(0, 5)

  return (
    <header
      className="h-16 flex items-center justify-between px-4 lg:px-6 border-b shrink-0"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* Left: Title on mobile */}
      <div className="lg:hidden">
        <span className="font-brand text-lg">CATSY</span>
      </div>
      <div className="hidden lg:block" />

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative">
          {searchOpen ? (
            <input
              autoFocus
              type="text"
              placeholder="Search..."
              onBlur={() => setSearchOpen(false)}
              className="w-48 lg:w-64 px-3 py-1.5 rounded-lg text-sm outline-none border"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
            />
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-lg transition-colors hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Search size={20} />
            </button>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg transition-colors hover:opacity-80"
          style={{ color: 'var(--text-secondary)' }}
        >
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notification bell */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setBellOpen(prev => !prev)}
            className="p-2 rounded-lg transition-colors hover:opacity-80 relative"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {bellOpen && (
            <div
              className="absolute right-0 top-12 w-80 rounded-xl shadow-xl border z-50 overflow-hidden"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-color)',
              }}
            >
              <div className="px-4 py-3 border-b font-semibold text-sm" style={{ borderColor: 'var(--border-color)' }}>
                Notifications
              </div>
              {recentNotifs.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                  No notifications
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {recentNotifs.map((n, i) => (
                    <div
                      key={n.id || i}
                      className="px-4 py-3 border-b last:border-0 text-sm"
                      style={{
                        borderColor: 'var(--border-color)',
                        backgroundColor: n.is_read ? 'transparent' : 'var(--bg-primary)',
                      }}
                    >
                      <p className="font-medium">{n.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                        {n.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => { navigate('/notifications'); setBellOpen(false) }}
                className="w-full px-4 py-2.5 text-sm font-medium text-center border-t hover:opacity-80"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
              >
                View All
              </button>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(prev => !prev)}
            className="p-2 rounded-lg transition-colors hover:opacity-80"
            style={{ color: 'var(--text-secondary)' }}
          >
            <User size={20} />
          </button>

          {profileOpen && (
            <div
              className="absolute right-0 top-12 w-48 rounded-xl shadow-xl border z-50 overflow-hidden"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-color)',
              }}
            >
              <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <p className="text-sm font-semibold">{user?.first_name || 'Admin'}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
              </div>
              <button
                onClick={() => { logout(); setProfileOpen(false) }}
                className="w-full px-4 py-2.5 text-sm text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
