import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Snippet } from '@/types'

export function useSnippets() {
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchSnippets() {
    setLoading(true)
    const { data, error } = await supabase
      .from('snippets')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching snippets:', error)
      setSnippets([])
    } else {
      setSnippets(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchSnippets()
  }, [])

  async function createSnippet(title: string, content: string) {
    const nextReview = new Date()
    nextReview.setDate(nextReview.getDate() + 3)
    
    const { data, error } = await supabase
      .from('snippets')
      .insert({
        title,
        content_markdown: content,
        touch_number: 1,
        next_review_date: nextReview.toISOString().split('T')[0],
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating snippet:', error)
      throw error
    }
    
    await fetchSnippets()
    return data
  }

  async function updateSnippet(id: string, title: string, content: string) {
    const { error } = await supabase
      .from('snippets')
      .update({
        title,
        content_markdown: content,
      })
      .eq('id', id)
    
    if (error) {
      console.error('Error updating snippet:', error)
      throw error
    }
    
    await fetchSnippets()
  }

  async function deleteSnippet(id: string) {
    const { error } = await supabase
      .from('snippets')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting snippet:', error)
      throw error
    }
    
    await fetchSnippets()
  }

  async function advanceSnippetTouch(id: string, currentTouch: number) {
    let nextTouch = currentTouch
    let nextReview: string | null = null
    
    if (currentTouch === 1) {
      nextTouch = 2
      const date = new Date()
      date.setDate(date.getDate() + 7)
      nextReview = date.toISOString().split('T')[0]
    } else if (currentTouch === 2) {
      nextTouch = 3
      nextReview = null // Mastered
    }
    
    const { error } = await supabase
      .from('snippets')
      .update({
        touch_number: nextTouch,
        next_review_date: nextReview,
      })
      .eq('id', id)
    
    if (error) {
      console.error('Error advancing snippet touch:', error)
      throw error
    }
    
    await fetchSnippets()
  }

  async function resetSnippetTouch(id: string) {
    const date = new Date()
    date.setDate(date.getDate() + 3)
    
    const { error } = await supabase
      .from('snippets')
      .update({
        touch_number: 1,
        next_review_date: date.toISOString().split('T')[0],
      })
      .eq('id', id)
    
    if (error) {
      console.error('Error resetting snippet touch:', error)
      throw error
    }
    
    await fetchSnippets()
  }

  return {
    snippets,
    loading,
    refetch: fetchSnippets,
    createSnippet,
    updateSnippet,
    deleteSnippet,
    advanceSnippetTouch,
    resetSnippetTouch,
  }
}
