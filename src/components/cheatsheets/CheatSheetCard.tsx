import { cn } from '@/lib/utils'
import { FileText, CheckCircle, Circle, Clock } from 'lucide-react'
import type { CheatSheet, Topic } from '@/types'

interface Props {
  topic: Topic
  sheet?: CheatSheet
  onClick: () => void
}

export default function CheatSheetCard({ topic, sheet, onClick }: Props) {
  const hasContent = !!sheet?.raw_notes?.trim()
  const hasFormatted = !!sheet?.formatted_markdown?.trim()

  const status = !hasContent ? 'Not Started' : hasFormatted ? 'Complete' : 'In Progress'

  const statusCfg = {
    'Not Started': { color: 'text-muted-foreground', bg: 'bg-muted/30', border: 'border-border', icon: Circle },
    'In Progress': { color: 'text-chart-3', bg: 'bg-chart-3/10', border: 'border-chart-3/30', icon: Clock },
    'Complete':    { color: 'text-chart-2', bg: 'bg-chart-2/10', border: 'border-chart-2/30', icon: CheckCircle },
  }

  const cfg = statusCfg[status]
  const StatusIcon = cfg.icon

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-xl border bg-card p-4 hover:bg-muted/20 transition-all hover:border-sidebar-primary/40 group',
        'border-border'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="w-9 h-9 rounded-lg bg-sidebar-primary/10 flex items-center justify-center shrink-0 group-hover:bg-sidebar-primary/20 transition-colors">
          <FileText size={16} className="text-sidebar-primary" />
        </div>
        <span className={cn('flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border', cfg.color, cfg.bg, cfg.border)}>
          <StatusIcon size={11} />
          {status}
        </span>
      </div>
      <p className="text-sm font-semibold text-foreground">{topic}</p>
      {sheet?.last_edited && (
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(sheet.last_edited).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>
      )}
    </button>
  )
}
