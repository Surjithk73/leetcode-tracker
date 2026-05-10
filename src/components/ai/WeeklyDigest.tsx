import { useEffect, useState } from 'react'
import { BarChart2, RefreshCw } from 'lucide-react'
import { geminiGenerate, GeminiError } from '@/lib/gemini'
import { buildWeeklyDigestPrompt } from '@/lib/aiContext'
import type { Question } from '@/types'

const CACHE_KEY = 'weekly_digest'
const CACHE_WEEK_KEY = 'weekly_digest_week'

function getWeekNumber(): string {
  const d = new Date()
  const start = new Date(d.getFullYear(), 0, 1)
  return `${d.getFullYear()}-W${Math.ceil(((d.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7)}`
}

interface Props { questions: Question[] }

export default function WeeklyDigest({ questions }: Props) {
  const [digest, setDigest] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const week = getWeekNumber()
    const cached = localStorage.getItem(CACHE_KEY)
    const cachedWeek = localStorage.getItem(CACHE_WEEK_KEY)
    if (cached && cachedWeek === week) { setDigest(cached); return }
    // Only auto-generate on Sundays
    if (new Date().getDay() === 0 && questions.length > 0) generate()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions.length])

  async function generate() {
    setLoading(true)
    try {
      const text = await geminiGenerate(buildWeeklyDigestPrompt(questions))
      setDigest(text)
      localStorage.setItem(CACHE_KEY, text)
      localStorage.setItem(CACHE_WEEK_KEY, getWeekNumber())
    } catch (e) {
      if (e instanceof GeminiError) console.warn(e.message)
    }
    setLoading(false)
  }

  if (!digest && !loading) return null

  return (
    <div className="rounded-xl border border-chart-1/30 bg-chart-1/5 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <BarChart2 size={14} className="text-chart-1" />
          <span className="text-xs font-semibold text-chart-1 uppercase tracking-wide">Weekly Digest</span>
        </div>
        <button onClick={generate} disabled={loading} className="text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-3 bg-muted/40 rounded animate-pulse w-full" />
          <div className="h-3 bg-muted/40 rounded animate-pulse w-4/5" />
          <div className="h-3 bg-muted/40 rounded animate-pulse w-2/3" />
        </div>
      ) : (
        <p className="text-sm text-foreground leading-relaxed">{digest}</p>
      )}
    </div>
  )
}
