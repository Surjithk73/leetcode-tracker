import { Pencil, Trash2 } from 'lucide-react'
import { cn, toLeetCodeUrl } from '@/lib/utils'
import type { Question } from '@/types'

interface Props {
  question: Question
  onEdit: (q: Question) => void
  onDelete: (id: string) => void
}

const resultColor: Record<string, string> = {
  Solved: 'text-chart-2 bg-chart-2/10 border-chart-2/30',
  Hint:   'text-chart-3 bg-chart-3/10 border-chart-3/30',
  Stuck:  'text-chart-5 bg-chart-5/10 border-chart-5/30',
}

const diffColor: Record<string, string> = {
  Easy:   'text-chart-2',
  Medium: 'text-chart-3',
  Hard:   'text-chart-5',
}

export default function QuestionRow({ question: q, onEdit, onDelete }: Props) {
  return (
    <tr className="border-b border-border hover:bg-muted/30 transition-colors group">
      <td className="px-4 py-3 text-sm text-foreground max-w-[200px]">
        <a
          href={toLeetCodeUrl(q.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline hover:text-sidebar-primary transition-colors truncate block"
        >
          {q.name}
        </a>
      </td>
      <td className={cn('px-4 py-3 text-xs font-semibold', diffColor[q.difficulty])}>{q.difficulty}</td>
      <td className="px-4 py-3 text-xs text-muted-foreground">{q.topic}</td>
      <td className="px-4 py-3">
        <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full border', resultColor[q.result])}>
          {q.result}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">{q.date_logged}</td>
      <td className="px-4 py-3 text-xs text-muted-foreground">T{q.touch_number}</td>
      <td className="px-4 py-3 text-xs text-muted-foreground">{q.next_review_date ?? '—'}</td>
      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[160px] truncate">{q.notes ?? '—'}</td>
      <td className="px-4 py-3">
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(q)} className="text-muted-foreground hover:text-foreground transition-colors">
            <Pencil size={14} />
          </button>
          <button onClick={() => onDelete(q.id)} className="text-muted-foreground hover:text-chart-5 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  )
}
