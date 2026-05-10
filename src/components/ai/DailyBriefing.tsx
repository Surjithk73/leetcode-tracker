import { useEffect, useState } from 'react'
import { Sparkles, RefreshCw } from 'lucide-react'
import { geminiGenerate, GeminiError } from '@/lib/gemini'
import { buildBriefingPrompt } from '@/lib/aiContext'
import type { Question } from '@/types'

const CACHE_KEY = 'daily_briefing'
const CACHE_DATE_KEY = 'daily_briefing_date'

interface Props {
  questions: Question[]
}

export default function DailyBriefing({ questions }: Props) {
  const [briefing, setBriefing] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const cached = localStorage.getItem(CACHE_KEY)
    const cachedDate = localStorage.getItem(CACHE_DATE_KEY)
    if (cached && cachedDate === today) {
      setBriefing(cached)
      return
    }
    if (questions.length >= 0) generate()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions.length])

  async function generate() {
    setLoading(true)
    setError('')
    try {
      const text = await geminiGenerate(buildBriefingPrompt(questions))
      setBriefing(text)
      const today = new Date().toISOString().split('T')[0]
      localStorage.setItem(CACHE_KEY, text)
      localStorage.setItem(CACHE_DATE_KEY, today)
    } catch (e) {
      setError(e instanceof GeminiError ? e.message : 'AI unavailable')
    }
    setLoading(false)
  }

  if (error) return null // silent fail — don't break dashboard

  return (
    <div className="rounded-xl border border-chart-4/30 bg-chart-4/5 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-chart-4" />
          <span className="text-xs font-semibold text-chart-4 uppercase tracking-wide">Daily Briefing</span>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-3 bg-muted/40 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-muted/40 rounded animate-pulse w-1/2" />
        </div>
      ) : (
        <p className="text-sm text-foreground leading-relaxed">{briefing}</p>
      )}
    </div>
  )
}
