import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { PlanDay } from '@/types'

export function usePlanner() {
  const [planDays, setPlanDays] = useState<PlanDay[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('plan')
      .select('*')
      .order('date', { ascending: true })
    setPlanDays((data as PlanDay[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { planDays, loading, refetch: fetch }
}
