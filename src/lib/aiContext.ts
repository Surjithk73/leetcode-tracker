import type { Question } from '@/types'
import { calcTotalXP, calcStreak } from './xp'
import { getLevelName } from '@/types'
import { EXAM_START, EXAM_END, PREP_END } from '@/types'

function getCurrentPhase(): string {
  const today = new Date()
  if (today >= EXAM_START && today <= EXAM_END) return 'Exam Mode (1 question/day max)'
  if (today > EXAM_END) return 'Holiday Sprint (3–5 questions/day)'
  return 'Pre-Exam Prep (2–3 questions/day)'
}

function getDailyTarget(): number {
  const today = new Date()
  if (today >= EXAM_START && today <= EXAM_END) return 1
  if (today > EXAM_END) return 4
  return 2
}

function daysUntilEnd(): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.max(0, Math.floor((PREP_END.getTime() - today.getTime()) / 86400000))
}

export function buildSystemPrompt(questions: Question[]): string {
  const today = new Date().toISOString().split('T')[0]
  const todayQs = questions.filter(q => q.date_logged === today)
  const totalXP = calcTotalXP(questions)
  const streak = calcStreak(questions)
  const levelName = getLevelName(totalXP)
  const dueRevisions = questions.filter(q =>
    q.next_review_date && q.next_review_date <= today && q.touch_number < 3
  )
  const last7 = questions
    .filter(q => q.date_logged >= new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0])
    .slice(0, 20)

  return `You are an AI prep assistant for a LeetCode placement preparation tracker. You help the user track their progress, manage their schedule, and stay motivated.

CURRENT CONTEXT:
- Date: ${today}
- Phase: ${getCurrentPhase()}
- Days until placements (July 1 2026): ${daysUntilEnd()}
- Daily target: ${getDailyTarget()} questions
- Today's logged: ${todayQs.length}/${getDailyTarget()}
- Total questions logged: ${questions.length}
- XP: ${totalXP} | Level: ${levelName}
- Streak: ${streak} days
- Revisions due today: ${dueRevisions.length}
${dueRevisions.length > 0 ? dueRevisions.map(q => `  • ${q.name} (Touch ${q.touch_number + 1})`).join('\n') : ''}

LAST 7 DAYS ACTIVITY:
${last7.length > 0 ? last7.map(q => `- ${q.date_logged}: ${q.name} [${q.difficulty}/${q.topic}] → ${q.result}`).join('\n') : 'No activity in last 7 days.'}

RULES YOU MUST FOLLOW:
1. You are a TRACKER ASSISTANT only. You help with scheduling, logging, progress analysis, and motivation.
2. You MUST REFUSE any request to explain algorithms, solve problems, give hints, or help with coding. If asked, say: "I'm your prep tracker, not a tutor — I can't help with problem-solving. Try the NeetCode video for this one!"
3. When performing write actions, respond with a JSON action block in this exact format on its own line:
   ACTION:{"type":"log_question","data":{...}} or ACTION:{"type":"mark_revision","id":"..."} or ACTION:{"type":"delete_question","id":"..."} etc.
4. Always confirm before destructive actions (delete, full replan).
5. Be concise, warm, and motivating. You know this user is grinding for placements.`
}

export function buildBriefingPrompt(questions: Question[]): string {
  const today = new Date().toISOString().split('T')[0]
  const dueRevisions = questions.filter(q =>
    q.next_review_date && q.next_review_date <= today && q.touch_number < 3
  )
  const target = getDailyTarget()
  const todayCount = questions.filter(q => q.date_logged === today).length
  const streak = calcStreak(questions)

  return `Generate a short daily briefing card for a LeetCode prep tracker user. Keep it under 80 words total. Include:
1. A one-line greeting with today's date (${today})
2. Today's target: ${target} new questions, ${dueRevisions.length} revisions due
3. Current streak: ${streak} days
4. One short motivational line tailored to their progress (${todayCount}/${target} done today)

Format as plain text, no markdown headers. Be energetic but concise.`
}

export function buildWeeklyDigestPrompt(questions: Question[]): string {
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
  const weekQs = questions.filter(q => q.date_logged >= weekAgo)
  const stuckTopics = weekQs.filter(q => q.result === 'Stuck').map(q => q.topic)
  const topicCounts: Record<string, number> = {}
  for (const t of stuckTopics) topicCounts[t] = (topicCounts[t] ?? 0) + 1

  return `Generate a weekly digest for a LeetCode prep tracker. This week's data:
- Questions solved: ${weekQs.filter(q => q.result === 'Solved').length}
- Hint used: ${weekQs.filter(q => q.result === 'Hint').length}  
- Stuck: ${weekQs.filter(q => q.result === 'Stuck').length}
- Topics covered: ${[...new Set(weekQs.map(q => q.topic))].join(', ') || 'none'}
- Weakest topics (most stuck): ${Object.entries(topicCounts).sort((a,b) => b[1]-a[1]).slice(0,3).map(([t]) => t).join(', ') || 'none'}

Write a 3-sentence digest: what went well, where they struggled, and 3 specific NeetCode questions to focus on next week based on weak areas. Be direct and actionable.`
}
