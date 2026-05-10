import { useMemo, useState } from 'react'
import { useQuestions } from '@/hooks/useQuestions'
import { getAllPrepDates } from '@/lib/planner'
import DayCard from '@/components/planner/DayCard'
import RevisionPanel from '@/components/revision/RevisionPanel'
import type { Question } from '@/types'

type ViewFilter = 'upcoming' | 'all' | 'behind'

export default function Planner() {
  const { questions, loading, refetch } = useQuestions()
  const [view, setView] = useState<ViewFilter>('upcoming')

  const allDates = useMemo(() => getAllPrepDates(), [])
  const today = new Date().toISOString().split('T')[0]

  // Map date -> logged questions
  const byDate = useMemo(() => {
    const map: Record<string, Question[]> = {}
    for (const q of questions) {
      if (!map[q.date_logged]) map[q.date_logged] = []
      map[q.date_logged].push(q)
    }
    return map
  }, [questions])

  // Map date -> revisions due
  const revByDate = useMemo(() => {
    const map: Record<string, Question[]> = {}
    for (const q of questions) {
      if (q.next_review_date && q.touch_number < 3) {
        if (!map[q.next_review_date]) map[q.next_review_date] = []
        map[q.next_review_date].push(q)
      }
    }
    return map
  }, [questions])

  const filteredDates = useMemo(() => {
    if (view === 'upcoming') return allDates.filter(d => d >= today)
    if (view === 'behind') {
      return allDates.filter(d => {
        if (d >= today) return false
        const logged = byDate[d]?.length ?? 0
        // simple behind check: past day with 0 logged and not sunday
        return logged === 0 && new Date(d).getDay() !== 0
      })
    }
    return allDates
  }, [allDates, view, today, byDate])

  // Summary stats
  const totalDays = allDates.length
  const completedDays = allDates.filter(d => {
    if (d >= today) return false
    return (byDate[d]?.length ?? 0) > 0
  }).length
  const behindDays = allDates.filter(d => {
    if (d >= today) return false
    return (byDate[d]?.length ?? 0) === 0 && new Date(d).getDay() !== 0
  }).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Planner</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {completedDays} active days completed · {behindDays} days behind · {totalDays} total days
        </p>
      </div>

      {/* Revision panel */}
      <RevisionPanel questions={questions} onUpdate={refetch} />

      {/* View filter tabs */}
      <div className="flex gap-1 bg-muted/30 rounded-lg p-1 w-fit">
        {(['upcoming', 'all', 'behind'] as ViewFilter[]).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
              view === v
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {v === 'behind' ? `Behind (${behindDays})` : v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      {/* Day cards grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card h-36 animate-pulse" />
          ))}
        </div>
      ) : filteredDates.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground text-sm">
          {view === 'behind' ? 'No behind days — great work!' : 'No days to show.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredDates.map(dateStr => (
            <DayCard
              key={dateStr}
              dateStr={dateStr}
              loggedQuestions={byDate[dateStr] ?? []}
              revisionsDue={revByDate[dateStr] ?? []}
            />
          ))}
        </div>
      )}
    </div>
  )
}
