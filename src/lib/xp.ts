import type { Difficulty, Result } from '@/types'
import { XP_MAP } from '@/types'

export function calcXP(difficulty: Difficulty, result: Result): number {
  return XP_MAP[difficulty][result]
}

export function calcTotalXP(questions: { xp_awarded: number }[]): number {
  return questions.reduce((sum, q) => sum + q.xp_awarded, 0)
}

/** Touch 2 = 3 days after touch 1, Touch 3 = 7 days after touch 2 */
export function calcNextReviewDate(dateLogged: string, touchNumber: 1 | 2 | 3): string | null {
  if (touchNumber === 3) return null // fully mastered
  const d = new Date(dateLogged)
  d.setDate(d.getDate() + (touchNumber === 1 ? 3 : 7))
  return d.toISOString().split('T')[0]
}

export function calcStreak(questions: { date_logged: string }[]): number {
  if (!questions.length) return 0
  const days = [...new Set(questions.map(q => q.date_logged))].sort().reverse()
  const today = new Date().toISOString().split('T')[0]
  let streak = 0
  let cursor = today
  for (const day of days) {
    if (day === cursor) {
      streak++
      const d = new Date(cursor)
      d.setDate(d.getDate() - 1)
      cursor = d.toISOString().split('T')[0]
    } else if (day < cursor) {
      break
    }
  }
  return streak
}
