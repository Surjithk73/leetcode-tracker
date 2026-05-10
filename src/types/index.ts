export type Difficulty = 'Easy' | 'Medium' | 'Hard'
export type Result = 'Solved' | 'Hint' | 'Stuck'
export type Topic =
  | 'Arrays' | 'Strings' | 'HashMaps' | 'Two Pointers' | 'Sliding Window'
  | 'Binary Search' | 'Linked Lists' | 'Stacks' | 'Queues' | 'Trees'
  | 'Heaps' | 'Graphs' | 'Backtracking' | 'Dynamic Programming'
  | 'Tries' | 'Intervals' | 'Greedy' | 'Bit Manipulation'

export interface Question {
  id: string
  name: string
  slug?: string | null
  difficulty: Difficulty
  topic: Topic
  result: Result
  date_logged: string
  touch_number: 1 | 2 | 3
  next_review_date: string | null
  notes: string | null
  flashcard_touch?: number | null
  flashcard_next_review?: string | null
  xp_awarded: number
}

export interface CheatSheet {
  id: string
  topic: Topic
  raw_notes: string
  formatted_markdown: string | null
  last_edited: string
}

export interface PlanDay {
  id: string
  date: string
  assigned_questions: string[]
  revision_items: string[]
  status: 'On Track' | 'Behind' | 'Ahead' | 'Exam Mode' | 'Rest Day'
  manually_modified: boolean
}

export interface Setting {
  id: string
  key: string
  value: string
}

export interface Badge {
  id: string
  badge_key: string
  earned_at: string
}

export interface MasterQuestion {
  id: string
  title: string
  slug: string
  topic: Topic
  difficulty: Difficulty
  source: ('neetcode' | 'striver')[]
  order: number
}

export interface Snippet {
  id: string
  title: string
  content_markdown: string
  created_at: string
  touch_number: 1 | 2 | 3
  next_review_date: string | null
}

export type FlashcardType = 'question' | 'snippet'

export interface Flashcard {
  id: string
  type: FlashcardType
  front: string
  back: string
  touch_number: number
  sourceId: string
  metadata?: {
    slug?: string
    topic?: Topic
    difficulty?: Difficulty
  }
}

export const TOPICS: Topic[] = [
  'Arrays', 'Strings', 'HashMaps', 'Two Pointers', 'Sliding Window',
  'Binary Search', 'Linked Lists', 'Stacks', 'Queues', 'Trees',
  'Heaps', 'Graphs', 'Backtracking', 'Dynamic Programming',
  'Tries', 'Intervals', 'Greedy', 'Bit Manipulation',
]

export const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard']
export const RESULTS: Result[] = ['Solved', 'Hint', 'Stuck']

export const XP_MAP: Record<Difficulty, Record<Result, number>> = {
  Easy:   { Solved: 10, Hint: 5,  Stuck: 1 },
  Medium: { Solved: 20, Hint: 10, Stuck: 2 },
  Hard:   { Solved: 30, Hint: 15, Stuck: 3 },
}

export const LEVEL_NAMES: Record<number, string> = {
  1: 'Brute Force',
  2: 'Linear Scan',
  3: 'Hash It Out',
  4: 'Sliding Window',
  5: 'Two Pointer',
  6: 'Binary Search',
  7: 'Stack Overflow',
  8: 'Tree Climber',
  9: 'Heap Master',
  10: 'Graph Traversal',
  11: 'Backtracker',
  12: 'Trie Hard',
  13: 'Interval Wizard',
  14: 'Greedy Goblin',
  15: 'DP Enjoyer',
}

export function getLevelFromXP(xp: number): number {
  return Math.max(1, Math.floor(xp / 100) + 1)
}

export function getLevelName(xp: number): string {
  const level = getLevelFromXP(xp)
  return LEVEL_NAMES[Math.min(level, 15)] ?? 'DP Enjoyer'
}

// Prep window constants
// Journey starts: May 10, 2026 (Day 1)
// Target end: July 1, 2026 (52 days of prep)
// Exam dates: configure in Settings when known; defaults set far out so you stay in Pre-Exam Prep mode
export const PREP_START = new Date('2026-05-10')
export const PREP_END = new Date('2026-07-01')
export const EXAM_START = new Date('2026-12-01') // placeholder — update in Settings
export const EXAM_END = new Date('2026-12-31')   // placeholder — update in Settings
