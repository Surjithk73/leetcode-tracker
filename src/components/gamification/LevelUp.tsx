import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  level: number
  levelName: string
  onDismiss: () => void
}

export default function LevelUp({ level, levelName, onDismiss }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 400)
    }, 3500)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center px-4">
      <div className={cn(
        'pointer-events-auto text-center bg-card border border-sidebar-primary/50 rounded-2xl px-8 py-6 shadow-2xl transition-all duration-500 max-w-xs w-full',
        visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
      )}
        style={{ boxShadow: '0 0 60px #1d4ed840' }}
      >
        <div className="text-4xl mb-3 animate-bounce">⬆️</div>
        <p className="text-xs font-semibold text-sidebar-primary uppercase tracking-widest mb-1">Level Up!</p>
        <p className="text-3xl font-black text-foreground">Level {level}</p>
        <p className="text-sm text-chart-4 font-semibold mt-1">{levelName}</p>
        <button
          onClick={() => { setVisible(false); setTimeout(onDismiss, 300) }}
          className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
