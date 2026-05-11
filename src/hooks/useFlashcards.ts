import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Flashcard, Question, Snippet } from '@/types'

export function useFlashcards() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [allFlashcards, setAllFlashcards] = useState<Flashcard[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchFlashcards() {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]
    
    // Fetch question flashcards (notes-based) — DUE TODAY
    const { data: questions, error: qError } = await supabase
      .from('questions')
      .select('*')
      .not('notes', 'is', null)
      .neq('notes', '')
      .lte('flashcard_next_review', today)
      .lt('flashcard_touch', 3)
    
    // Fetch snippet flashcards — DUE TODAY
    const { data: snippets, error: sError } = await supabase
      .from('snippets')
      .select('*')
      .lte('next_review_date', today)
      .lt('touch_number', 3)
    
    // Fetch ALL flashcards (for practice mode)
    const { data: allQuestions } = await supabase
      .from('questions')
      .select('*')
      .not('notes', 'is', null)
      .neq('notes', '')
      .lt('flashcard_touch', 3)
    
    const { data: allSnippets } = await supabase
      .from('snippets')
      .select('*')
      .lt('touch_number', 3)
    
    if (qError) console.error('Error fetching question flashcards:', qError)
    if (sError) console.error('Error fetching snippet flashcards:', sError)
    
    const cards: Flashcard[] = []
    const allCards: Flashcard[] = []
    
    // Convert questions to flashcards (due today)
    if (questions) {
      for (const q of questions as Question[]) {
        cards.push({
          id: `q_${q.id}`,
          type: 'question',
          front: q.name,
          back: q.notes || '',
          touch_number: q.flashcard_touch || 1,
          sourceId: q.id,
          metadata: {
            slug: q.slug || undefined,
            topic: q.topic,
            difficulty: q.difficulty,
          },
        })
      }
    }
    
    // Convert snippets to flashcards (due today)
    if (snippets) {
      for (const s of snippets as Snippet[]) {
        cards.push({
          id: `s_${s.id}`,
          type: 'snippet',
          front: s.title,
          back: s.content_markdown,
          touch_number: s.touch_number,
          sourceId: s.id,
        })
      }
    }
    
    // Convert ALL questions to flashcards
    if (allQuestions) {
      for (const q of allQuestions as Question[]) {
        allCards.push({
          id: `q_${q.id}`,
          type: 'question',
          front: q.name,
          back: q.notes || '',
          touch_number: q.flashcard_touch || 1,
          sourceId: q.id,
          metadata: {
            slug: q.slug || undefined,
            topic: q.topic,
            difficulty: q.difficulty,
          },
        })
      }
    }
    
    // Convert ALL snippets to flashcards
    if (allSnippets) {
      for (const s of allSnippets as Snippet[]) {
        allCards.push({
          id: `s_${s.id}`,
          type: 'snippet',
          front: s.title,
          back: s.content_markdown,
          touch_number: s.touch_number,
          sourceId: s.id,
        })
      }
    }
    
    setFlashcards(cards)
    setAllFlashcards(allCards)
    setLoading(false)
  }

  useEffect(() => {
    fetchFlashcards()
  }, [])

  async function advanceFlashcard(card: Flashcard) {
    let nextTouch = card.touch_number
    let nextReview: string | null = null
    
    if (card.touch_number === 1) {
      nextTouch = 2
      const date = new Date()
      date.setDate(date.getDate() + 7)
      nextReview = date.toISOString().split('T')[0]
    } else if (card.touch_number === 2) {
      nextTouch = 3
      nextReview = null // Mastered
    }
    
    if (card.type === 'question') {
      const { error } = await supabase
        .from('questions')
        .update({
          flashcard_touch: nextTouch,
          flashcard_next_review: nextReview,
        })
        .eq('id', card.sourceId)
      
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('snippets')
        .update({
          touch_number: nextTouch,
          next_review_date: nextReview,
        })
        .eq('id', card.sourceId)
      
      if (error) throw error
    }
    
    await fetchFlashcards()
  }

  async function rescheduleFlashcard(card: Flashcard) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextReview = tomorrow.toISOString().split('T')[0]
    
    if (card.type === 'question') {
      const { error } = await supabase
        .from('questions')
        .update({ flashcard_next_review: nextReview })
        .eq('id', card.sourceId)
      
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('snippets')
        .update({ next_review_date: nextReview })
        .eq('id', card.sourceId)
      
      if (error) throw error
    }
    
    await fetchFlashcards()
  }

  async function resetFlashcard(card: Flashcard) {
    const date = new Date()
    date.setDate(date.getDate() + 3)
    const nextReview = date.toISOString().split('T')[0]
    
    if (card.type === 'question') {
      const { error } = await supabase
        .from('questions')
        .update({
          flashcard_touch: 1,
          flashcard_next_review: nextReview,
        })
        .eq('id', card.sourceId)
      
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('snippets')
        .update({
          touch_number: 1,
          next_review_date: nextReview,
        })
        .eq('id', card.sourceId)
      
      if (error) throw error
    }
    
    await fetchFlashcards()
  }

  return {
    flashcards,
    allFlashcards,
    loading,
    refetch: fetchFlashcards,
    advanceFlashcard,
    rescheduleFlashcard,
    resetFlashcard,
  }
}
