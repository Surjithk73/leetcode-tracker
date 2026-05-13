import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { PlanDay } from '@/types'

export function useDailyPlan() {
  const [todayPlan, setTodayPlan] = useState<PlanDay | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  async function fetchTodayPlan() {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('plan')
      .select('*')
      .eq('date', today)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No plan for today - this is okay
        setTodayPlan(null)
      } else {
        console.error('Error fetching today plan:', error)
      }
    } else {
      setTodayPlan(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTodayPlan()
  }, [])

  async function updateTodayPlan(updates: Partial<PlanDay>) {
    const today = new Date().toISOString().split('T')[0]
    
const { error } = await supabase
        .from('plan')
        .upsert({
          date: today,
          ...updates,
        }, { onConflict: 'user_id,date' })
    
    if (error) {
      console.error('Error updating today plan:', error)
      throw error
    }
    
    await fetchTodayPlan()
  }

  async function generatePlan() {
    setGenerating(true)
    try {
      // This will be called from the Dashboard component
      // which has access to the questions data
      await fetchTodayPlan()
    } finally {
      setGenerating(false)
    }
  }

  return {
    todayPlan,
    loading,
    generating,
    refetch: fetchTodayPlan,
    updateTodayPlan,
    generatePlan,
  }
}
