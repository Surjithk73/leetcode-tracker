import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Loader2, Zap } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { decrypt } from '@/lib/encryption'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const { user, signIn, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!authLoading && user) return <Navigate to="/" replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { user } = await signIn(email, password)
      if (user) {
        const { data } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'gemini_api_key')
          .single()
        if (data?.value) {
          try {
            const key = await decrypt(data.value, user.id)
            localStorage.setItem('gemini_api_key', key)
          } catch { /* user must re-enter in Settings */ }
        }
        navigate('/', { replace: true })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-chart-1">
            <Zap size={20} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">LC Tracker</h1>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">Welcome back</h2>
            <p className="text-sm text-muted-foreground mt-1">Log in to continue your prep</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-input/20 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-sidebar-primary"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-input/20 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-sidebar-primary"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <p className="text-sm text-chart-5 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-sidebar-primary text-sidebar-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Log In'}
            </button>
          </form>
        </div>

        <p className="text-sm text-center text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/signup" className="text-sidebar-primary font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}