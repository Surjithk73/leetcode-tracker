import { useEffect, useRef } from 'react'
import { X, Play, Pause, RotateCcw, Flag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTimer } from '@/hooks/useTimer'

interface Props {
  open: boolean
  durationMinutes: number
  onClose: () => void
  onComplete: () => void // opens log modal
}

const SIZE = 260
const STROKE = 10
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function getRingColor(secondsLeft: number, total: number): string {
  const pct = secondsLeft / total
  if (pct > 0.5) return '#1d4ed8'   // blue — sidebar-primary
  if (pct > 0.25) return '#f59e0b'  // amber — chart-3
  return '#f43f5e'                   // rose — chart-5
}

export default function TimerModal({ open, durationMinutes, onClose, onComplete }: Props) {
  const totalSeconds = durationMinutes * 60
  const { secondsLeft, state, progress, start, pause, resume, reset } = useTimer(totalSeconds)
  const audioRef = useRef<AudioContext | null>(null)

  const nearEnd = secondsLeft <= 300 && secondsLeft > 0 && state === 'running' // ≤5 min
  const veryNearEnd = secondsLeft <= 60 && secondsLeft > 0 && state === 'running'

  // Fire completion
  useEffect(() => {
    if (state === 'done') {
      playBeep()
      onComplete()
    }
  }, [state, onComplete])

  function playBeep() {
    try {
      const ctx = new AudioContext()
      audioRef.current = ctx
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 1.2)
    } catch (_) { /* audio not available */ }
  }

  function handleGiveUp() {
    reset()
    onComplete()
  }

  if (!open) return null

  const strokeDashoffset = CIRCUMFERENCE * progress
  const ringColor = getRingColor(secondsLeft, totalSeconds)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className={cn(
        'relative w-full max-w-sm bg-card border rounded-2xl shadow-2xl overflow-hidden transition-all',
        veryNearEnd ? 'border-chart-5/60' : nearEnd ? 'border-chart-3/60' : 'border-border'
      )}>
        {/* Ambient glow behind ring */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
          style={{
            background: `radial-gradient(ellipse at 50% 45%, ${ringColor}18 0%, transparent 70%)`,
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border relative z-10">
          <span className="text-sm font-semibold text-foreground">Solve Timer</span>
          <div className="flex items-center gap-2">
            <span className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full border',
              state === 'running' ? 'text-chart-2 border-chart-2/40 bg-chart-2/10' :
              state === 'paused'  ? 'text-chart-3 border-chart-3/40 bg-chart-3/10' :
              state === 'done'    ? 'text-chart-5 border-chart-5/40 bg-chart-5/10' :
                                    'text-muted-foreground border-border bg-muted/30'
            )}>
              {state === 'idle' ? 'Ready' : state === 'running' ? 'Running' : state === 'paused' ? 'Paused' : "Time's up"}
            </span>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Ring */}
        <div className="flex flex-col items-center py-10 relative z-10">
          <div className="relative" style={{ width: SIZE, height: SIZE }}>
            <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
              {/* Track */}
              <circle
                cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
                fill="none"
                stroke="currentColor"
                strokeWidth={STROKE}
                className="text-muted/40"
              />
              {/* Progress arc */}
              <circle
                cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
                fill="none"
                stroke={ringColor}
                strokeWidth={STROKE}
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dashoffset 0.9s linear, stroke 0.6s ease',
                  filter: `drop-shadow(0 0 8px ${ringColor}88)`,
                }}
              />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
              <span
                className={cn(
                  'font-mono font-bold tracking-tight transition-all',
                  veryNearEnd ? 'text-5xl text-chart-5' : nearEnd ? 'text-5xl text-chart-3' : 'text-5xl text-foreground',
                  veryNearEnd && 'animate-pulse'
                )}
              >
                {formatTime(secondsLeft)}
              </span>
              <span className="text-xs text-muted-foreground">
                {durationMinutes} min session
              </span>
              {nearEnd && state === 'running' && (
                <span className={cn(
                  'text-xs font-medium mt-1 px-2 py-0.5 rounded-full',
                  veryNearEnd
                    ? 'text-chart-5 bg-chart-5/10 animate-pulse'
                    : 'text-chart-3 bg-chart-3/10'
                )}>
                  {veryNearEnd ? '⚡ Wrap it up!' : '💡 Consider a hint'}
                </span>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={reset}
              className="w-11 h-11 rounded-full border border-border bg-muted/30 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors"
            >
              <RotateCcw size={16} />
            </button>

            {/* Primary action */}
            {state === 'idle' && (
              <button
                onClick={start}
                className="w-16 h-16 rounded-full bg-sidebar-primary flex items-center justify-center text-white shadow-lg hover:opacity-90 transition-opacity"
                style={{ boxShadow: `0 0 24px ${ringColor}66` }}
              >
                <Play size={22} fill="white" />
              </button>
            )}
            {state === 'running' && (
              <button
                onClick={pause}
                className="w-16 h-16 rounded-full bg-sidebar-primary flex items-center justify-center text-white shadow-lg hover:opacity-90 transition-opacity"
              >
                <Pause size={22} fill="white" />
              </button>
            )}
            {state === 'paused' && (
              <button
                onClick={resume}
                className="w-16 h-16 rounded-full bg-sidebar-primary flex items-center justify-center text-white shadow-lg hover:opacity-90 transition-opacity"
                style={{ boxShadow: `0 0 24px ${ringColor}66` }}
              >
                <Play size={22} fill="white" />
              </button>
            )}
            {state === 'done' && (
              <button
                onClick={() => { reset(); onComplete() }}
                className="w-16 h-16 rounded-full bg-chart-2 flex items-center justify-center text-white shadow-lg hover:opacity-90 transition-opacity"
              >
                <Play size={22} fill="white" />
              </button>
            )}

            <button
              onClick={handleGiveUp}
              disabled={state === 'idle'}
              className="w-11 h-11 rounded-full border border-border bg-muted/30 flex items-center justify-center text-muted-foreground hover:text-chart-5 hover:border-chart-5/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Give up — log result now"
            >
              <Flag size={16} />
            </button>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            {state === 'idle' ? 'Press play to start your 20-min solve window' :
             state === 'paused' ? 'Timer paused — tab switches are safe' :
             state === 'running' ? 'Timer runs in background across tab switches' :
             'Log your result below'}
          </p>
        </div>
      </div>
    </div>
  )
}
