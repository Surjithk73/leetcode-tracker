import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { CheatSheet, Topic } from '@/types'

export function useCheatSheets() {
  const [sheets, setSheets] = useState<CheatSheet[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('cheat_sheets').select('*').order('topic')
    setSheets((data as CheatSheet[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  async function upsert(topic: Topic, raw_notes: string, formatted_markdown?: string) {
    await supabase.from('cheat_sheets').upsert(
      { topic, raw_notes, formatted_markdown: formatted_markdown ?? null, last_edited: new Date().toISOString() },
      { onConflict: 'topic' }
    )
    fetch()
  }

  return { sheets, loading, refetch: fetch, upsert }
}
