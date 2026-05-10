import { cn } from '@/lib/utils'

type BadgeWithStatus = ReturnType<typeof import('@/hooks/useBadges').useBadges>['badges'][number]

interface Props {
  badges: BadgeWithStatus[]
  compact?: boolean
}

export default function BadgeGrid({ badges, compact = false }: Props) {
  const earned = badges.filter(b => b.earned)
  const locked = badges.filter(b => !b.earned)

  if (compact) {
    // Show only earned badges, max 8
    return (
      <div className="flex flex-wrap gap-2">
        {earned.slice(0, 8).map(b => (
          <div
            key={b.key}
            title={`${b.label} — ${b.description}`}
            className="w-9 h-9 rounded-full bg-chart-4/15 border border-chart-4/30 flex items-center justify-center text-lg cursor-default"
          >
            {b.icon}
          </div>
        ))}
        {earned.length === 0 && (
          <p className="text-xs text-muted-foreground">No badges yet — keep grinding!</p>
        )}
        {earned.length > 8 && (
          <div className="w-9 h-9 rounded-full bg-muted/30 border border-border flex items-center justify-center text-xs text-muted-foreground font-semibold">
            +{earned.length - 8}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {earned.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Earned ({earned.length})</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {earned.map(b => (
              <div key={b.key} className="flex items-center gap-3 rounded-xl border border-chart-4/30 bg-chart-4/5 px-3 py-2.5">
                <span className="text-xl shrink-0">{b.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{b.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {locked.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Locked ({locked.length})</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {locked.map(b => (
              <div key={b.key} className={cn('flex items-center gap-3 rounded-xl border border-border bg-muted/10 px-3 py-2.5 opacity-40')}>
                <span className="text-xl shrink-0 grayscale">{b.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-muted-foreground truncate">{b.label}</p>
                  <p className="text-xs text-muted-foreground/60 truncate">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
