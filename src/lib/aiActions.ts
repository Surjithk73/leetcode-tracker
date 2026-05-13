import { supabase } from './supabase'
import { calcXP, calcNextReviewDate } from './xp'
import type { Difficulty, Result, Topic } from '@/types'

export interface AIAction {
  type: string
  data?: Record<string, unknown>
  id?: string
}

/** Extract ACTION:{...} block from AI response text */
export function parseAction(text: string): { action: AIAction | null; displayText: string } {
  const match = text.match(/ACTION:(\{.*?\})/s)
  if (!match) return { action: null, displayText: text }
  try {
    const action = JSON.parse(match[1]) as AIAction
    const displayText = text.replace(/ACTION:\{.*?\}/s, '').trim()
    return { action, displayText }
  } catch {
    return { action: null, displayText: text }
  }
}

/** Execute a parsed AI action against Supabase */
export async function executeAction(action: AIAction): Promise<string> {
  switch (action.type) {
    case 'log_question': {
      const d = action.data as {
        name: string; difficulty: Difficulty; topic: Topic
        result: Result; date_logged?: string; notes?: string
      }
      const date = d.date_logged ?? new Date().toISOString().split('T')[0]
      const xp = calcXP(d.difficulty, d.result)
      const next = calcNextReviewDate(date, 1)
      const { error } = await supabase.from('questions').insert({
        name: d.name, difficulty: d.difficulty, topic: d.topic,
        result: d.result, date_logged: date, notes: d.notes ?? null,
        touch_number: 1, xp_awarded: xp, next_review_date: next,
      })
      if (error) throw new Error(error.message)
      return `✅ Logged "${d.name}" — +${xp} XP`
    }

    case 'mark_revision': {
      const { data: q } = await supabase
        .from('questions').select('*').eq('id', action.id).single()
      if (!q) throw new Error('Question not found')
      const newTouch = (q.touch_number + 1) as 1 | 2 | 3
      const next = calcNextReviewDate(new Date().toISOString().split('T')[0], newTouch)
      await supabase.from('questions').update({
        touch_number: newTouch, next_review_date: next, xp_awarded: q.xp_awarded + 5,
      }).eq('id', action.id)
      return `✅ Revision marked done — +5 XP`
    }

    case 'delete_question': {
      const { error } = await supabase.from('questions').delete().eq('id', action.id)
      if (error) throw new Error(error.message)
      return `🗑️ Question deleted`
    }

    case 'update_setting': {
      const { key, value } = action.data as { key: string; value: string }
      await supabase.from('settings').upsert({ key, value }, { onConflict: 'user_id,key' })
      return `✅ Setting "${key}" updated`
    }

    default:
      return `⚠️ Unknown action: ${action.type}`
  }
}
