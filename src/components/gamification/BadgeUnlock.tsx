import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import type { BadgeDef } from '@/lib/badges'

interface Props {
  badges: BadgeDef[]
  onDismiss: () => void
}

export default function BadgeUnlock({ badges, onDismiss }: Props) {
  const [visible, setVisible] = useState(false)
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (badges.length === 0) return
    setIdx(0)
    setVisible(false)
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
  }, [badges])

  useEffect(() => {
    if (!visible) return
    const t = setTimeout(() => {
      if (idx < badges.length - 1) {
        setVisible(false)
        setTimeout(() => { setIdx(i => i + 1); setVisible(true) }, 400)
      } else {
        setVisible(false)
        setTimeout(onDismiss, 400)
      }
    }, 3200)
    return () => clearTimeout(t)
  }, [visible, idx, badges.length, onDismiss])

  if (badges.length === 0) return null
  const badge = badges[idx]

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none flex items-start justify-center pt-16 px-4">
      <div className={cn(
        'pointer-events-auto flex items-center gap-4 bg-card border border-chart-4/50 rounded-2xl px-5 py-4 shadow-2xl transition-all duration-500',
        'max-w-sm w-full',
        visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'
      )}
        style={{ boxShadow: '0 0 40px #fbbf2430' }}
      >
        {/* Icon with glow ring */}
        <div className="relative shrink-0">
          <div className="w-14 h-14 rounded-full bg-chart-4/15 border border-chart-4/30 flex items-center justify-center text-2xl animate-bounce">
            {badge.icon}
          </div>
          <div className="absolute inset-0 rounded-full animate-ping bg-chart-4/20" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-chart-4 uppercase tracking-widest mb-0.5">Badge Unlocked!</p>
          <p className="text-base font-bold text-foreground">{badge.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{badge.description}</p>
        </div>

        {badges.length > 1 && (
          <span className="text-xs text-muted-foreground shrink-0">{idx + 1}/{badges.length}</span>
        )}
      </div>
    </div>
  )
}
