import { useState, useEffect } from 'react'
import { Eye, EyeOff, Save, Download } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useQuestions } from '@/hooks/useQuestions'
import { useToast } from '@/hooks/useToast'
import ToastContainer from '@/components/ui/Toast'
import { DEFAULT_MODEL } from '@/lib/gemini'

const KNOWN_MODELS = [
  'gemini-3.1-flash-lite-preview',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'custom',
]

interface SettingField {
  key: string
  label: string
  description: string
  type: 'text' | 'number' | 'select' | 'date'
  options?: string[]
}

const DB_SETTINGS: SettingField[] = [
  { key: 'daily_target_normal',  label: 'Daily target (normal)',  description: 'Questions/day during pre-exam phase', type: 'number' },
  { key: 'daily_target_exam',    label: 'Daily target (exam)',    description: 'Questions/day during exam period',   type: 'number' },
  { key: 'daily_target_holiday', label: 'Daily target (holiday)', description: 'Questions/day during holiday sprint', type: 'number' },
  { key: 'exam_start',           label: 'Exam period start',      description: 'Low-activity period begins',         type: 'date' },
  { key: 'exam_end',             label: 'Exam period end',        description: 'Low-activity period ends',           type: 'date' },
  { key: 'revision_preference',  label: 'Revision preference',    description: 'How AI redistributes missed work',   type: 'select', options: ['Prefer weekends', 'Prefer weekdays', 'Let AI decide'] },
  { key: 'timer_duration',       label: 'Timer duration (min)',   description: 'Default solve timer length',         type: 'select', options: ['20', '25', '30'] },
  { key: 'sound_enabled',        label: 'Timer sound',            description: 'Beep when timer ends',               type: 'select', options: ['true', 'false'] },
]

export default function Settings() {
  const { questions } = useQuestions()
  const { toasts, toast, remove } = useToast()
  const [geminiKey, setGeminiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [modelSelect, setModelSelect] = useState('gemini-3.1-flash-lite-preview')
  const [customModel, setCustomModel] = useState('')
  const [dbSettings, setDbSettings] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  // Derived: the actual model string to save
  const resolvedModel = modelSelect === 'custom' ? customModel.trim() : modelSelect

  useEffect(() => {
    setGeminiKey(localStorage.getItem('gemini_api_key') ?? '')
    const saved = localStorage.getItem('gemini_model') || DEFAULT_MODEL
    if (KNOWN_MODELS.includes(saved)) {
      setModelSelect(saved)
    } else {
      setModelSelect('custom')
      setCustomModel(saved)
    }
    loadDbSettings()
  }, [])

  async function loadDbSettings() {
    const { data } = await supabase.from('settings').select('*')
    const map: Record<string, string> = {}
    for (const row of data ?? []) map[row.key] = row.value
    setDbSettings(map)
  }

  async function saveAll() {
    setSaving(true)
    localStorage.setItem('gemini_api_key', geminiKey.trim())
    if (resolvedModel) localStorage.setItem('gemini_model', resolvedModel)

    // Save DB settings
    const upserts = Object.entries(dbSettings).map(([key, value]) => ({ key, value }))
    if (upserts.length > 0) {
      const { error } = await supabase.from('settings').upsert(upserts, { onConflict: 'key' })
      if (error) { toast(error.message, 'error'); setSaving(false); return }
    }
    toast('Settings saved')
    setSaving(false)
  }

  function exportCSV() {
    const headers = ['name', 'difficulty', 'topic', 'result', 'date_logged', 'touch_number', 'next_review_date', 'notes', 'xp_awarded']
    const rows = questions.map(q =>
      headers.map(h => {
        const val = q[h as keyof typeof q] ?? ''
        return `"${String(val).replace(/"/g, '""')}"`
      }).join(',')
    )
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leetcode-tracker-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast('CSV downloaded')
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Configure your tracker</p>
      </div>

      {/* Gemini API Key */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">AI Configuration</h2>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Gemini API Key</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showKey ? 'text' : 'password'}
                value={geminiKey}
                onChange={e => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-input/20 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-sidebar-primary pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Stored in browser localStorage only — never sent to Supabase.</p>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Model</label>
          <select
            value={modelSelect}
            onChange={e => setModelSelect(e.target.value)}
            className="w-full bg-input/20 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-sidebar-primary"
          >
            {KNOWN_MODELS.map(m => (
              <option key={m} value={m}>{m === 'custom' ? 'Custom model ID…' : m}</option>
            ))}
          </select>
          {modelSelect === 'custom' && (
            <input
              value={customModel}
              onChange={e => setCustomModel(e.target.value)}
              placeholder="e.g. gemini-3.1-flash-lite-preview"
              className="w-full bg-input/20 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-sidebar-primary mt-2"
            />
          )}
          <p className="text-xs text-muted-foreground">
            Active: <span className="text-foreground font-mono">{resolvedModel || '—'}</span>
          </p>
        </div>
      </div>

      {/* Prep settings */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Prep Configuration</h2>
        {DB_SETTINGS.map(field => (
          <div key={field.key} className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{field.label}</label>
            {field.type === 'select' ? (
              <select
                value={dbSettings[field.key] ?? ''}
                onChange={e => setDbSettings(prev => ({ ...prev, [field.key]: e.target.value }))}
                className="w-full bg-input/20 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-sidebar-primary"
              >
                {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input
                type={field.type}
                value={dbSettings[field.key] ?? ''}
                onChange={e => setDbSettings(prev => ({ ...prev, [field.key]: e.target.value }))}
                className="w-full bg-input/20 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-sidebar-primary"
              />
            )}
            <p className="text-xs text-muted-foreground">{field.description}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={saveAll}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-sidebar-primary text-sidebar-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Save size={15} />
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors"
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>

      <ToastContainer toasts={toasts} onRemove={remove} />
    </div>
  )
}
