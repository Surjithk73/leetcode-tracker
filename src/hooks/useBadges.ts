import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getNewlyEarnedBadges, BADGE_DEFS, type BadgeDef } from '@/lib/badges'
import type { Question, Badge } from '@/types'

export function useBadges(questions: Question[]) {
  const [badges, setBadges] = useState<Badge[]>([])
  const [newBadges, setNewBadges] = useState<BadgeDef[]>([])

  const fetchBadges = useCallback(async () => {
    const { data } = await supabase.from('badges').select('*').order('earned_at')
    setBadges((data as Badge[]) ?? [])
    return (data as Badge[]) ?? []
  }, [])

  // Check and award new badges whenever questions change
  useEffect(() => {
    if (!questions.length) return
    ;(async () => {
      const current = await fetchBadges()
      const earnedKeys = new Set(current.map(b => b.badge_key))
      const newly = getNewlyEarnedBadges(questions, earnedKeys)
      if (newly.length === 0) return

      // Insert new badges
      await supabase.from('badges').insert(
        newly.map(b => ({ badge_key: b.key, earned_at: new Date().toISOString() }))
      )
      setNewBadges(newly)
      fetchBadges()
    })()
  }, [questions, fetchBadges])

  const dismissNew = useCallback(() => setNewBadges([]), [])

  const earnedKeys = new Set(badges.map(b => b.badge_key))
  const allBadges = BADGE_DEFS.map(def => ({
    ...def,
    earned: earnedKeys.has(def.key),
    earnedAt: badges.find(b => b.badge_key === def.key)?.earned_at,
  }))

  return { badges: allBadges, newBadges, dismissNew }
}
