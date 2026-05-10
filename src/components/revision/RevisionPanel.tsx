import { useState } from 'react'
import { CheckCircle2, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toLeetCodeUrl } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { calcNextReviewDate } from '@/lib/xp'
import type { Question } from '@/types'

interface Props {
  questions: Question[]
  onUpdate: () => void
  compact?: boolean
}

export default function RevisionPanel({ questions, onUpdate, compact = false }: Props) {
  const today = new Date().toISOString().split('T')[0]
  const due = questions.filter(q =>
    q.next_review_date && q.next_review_date <= today && q.touch_number < 3
  )

  const [completing, setCompleting] = useState<string | null>(null)

  async function markDone(q: Question) {
    setCompleting(q.id)
    const newTouch = (q.touch_number + 1) as 1 | 2 | 3
    const next = calcNextReviewDate(today, newTouch)
    await supabase
      .from('questions')
      .update({
        touch_number: newTouch,
        next_review_date: next,
        xp_awarded: q.xp_awarded + 5,
      })
      .eq('id', q.id)
    setCompleting(null)
    onUpdate()
  }

  if (due.length === 0) {
    return (
      <div className={cn('rounded-xl border border-border bg-card p-4 text-center', compact && 'py-3')}>
        <p className="text-sm text-muted-foreground">No revisions due today 🎉</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-chart-3/30 bg-chart-3/5 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-chart-3/20">
        <div className="flex items-center gap-2">
          <RotateCcw size={15} className="text-chart-3" />
          <span className="text-sm font-semibold text-chart-3">Due for Revision</span>
        </div>
        <span className="text-xs text-muted-foreground">{due.length} item{due.length > 1 ? 's' : ''}</span>
      </div>

      <div className="divide-y divide-border/50">
        {due.map(q => (
          <div key={q.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors">
            <div className="min-w-0 flex-1">
              <a
                href={toLeetCodeUrl(q.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-foreground hover:underline hover:text-sidebar-primary transition-colors truncate block"
              >{q.name}</a>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn(
                  'text-xs font-medium',
                  q.difficulty === 'Easy' ? 'text-chart-2' : q.difficulty === 'Medium' ? 'text-chart-3' : 'text-chart-5'
                )}>{q.difficulty}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{q.topic}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">Touch {q.touch_number + 1}</span>
              </div>
            </div>
            <button
              onClick={() => markDone(q)}
              disabled={completing === q.id}
              className="ml-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-chart-2/10 border border-chart-2/30 text-chart-2 text-xs font-semibold hover:bg-chart-2/20 transition-colors disabled:opacity-50 shrink-0"
            >
              <CheckCircle2 size={13} />
              {completing === q.id ? 'Saving…' : 'Done +5 XP'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
