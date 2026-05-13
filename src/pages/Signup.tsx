import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Loader2, Zap } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { encrypt } from '@/lib/encryption'
import { supabase } from '@/lib/supabase'

const DEFAULT_SETTINGS = [
  { key: 'timer_duration', value: '20' },
  { key: 'revision_preference', value: 'Let AI decide' },
  { key: 'exam_start', value: '2026-12-01' },
  { key: 'exam_end', value: '2026-12-31' },
  { key: 'daily_target_normal', value: '2' },
  { key: 'daily_target_exam', value: '1' },
  { key: 'daily_target_holiday', value: '4' },
  { key: 'sound_enabled', value: 'true' },
]

export default function Signup() {
  const { user, signUp, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!authLoading && user) return <Navigate to="/" replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (!apiKey.trim()) {
      setError('Gemini API key is required')
      return
    }

    setLoading(true)
    try {
      const { user } = await signUp(email, password)
      if (!user) {
        setError('Signup failed — please try again')
        setLoading(false)
        return
      }

      const encryptedKey = await encrypt(apiKey.trim(), user.id)
      const { error: keyError } = await supabase
        .from('settings')
        .insert({ key: 'gemini_api_key', value: encryptedKey })
      if (keyError) console.error('Failed to save API key:', keyError)

      const { error: defaultsError } = await supabase
        .from('settings')
        .insert(DEFAULT_SETTINGS)
      if (defaultsError) console.error('Failed to save default settings:', defaultsError)

      localStorage.setItem('gemini_api_key', apiKey.trim())
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
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
            <h2 className="text-lg font-semibold text-foreground">Create your account</h2>
            <p className="text-sm text-muted-foreground mt-1">Start tracking your LeetCode prep</p>
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
                minLength={6}
                className="w-full bg-input/20 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-sidebar-primary"
                placeholder="Min 6 characters"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-input/20 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-sidebar-primary"
                placeholder="Re-enter your password"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Gemini API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                required
                className="w-full bg-input/20 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-sidebar-primary"
                placeholder="AIzaSy..."
              />
              <p className="text-xs text-muted-foreground">Your Google AI Studio key. Stored encrypted, never visible to anyone else.</p>
            </div>

            {error && (
              <p className="text-sm text-chart-5 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-sidebar-primary text-sidebar-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-sm text-center text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-sidebar-primary font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  )
}