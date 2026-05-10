import { useState, useEffect } from 'react'
import { X, ExternalLink } from 'lucide-react'
import { cn, toLeetCodeUrl, extractNameFromUrl, isLeetCodeUrl } from '@/lib/utils'
import { TOPICS, DIFFICULTIES, RESULTS } from '@/types'
import type { Difficulty, Result, Topic, Question } from '@/types'

interface Props {
  open: boolean
  initial?: Partial<Question>
  onClose: () => void
  onSave: (data: Omit<Question, 'id' | 'xp_awarded' | 'touch_number' | 'next_review_date'>) => Promise<void>
}

const today = () => new Date().toISOString().split('T')[0]

export default function QuestionModal({ open, initial, onClose, onSave }: Props) {
  const [rawInput, setRawInput] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium')
  const [topic, setTopic] = useState<Topic>('Arrays')
  const [result, setResult] = useState<Result>('Solved')
  const [date, setDate] = useState(today())
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  // Derive display name and preview URL from raw input
  const resolvedName = isLeetCodeUrl(rawInput) ? extractNameFromUrl(rawInput) : rawInput.trim()
  const previewUrl = resolvedName ? toLeetCodeUrl(resolvedName) : ''

  useEffect(() => {
    if (open) {
      setRawInput(initial?.name ?? '')
      setDifficulty(initial?.difficulty ?? 'Medium')
      setTopic(initial?.topic ?? 'Arrays')
      setResult(initial?.result ?? 'Solved')
      setDate(initial?.date_logged ?? today())
      setNotes(initial?.notes ?? '')
      setErr('')
    }
  }, [open, initial])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!resolvedName) { setErr('Question name is required.'); return }
    setSaving(true)
    
    // Extract slug from URL or generate from name
    let slug = initial?.slug || null
    if (isLeetCodeUrl(rawInput)) {
      const match = rawInput.match(/leetcode\.com\/problems\/([^/]+)/i)
      if (match) slug = match[1]
    } else if (resolvedName) {
      slug = resolvedName.toLowerCase().trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
    }
    
    await onSave({
      name: resolvedName,
      slug,
      difficulty, topic, result,
      date_logged: date,
      notes: notes.trim() || null,
    })
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4">
      <div className="w-full md:max-w-lg bg-card border border-border rounded-t-2xl md:rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">
            {initial?.id ? 'Edit Question' : 'Log Question'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Name / URL input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Question</label>
            <input
              value={rawInput}
              onChange={e => setRawInput(e.target.value)}
              placeholder="e.g. Two Sum or leetcode.com/problems/two-sum"
              className="w-full bg-input/20 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-sidebar-primary"
            />
            {/* Live URL preview */}
            {resolvedName && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-sidebar-primary hover:underline truncate"
              >
                <ExternalLink size={11} />
                {previewUrl}
              </a>
            )}
            {isLeetCodeUrl(rawInput) && resolvedName && (
              <p className="text-xs text-muted-foreground">Resolved name: <span className="text-foreground">{resolvedName}</span></p>
            )}
          </div>

          {/* Difficulty + Result row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Difficulty</label>
              <div className="flex gap-1.5">
                {DIFFICULTIES.map(d => (
                  <button key={d} type="button" onClick={() => setDifficulty(d)}
                    className={cn(
                      'flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors',
                      difficulty === d
                        ? d === 'Easy' ? 'bg-chart-2/20 border-chart-2 text-chart-2'
                          : d === 'Medium' ? 'bg-chart-3/20 border-chart-3 text-chart-3'
                          : 'bg-chart-5/20 border-chart-5 text-chart-5'
                        : 'border-border text-muted-foreground hover:border-muted-foreground'
                    )}
                  >{d}</button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Result</label>
              <div className="flex gap-1.5">
                {RESULTS.map(r => (
                  <button key={r} type="button" onClick={() => setResult(r)}
                    className={cn(
                      'flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors',
                      result === r
                        ? r === 'Solved' ? 'bg-chart-2/20 border-chart-2 text-chart-2'
                          : r === 'Hint' ? 'bg-chart-3/20 border-chart-3 text-chart-3'
                          : 'bg-chart-5/20 border-chart-5 text-chart-5'
                        : 'border-border text-muted-foreground hover:border-muted-foreground'
                    )}
                  >{r}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Topic */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Topic</label>
            <select
              value={topic}
              onChange={e => setTopic(e.target.value as Topic)}
              className="w-full bg-input/20 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-sidebar-primary"
            >
              {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-input/20 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-sidebar-primary"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Notes <span className="normal-case text-muted-foreground/60">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Any patterns, edge cases, or reminders..."
              className="w-full bg-input/20 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-sidebar-primary resize-none"
            />
          </div>

          {err && (
            <p className="text-xs text-destructive-foreground bg-destructive/20 border border-destructive/40 rounded-lg px-3 py-2">
              {err}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
              {saving ? 'Saving…' : initial?.id ? 'Save Changes' : 'Log Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
