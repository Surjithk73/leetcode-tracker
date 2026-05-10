import type { Question, Topic } from '@/types'
import { calcTotalXP, calcStreak } from './xp'
import { getLevelFromXP } from '@/types'

export interface BadgeDef {
  key: string
  label: string
  description: string
  icon: string
  check: (questions: Question[], earnedKeys: Set<string>) => boolean
}

export const BADGE_DEFS: BadgeDef[] = [
  // Milestones
  {
    key: 'first_question',
    label: 'First Blood',
    description: 'Logged your first question',
    icon: '🩸',
    check: (qs) => qs.length >= 1,
  },
  {
    key: 'first_hard',
    label: 'Hard Mode',
    description: 'Solved your first Hard question',
    icon: '💀',
    check: (qs) => qs.some(q => q.difficulty === 'Hard' && q.result === 'Solved'),
  },
  {
    key: 'q10',
    label: '10 Down',
    description: 'Logged 10 questions',
    icon: '🔟',
    check: (qs) => qs.length >= 10,
  },
  {
    key: 'q25',
    label: 'Quarter Century',
    description: 'Logged 25 questions',
    icon: '🥈',
    check: (qs) => qs.length >= 25,
  },
  {
    key: 'q50',
    label: '50 Questions Done',
    description: 'Logged 50 questions',
    icon: '🥇',
    check: (qs) => qs.length >= 50,
  },
  {
    key: 'q100',
    label: 'Triple Digits',
    description: 'Logged 100 questions',
    icon: '💯',
    check: (qs) => qs.length >= 100,
  },
  {
    key: 'q150',
    label: 'NeetCode Complete',
    description: 'Logged 150 questions',
    icon: '🏆',
    check: (qs) => qs.length >= 150,
  },
  // Streaks
  {
    key: 'streak3',
    label: '3-Day Streak',
    description: '3 consecutive days logged',
    icon: '🔥',
    check: (qs) => calcStreak(qs) >= 3,
  },
  {
    key: 'streak7',
    label: '7-Day Streak',
    description: '7 consecutive days logged',
    icon: '🔥🔥',
    check: (qs) => calcStreak(qs) >= 7,
  },
  {
    key: 'streak14',
    label: '2-Week Grind',
    description: '14 consecutive days logged',
    icon: '⚡',
    check: (qs) => calcStreak(qs) >= 14,
  },
  {
    key: 'streak30',
    label: 'Month of Pain',
    description: '30 consecutive days logged',
    icon: '🌟',
    check: (qs) => calcStreak(qs) >= 30,
  },
  // XP / Level
  {
    key: 'level5',
    label: 'Two Pointer',
    description: 'Reached Level 5',
    icon: '👆',
    check: (qs) => getLevelFromXP(calcTotalXP(qs)) >= 5,
  },
  {
    key: 'level10',
    label: 'Graph Traversal',
    description: 'Reached Level 10',
    icon: '🗺️',
    check: (qs) => getLevelFromXP(calcTotalXP(qs)) >= 10,
  },
  {
    key: 'level15',
    label: 'DP Enjoyer',
    description: 'Reached Level 15',
    icon: '🧠',
    check: (qs) => getLevelFromXP(calcTotalXP(qs)) >= 15,
  },
  // Topic mastery (all questions in topic solved)
  ...(['Arrays', 'Trees', 'Graphs', 'Dynamic Programming'] as Topic[]).map(topic => ({
    key: `mastered_${topic.toLowerCase().replace(/ /g, '_')}`,
    label: `Topic Mastered: ${topic}`,
    description: `Solved 5+ ${topic} questions`,
    icon: '📚',
    check: (qs: Question[]) =>
      qs.filter(q => q.topic === topic && q.result === 'Solved').length >= 5,
  })),
  // Revision
  {
    key: 'first_revision',
    label: 'Revisionist',
    description: 'Completed your first revision',
    icon: '🔄',
    check: (qs) => qs.some(q => q.touch_number >= 2),
  },
  {
    key: 'mastered10',
    label: 'Touch 3 Master',
    description: 'Fully mastered 10 questions (Touch 3)',
    icon: '✅',
    check: (qs) => qs.filter(q => q.touch_number === 3).length >= 10,
  },
]

/** Returns badge keys that should now be earned but aren't yet */
export function getNewlyEarnedBadges(
  questions: Question[],
  alreadyEarned: Set<string>
): BadgeDef[] {
  return BADGE_DEFS.filter(
    b => !alreadyEarned.has(b.key) && b.check(questions, alreadyEarned)
  )
}
