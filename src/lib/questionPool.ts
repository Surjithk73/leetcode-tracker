import neetcode150Raw from '@/data/neetcode150.json'
import striverRaw from '@/data/striver_sde.json'
import type { MasterQuestion } from '@/types'

interface RawQuestion {
  id: string
  title: string
  slug: string
  topic: string
  difficulty: string
  source: string
  order: number
}

/**
 * Merges NeetCode 150 and Striver SDE sheets into a deduplicated master pool.
 * Questions with matching slugs are merged with combined sources.
 */
export function getMasterQuestionPool(): MasterQuestion[] {
  const neetcode = neetcode150Raw as RawQuestion[]
  const striver = striverRaw as RawQuestion[]
  
  const map = new Map<string, MasterQuestion>()
  
  // Add NeetCode questions
  for (const q of neetcode) {
    map.set(q.slug, {
      id: q.id,
      title: q.title,
      slug: q.slug,
      topic: q.topic as any,
      difficulty: q.difficulty as any,
      source: ['neetcode'],
      order: q.order,
    })
  }
  
  // Merge Striver questions
  for (const q of striver) {
    const existing = map.get(q.slug)
    if (existing) {
      // Duplicate found - merge sources and use lower order
      existing.source.push('striver')
      existing.order = Math.min(existing.order, q.order)
    } else {
      // New question
      map.set(q.slug, {
        id: q.id,
        title: q.title,
        slug: q.slug,
        topic: q.topic as any,
        difficulty: q.difficulty as any,
        source: ['striver'],
        order: q.order,
      })
    }
  }
  
  // Convert to array and sort by topic order, then by order within topic
  const topicOrder = [
    'Arrays', 'Strings', 'HashMaps', 'Two Pointers', 'Sliding Window',
    'Binary Search', 'Linked Lists', 'Stacks', 'Queues', 'Trees',
    'Heaps', 'Graphs', 'Backtracking', 'Dynamic Programming',
    'Tries', 'Intervals', 'Greedy', 'Bit Manipulation',
  ]
  
  return Array.from(map.values()).sort((a, b) => {
    const topicDiff = topicOrder.indexOf(a.topic) - topicOrder.indexOf(b.topic)
    if (topicDiff !== 0) return topicDiff
    return a.order - b.order
  })
}

/**
 * Get questions from a specific source
 */
export function getQuestionsBySource(source: 'neetcode' | 'striver'): MasterQuestion[] {
  return getMasterQuestionPool().filter(q => q.source.includes(source))
}

/**
 * Get questions by topic
 */
export function getQuestionsByTopic(topic: string): MasterQuestion[] {
  return getMasterQuestionPool().filter(q => q.topic === topic)
}

/**
 * Get a question by slug
 */
export function getQuestionBySlug(slug: string): MasterQuestion | undefined {
  return getMasterQuestionPool().find(q => q.slug === slug)
}
