import { useState } from 'react'
import { Timer } from 'lucide-react'
import { cn } from '@/lib/utils'
import TimerModal from './TimerModal'
import QuestionModal from '@/components/questions/QuestionModal'
import { supabase } from '@/lib/supabase'
import { calcXP, calcNextReviewDate } from '@/lib/xp'
import type { Question } from '@/types'

interface Props {
  durationMinutes?: number
}

export default function TimerFAB({ durationMinutes = 20 }: Props) {
  const [timerOpen, setTimerOpen] = useState(false)
  const [logOpen, setLogOpen] = useState(false)
  const [pulse, setPulse] = useState(false)

  function handleTimerComplete() {
    setTimerOpen(false)
    setPulse(true)
    setTimeout(() => setPulse(false), 2000)
    setLogOpen(true)
  }

  async function handleLogSave(data: Omit<Question, 'id' | 'xp_awarded' | 'touch_number' | 'next_review_date'>) {
    const xp = calcXP(data.difficulty, data.result)
    const next_review_date = calcNextReviewDate(data.date_logged, 1)
    await supabase.from('questions').insert({
      ...data, touch_number: 1, xp_awarded: xp, next_review_date,
    })
  }

  return (
    <>
      <button
        onClick={() => setTimerOpen(true)}
        className={cn(
          'fixed bottom-20 md:bottom-6 right-4 z-40 w-13 h-13 rounded-full bg-sidebar-primary text-white shadow-xl flex items-center justify-center transition-all hover:opacity-90 hover:scale-105',
          pulse && 'animate-ping-once ring-4 ring-sidebar-primary/40'
        )}
        style={{ width: 52, height: 52, boxShadow: '0 0 20px #1d4ed855' }}
        title="Start solve timer"
      >
        <Timer size={22} />
      </button>

      <TimerModal
        open={timerOpen}
        durationMinutes={durationMinutes}
        onClose={() => setTimerOpen(false)}
        onComplete={handleTimerComplete}
      />

      <QuestionModal
        open={logOpen}
        onClose={() => setLogOpen(false)}
        onSave={handleLogSave}
      />
    </>
  )
}
