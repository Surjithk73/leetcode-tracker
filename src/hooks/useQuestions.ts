import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Question } from '@/types'

export function useQuestions() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('date_logged', { ascending: false })
    if (error) setError(error.message)
    else setQuestions((data as Question[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { questions, loading, error, refetch: fetch }
}
