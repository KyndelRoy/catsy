import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { loginAdmin } from '../services/authService'

export default function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await loginAdmin(email, password)
      login(data)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-brand text-3xl mb-1">CATSY</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Admin Portal
          </p>
        </div>

        <div
          className="mb-4 text-xs rounded-lg px-4 py-3"
          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
        >
          <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            Development login
          </p>
          <p>Email: <span className="font-mono">admin@catsy.com</span></p>
          <p>Password: <span className="font-mono">admin123</span></p>
          <p className="mt-1">Use only for local testing. Change before production.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 text-red-600 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 ml-1" style={{ color: 'var(--text-secondary)' }}>
              Email
            </label>
            <div
              className="flex items-center border rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-[var(--accent)] transition-shadow"
              style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}
            >
              <Mail size={18} className="mr-2.5 shrink-0" style={{ color: 'var(--text-secondary)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@catsy.com"
                required
                className="w-full bg-transparent outline-none text-sm"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 ml-1" style={{ color: 'var(--text-secondary)' }}>
              Password
            </label>
            <div
              className="flex items-center border rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-[var(--accent)] transition-shadow"
              style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}
            >
              <Lock size={18} className="mr-2.5 shrink-0" style={{ color: 'var(--text-secondary)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full bg-transparent outline-none text-sm"
                style={{ color: 'var(--text-primary)' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="ml-2 shrink-0"
                style={{ color: 'var(--text-secondary)' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-semibold text-sm text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
