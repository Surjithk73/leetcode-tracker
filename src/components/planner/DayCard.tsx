import { cn } from '@/lib/utils'
import { toLeetCodeUrl } from '@/lib/utils'
import { formatDate, isToday, isPast, getDailyTarget, isExamDay, isSunday } from '@/lib/planner'
import type { Question } from '@/types'

interface Props {
  dateStr: string
  loggedQuestions: Question[]
  revisionsDue: Question[]
}

const statusConfig = {
  'Ahead':     { color: 'text-chart-2',  bg: 'bg-chart-2/10',  border: 'border-chart-2/30',  dot: 'bg-chart-2' },
  'On Track':  { color: 'text-chart-2',  bg: 'bg-chart-2/10',  border: 'border-chart-2/30',  dot: 'bg-chart-2' },
  'Behind':    { color: 'text-chart-5',  bg: 'bg-chart-5/10',  border: 'border-chart-5/30',  dot: 'bg-chart-5' },
  'Exam Mode': { color: 'text-chart-3',  bg: 'bg-chart-3/10',  border: 'border-chart-3/30',  dot: 'bg-chart-3' },
  'Rest Day':  { color: 'text-muted-foreground', bg: 'bg-muted/30', border: 'border-border', dot: 'bg-muted-foreground' },
}

function computeStatus(dateStr: string, loggedCount: number): keyof typeof statusConfig {
  if (isExamDay(dateStr)) return 'Exam Mode'
  if (isSunday(dateStr)) return 'Rest Day'
  const target = getDailyTarget(dateStr)
  if (target === 0) return 'Rest Day'
  if (loggedCount >= target + 1) return 'Ahead'
  if (loggedCount >= target) return 'On Track'
  if (isPast(dateStr) && loggedCount < target) return 'Behind'
  return 'On Track'
}

export default function DayCard({ dateStr, loggedQuestions, revisionsDue }: Props) {
  const { weekday, day, month } = formatDate(dateStr)
  const today = isToday(dateStr)
  const past = isPast(dateStr)
  const target = getDailyTarget(dateStr)
  const loggedCount = loggedQuestions.length
  const status = computeStatus(dateStr, loggedCount)
  const cfg = statusConfig[status]

  return (
    <div className={cn(
      'rounded-xl border bg-card p-4 transition-colors',
      today ? 'border-sidebar-primary ring-1 ring-sidebar-primary' : 'border-border',
      past && !today && 'opacity-60',
    )}>
      {/* Date header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className={cn('text-xs font-medium', today ? 'text-sidebar-primary' : 'text-muted-foreground')}>
            {weekday} {today && '· Today'}
          </p>
          <p className="text-lg font-bold text-foreground leading-none mt-0.5">{day}</p>
          <p className="text-xs text-muted-foreground">{month}</p>
        </div>
        <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full border', cfg.color, cfg.bg, cfg.border)}>
          {status}
        </span>
      </div>

      {/* Progress */}
      {target > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{loggedCount}/{target} questions</span>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', cfg.dot)}
              style={{ width: `${Math.min(100, (loggedCount / target) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Logged questions */}
      {loggedQuestions.length > 0 && (
        <div className="space-y-1 mb-2">
          {loggedQuestions.slice(0, 3).map(q => (
            <div key={q.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={cn(
                'w-1.5 h-1.5 rounded-full shrink-0',
                q.result === 'Solved' ? 'bg-chart-2' : q.result === 'Hint' ? 'bg-chart-3' : 'bg-chart-5'
              )} />
              <a
                href={toLeetCodeUrl(q.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate hover:underline hover:text-sidebar-primary transition-colors"
              >{q.name}</a>
            </div>
          ))}
          {loggedQuestions.length > 3 && (
            <p className="text-xs text-muted-foreground pl-3">+{loggedQuestions.length - 3} more</p>
          )}
        </div>
      )}

      {/* Revisions due */}
      {revisionsDue.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-chart-3 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-chart-3 shrink-0" />
          <span>{revisionsDue.length} revision{revisionsDue.length > 1 ? 's' : ''} due</span>
        </div>
      )}

      {target === 0 && loggedQuestions.length === 0 && revisionsDue.length === 0 && (
        <p className="text-xs text-muted-foreground">Rest / revision day</p>
      )}
    </div>
  )
}
