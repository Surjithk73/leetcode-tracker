import { geminiGenerate } from './gemini'
import { getMasterQuestionPool } from './questionPool'
import { supabase } from './supabase'
import type { Question, MasterQuestion } from '@/types'

interface DailyPlan {
  date: string
  assignedQuestions: string[] // Array of slugs
  reasoning: string
}

/**
 * AI-powered daily question planner
 * Analyzes progress, postponed questions, and prep timeline to decide today's questions
 */
export async function generateDailyQuestions(
  solvedQuestions: Question[],
  dailyTarget: number = 2
): Promise<DailyPlan> {
  const today = new Date().toISOString().split('T')[0]
  const masterPool = getMasterQuestionPool()
  
  // Get already solved slugs (filter out null/undefined)
  const solvedSlugs = new Set(
    solvedQuestions
      .map(q => q.slug)
      .filter((slug): slug is string => slug != null)
  )
  
  // Get questions due for revision today
  const revisionsToday = solvedQuestions.filter(q => 
    q.next_review_date === today && q.touch_number < 3
  )
  
  // Get postponed questions (assigned but not completed)
  const { data: planData } = await supabase
    .from('plan')
    .select('*')
    .lt('date', today)
    .order('date', { ascending: false })
    .limit(7)
  
  const postponedSlugs = new Set<string>()
  if (planData) {
    for (const day of planData) {
      const assigned = day.assigned_questions || []
      for (const slug of assigned) {
        if (!solvedSlugs.has(slug)) {
          postponedSlugs.add(slug)
        }
      }
    }
  }
  
  // Calculate prep phase
  const prepEnd = new Date('2026-07-01')
  const examStart = new Date('2026-12-01')  // placeholder — update in Settings when known
  const examEnd = new Date('2026-12-31')    // placeholder — update in Settings when known
  const now = new Date()
  
  let phase = 'Pre-Exam Prep'
  if (now >= examStart && now <= examEnd) phase = 'Exam Mode'
  else if (now > examEnd) phase = 'Holiday Sprint'
  
  const daysRemaining = Math.ceil((prepEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const totalQuestions = masterPool.length
  const solvedCount = solvedSlugs.size
  const remainingCount = totalQuestions - solvedCount
  
  // Get topic progress
  const topicProgress: Record<string, { solved: number; total: number }> = {}
  const topics = ['Arrays', 'Strings', 'HashMaps', 'Two Pointers', 'Sliding Window', 
    'Binary Search', 'Linked Lists', 'Stacks', 'Queues', 'Trees', 'Heaps', 'Graphs', 
    'Backtracking', 'Dynamic Programming', 'Tries', 'Intervals', 'Greedy', 'Bit Manipulation']
  
  for (const topic of topics) {
    const topicQuestions = masterPool.filter(q => q.topic === topic)
    const topicSolved = topicQuestions.filter(q => solvedSlugs.has(q.slug)).length
    topicProgress[topic] = { solved: topicSolved, total: topicQuestions.length }
  }
  
  // Find current topic (first topic not fully completed)
  let currentTopic = 'Arrays'
  for (const topic of topics) {
    if (topicProgress[topic].solved < topicProgress[topic].total) {
      currentTopic = topic
      break
    }
  }
  
  // Get recent performance
  const recentQuestions = solvedQuestions
    .sort((a, b) => new Date(b.date_logged).getTime() - new Date(a.date_logged).getTime())
    .slice(0, 10)
  
  const recentResults = {
    solved: recentQuestions.filter(q => q.result === 'Solved').length,
    hint: recentQuestions.filter(q => q.result === 'Hint').length,
    stuck: recentQuestions.filter(q => q.result === 'Stuck').length,
  }
  
  // Build AI prompt
  const prompt = `You are an AI study planner for LeetCode preparation. Analyze the user's progress and decide which ${dailyTarget} questions they should solve TODAY.

**Current Date:** ${today}
**Prep Phase:** ${phase}
**Days Remaining:** ${daysRemaining} days until July 1, 2026

**Overall Progress:**
- Total Questions: ${totalQuestions}
- Solved: ${solvedCount} (${Math.round((solvedCount / totalQuestions) * 100)}%)
- Remaining: ${remainingCount}

**Current Topic:** ${currentTopic}
**Topic Progress:**
${Object.entries(topicProgress).map(([topic, prog]) => 
  `- ${topic}: ${prog.solved}/${prog.total} (${Math.round((prog.solved / prog.total) * 100)}%)`
).join('\n')}

**Postponed Questions:** ${postponedSlugs.size} questions from previous days not yet completed
**Revisions Due Today:** ${revisionsToday.length} questions need review

**Recent Performance (last 10 questions):**
- Solved: ${recentResults.solved}
- Hint: ${recentResults.hint}
- Stuck: ${recentResults.stuck}

**Available Questions in ${currentTopic}:**
${masterPool
  .filter(q => q.topic === currentTopic && !solvedSlugs.has(q.slug))
  .slice(0, 10)
  .map(q => `- ${q.title} (${q.difficulty}) [slug: ${q.slug}]`)
  .join('\n')}

**Postponed Questions (if any):**
${Array.from(postponedSlugs).slice(0, 5).map(slug => {
  const q = masterPool.find(mq => mq.slug === slug)
  return q ? `- ${q.title} (${q.difficulty}) [slug: ${slug}]` : ''
}).filter(Boolean).join('\n') || 'None'}

**RULES:**
1. Prioritize postponed questions if there are any (catch up on missed work)
2. If no postponed questions, assign new questions from the current topic (${currentTopic})
3. Maintain topic order - don't skip ahead to later topics
4. Consider difficulty progression - mix Easy/Medium based on recent performance
5. If user is struggling (many Stuck results), assign easier questions
6. Return EXACTLY ${dailyTarget} question slugs

**OUTPUT FORMAT (JSON only, no markdown):**
{
  "slugs": ["question-slug-1", "question-slug-2"],
  "reasoning": "Brief explanation of why these questions were chosen (2-3 sentences)"
}

Respond with ONLY the JSON object, no other text.`

  try {
    const response = await geminiGenerate(prompt)
    
    // Parse AI response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('AI response not in expected format')
    }
    
    const parsed = JSON.parse(jsonMatch[0])
    const slugs = parsed.slugs || []
    const reasoning = parsed.reasoning || 'Questions selected based on current progress.'
    
    // Validate slugs exist in master pool
    const validSlugs = slugs.filter((slug: string) => 
      masterPool.some(q => q.slug === slug)
    )
    
    // If AI didn't return enough valid slugs, fallback to simple selection
    if (validSlugs.length < dailyTarget) {
      console.warn('AI returned insufficient valid slugs, using fallback')
      return fallbackSelection(masterPool, solvedSlugs, postponedSlugs, dailyTarget, today)
    }
    
    return {
      date: today,
      assignedQuestions: validSlugs.slice(0, dailyTarget),
      reasoning
    }
  } catch (error) {
    console.error('AI planning error:', error)
    // Fallback to rule-based selection
    return fallbackSelection(masterPool, solvedSlugs, postponedSlugs, dailyTarget, today)
  }
}

/**
 * Fallback selection when AI fails
 */
function fallbackSelection(
  masterPool: MasterQuestion[],
  solvedSlugs: Set<string>,
  postponedSlugs: Set<string>,
  dailyTarget: number,
  today: string
): DailyPlan {
  const selected: string[] = []
  
  // First, try to add postponed questions
  const postponedArray = Array.from(postponedSlugs)
  for (let i = 0; i < Math.min(dailyTarget, postponedArray.length); i++) {
    selected.push(postponedArray[i])
  }
  
  // If we need more, add new questions from the first incomplete topic
  if (selected.length < dailyTarget) {
    const topics = ['Arrays', 'Strings', 'HashMaps', 'Two Pointers', 'Sliding Window', 
      'Binary Search', 'Linked Lists', 'Stacks', 'Queues', 'Trees', 'Heaps', 'Graphs', 
      'Backtracking', 'Dynamic Programming', 'Tries', 'Intervals', 'Greedy', 'Bit Manipulation']
    
    for (const topic of topics) {
      const topicQuestions = masterPool
        .filter(q => q.topic === topic && !solvedSlugs.has(q.slug) && !selected.includes(q.slug))
        .sort((a, b) => a.order - b.order)
      
      for (const q of topicQuestions) {
        if (selected.length >= dailyTarget) break
        selected.push(q.slug)
      }
      
      if (selected.length >= dailyTarget) break
    }
  }
  
  return {
    date: today,
    assignedQuestions: selected.slice(0, dailyTarget),
    reasoning: postponedSlugs.size > 0 
      ? 'Catching up on postponed questions from previous days.'
      : 'Continuing with the next questions in topic order.'
  }
}

/**
 * Save daily plan to database
 */
export async function saveDailyPlan(plan: DailyPlan): Promise<void> {
  const { error } = await supabase
    .from('plan')
    .upsert({
      date: plan.date,
      assigned_questions: plan.assignedQuestions,
      revision_items: [],
      status: 'On Track',
      manually_modified: false
    }, {
      onConflict: 'user_id,date'
    })
  
  if (error) {
    console.error('Error saving daily plan:', error)
    throw error
  }
}

/**
 * Get today's plan from database, or generate if not exists
 */
export async function getTodaysPlan(
  solvedQuestions: Question[],
  dailyTarget: number = 2
): Promise<DailyPlan> {
  const today = new Date().toISOString().split('T')[0]
  
  // Check if plan already exists for today
  const { data: existingPlan } = await supabase
    .from('plan')
    .select('*')
    .eq('date', today)
    .single()
  
  if (existingPlan && existingPlan.assigned_questions?.length > 0) {
    return {
      date: today,
      assignedQuestions: existingPlan.assigned_questions,
      reasoning: 'Plan already generated for today'
    }
  }
  
  // Generate new plan
  const plan = await generateDailyQuestions(solvedQuestions, dailyTarget)
  await saveDailyPlan(plan)
  
  return plan
}
