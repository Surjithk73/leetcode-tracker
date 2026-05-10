import { PREP_START, PREP_END, EXAM_START, EXAM_END } from '@/types'
import type { PlanDay } from '@/types'

/** All dates from prep start to prep end as YYYY-MM-DD strings */
export function getAllPrepDates(): string[] {
  const dates: string[] = []
  const cursor = new Date(PREP_START)
  cursor.setHours(0, 0, 0, 0)
  const end = new Date(PREP_END)
  end.setHours(0, 0, 0, 0)
  while (cursor <= end) {
    dates.push(cursor.toISOString().split('T')[0])
    cursor.setDate(cursor.getDate() + 1)
  }
  return dates
}

export function isExamDay(dateStr: string): boolean {
  const d = new Date(dateStr)
  return d >= EXAM_START && d <= EXAM_END
}

export function isSunday(dateStr: string): boolean {
  return new Date(dateStr).getDay() === 0
}

export function getDailyTarget(dateStr: string): number {
  if (isExamDay(dateStr)) return 1
  if (isSunday(dateStr)) return 0
  const d = new Date(dateStr)
  if (d > EXAM_END) return 4
  return 2
}

export function getDayStatus(
  day: PlanDay,
  loggedCount: number,
): PlanDay['status'] {
  const dateStr = day.date
  if (isExamDay(dateStr)) return 'Exam Mode'
  if (isSunday(dateStr)) return 'Rest Day'
  const target = getDailyTarget(dateStr)
  if (target === 0) return 'Rest Day'
  if (loggedCount >= target + 1) return 'Ahead'
  if (loggedCount >= target) return 'On Track'
  // Only mark Behind if the day is in the past
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(dateStr)
  if (d < today && loggedCount < target) return 'Behind'
  return 'On Track'
}

export function formatDate(dateStr: string): { weekday: string; day: number; month: string } {
  const d = new Date(dateStr)
  return {
    weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
    day: d.getDate(),
    month: d.toLocaleDateString('en-US', { month: 'short' }),
  }
}

export function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().split('T')[0]
}

export function isPast(dateStr: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(dateStr) < today
}
