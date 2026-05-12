import { useEffect, useRef, useState, useMemo } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  CheckCircleIcon, PlusCircleIcon, TrendingUp, Target,
  Calendar, Award, Flame, BookOpen, AlertCircle, MessageSquare,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQuestions } from '@/hooks/useQuestions'
import { useBadges } from '@/hooks/useBadges'
import { useDailyPlan } from '@/hooks/useDailyPlan'
import { getTodaysPlan } from '@/lib/aiPlanner'
import { calcTotalXP, calcStreak } from '@/lib/xp'
import { getLevelFromXP, getLevelName, PREP_START, PREP_END } from '@/types'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/Progress'
import RevisionPanel from '@/components/revision/RevisionPanel'
import DailyBriefing from '@/components/ai/DailyBriefing'
import WeeklyDigest from '@/components/ai/WeeklyDigest'
import BadgeUnlock from '@/components/gamification/BadgeUnlock'
import LevelUp from '@/components/gamification/LevelUp'
import TodayQuestions from '@/components/planner/TodayQuestions'
import QuestionModal from '@/components/questions/QuestionModal'
import ToastContainer from '@/components/ui/Toast'
import { getQuestionBySlug, getMasterQuestionPool } from '@/lib/questionPool'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'
import type { Question } from '@/types'

function getDayNumber() {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const start = new Date(PREP_START); start.setHours(0, 0, 0, 0)
  return Math.max(1, Math.floor((today.getTime() - start.getTime()) / 86400000) + 1)
}
function getTotalDays() {
  return Math.floor((PREP_END.getTime() - PREP_START.getTime()) / 86400000)
}
function getCurrentPhase() {
  return { label: 'Pre-Exam Prep', color: 'text-chart-1' }
}
function getDailyTarget(solvedCount: number, totalCount: number) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const prepEnd = new Date(PREP_END)
  prepEnd.setHours(0, 0, 0, 0)
  const daysLeft = Math.max(1, Math.ceil((prepEnd.getTime() - today.getTime()) / 86400000))
  const remaining = Math.max(0, totalCount - solvedCount)
  // Sundays are rest days (~7 per 52 days), so effective working days ≈ daysLeft * 6/7
  const workingDaysLeft = Math.max(1, Math.round(daysLeft * (6 / 7)))
  return Math.max(2, Math.ceil(remaining / workingDaysLeft))
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } }),
}

export default function Dashboard() {
  const { questions, loading, refetch } = useQuestions()
  const { badges, newBadges, dismissNew } = useBadges(questions)
  const { todayPlan, loading: planLoading } = useDailyPlan()
  const [planReasoning, setPlanReasoning] = useState<string>('')
  const [generatingPlan, setGeneratingPlan] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalInitial, setModalInitial] = useState<Partial<Question> | undefined>(undefined)
  // Optimistic set of slugs logged today — updates immediately on save without waiting for refetch
  const [optimisticSolvedSlugs, setOptimisticSolvedSlugs] = useState<Set<string>>(new Set())
  const { toasts, toast, remove } = useToast()
  const today = new Date().toISOString().split('T')[0]
  const totalXP = calcTotalXP(questions)
  const streak = calcStreak(questions)
  const level = getLevelFromXP(totalXP)
  const levelName = getLevelName(totalXP)
  const xpIntoLevel = totalXP % 100
  const dayNum = getDayNumber()
  const totalDays = getTotalDays()
  const phase = getCurrentPhase()

  // Master pool size for target calculation — computed once, stable
  const masterPoolSize = useMemo(() => getMasterQuestionPool().length, [])
  const dailyTarget = getDailyTarget(questions.length, masterPoolSize)

  const avgPerDay = dayNum > 0 ? Math.round(questions.length / dayNum) : 0
  const dueRevisions = questions.filter(q =>
    q.next_review_date && q.next_review_date <= today && q.touch_number < 3
  )
  const earnedBadges = badges.filter(b => b.earned)

  // Merge DB questions with optimistic slugs for TodayQuestions display
  const questionsForToday = useMemo(() => {
    if (optimisticSolvedSlugs.size === 0) return questions
    // Inject synthetic solved entries for optimistically logged slugs not yet in DB response
    const existingSlugs = new Set(questions.map(q => q.slug).filter(Boolean))
    const synthetic: Question[] = []
    for (const slug of optimisticSolvedSlugs) {
      if (!existingSlugs.has(slug)) {
        const masterQ = getQuestionBySlug(slug)
        if (masterQ) {
          synthetic.push({
            id: `optimistic_${slug}`,
            name: masterQ.title,
            slug,
            difficulty: masterQ.difficulty,
            topic: masterQ.topic,
            result: 'Solved',
            date_logged: today,
            touch_number: 1,
            next_review_date: null,
            notes: null,
            xp_awarded: 0,
          })
        }
      }
    }
    return [...questions, ...synthetic]
  }, [questions, optimisticSolvedSlugs, today])

  // Level-up detection
  const prevLevelRef = useRef(level)
  const [levelUpData, setLevelUpData] = useState<{ level: number; name: string } | null>(null)
  useEffect(() => {
    if (questions.length === 0) return
    if (level > prevLevelRef.current) setLevelUpData({ level, name: levelName })
    prevLevelRef.current = level
  }, [level, levelName, questions.length])

  // AI Plan Generation
  useEffect(() => {
    async function generatePlanIfNeeded() {
      // Wait for initial data to load
      if (loading || planLoading) return
      
      // Check if we have a plan for today
      if (!todayPlan || !todayPlan.assigned_questions || todayPlan.assigned_questions.length === 0) {
        setGeneratingPlan(true)
        try {
          // Generate plan even if no questions solved yet (first day)
          const plan = await getTodaysPlan(questions, dailyTarget)
          setPlanReasoning(plan.reasoning)
          // Refetch to get the saved plan
          window.location.reload() // Simple reload to refresh all data
        } catch (error) {
          console.error('Failed to generate plan:', error)
        } finally {
          setGeneratingPlan(false)
        }
      }
    }
    
    generatePlanIfNeeded()
  }, [loading, planLoading, questions, todayPlan, dailyTarget])

  const dateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  // Handle logging a question from TodayQuestions
  function handleLogQuestion(slug: string) {
    const masterQ = getQuestionBySlug(slug)
    if (!masterQ) {
      toast('Question not found', 'error')
      return
    }
    
    // Pre-fill modal with master question data
    setModalInitial({
      name: masterQ.title,
      slug: masterQ.slug,
      topic: masterQ.topic,
      difficulty: masterQ.difficulty,
      date_logged: today,
      result: 'Solved', // Default to Solved
      notes: null,
    })
    setModalOpen(true)
  }

  // Save question from modal
  async function handleSaveQuestion(data: Omit<Question, 'id' | 'xp_awarded' | 'touch_number' | 'next_review_date'>) {
    try {
      let xp = 0
      if (data.result === 'Solved') {
        xp = data.difficulty === 'Easy' ? 10 : data.difficulty === 'Medium' ? 20 : 30
      } else if (data.result === 'Hint') {
        xp = data.difficulty === 'Easy' ? 5 : data.difficulty === 'Medium' ? 10 : 15
      }
      
      const flashcardTouch = data.notes ? 1 : null
      const flashcardNextReview = data.notes 
        ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : null
      
      const { error } = await supabase.from('questions').insert({
        ...data,
        xp_awarded: xp,
        touch_number: 1,
        next_review_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        flashcard_touch: flashcardTouch,
        flashcard_next_review: flashcardNextReview,
      })
      
      if (error) throw error

      // Optimistically mark this slug as solved so TodayQuestions updates instantly
      if (data.slug) {
        setOptimisticSolvedSlugs(prev => new Set([...prev, data.slug!]))
      }
      
      toast('Question logged successfully!', 'success')
      setModalOpen(false)
      setModalInitial(undefined)
      // Refetch in background — UI already updated optimistically
      refetch()
    } catch (error) {
      console.error('Error saving question:', error)
      toast('Failed to log question', 'error')
    }
  }

  return (
    <>
      <div className="min-h-screen w-full bg-background p-0">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="flex items-baseline gap-3">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Your Progress Dashboard</h1>
              <span className={cn('text-sm font-medium', phase.color)}>{phase.label}</span>
            </div>
            <p className="text-muted-foreground mt-1">{dateString}</p>
          </motion.div>

          {/* Daily Briefing AI card */}
          <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible">
            <DailyBriefing questions={questions} />
          </motion.div>

          {/* Key Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Target, color: 'text-blue-400', bg: 'bg-blue-500/10',
                label: 'Journey',
                value: `Day ${dayNum}`,
                progress: (dayNum / totalDays) * 100,
                sub: `${dayNum} of ${totalDays} days`,
              },
              {
                icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10',
                label: 'Level',
                value: `Lv.${level} — ${levelName}`,
                progress: xpIntoLevel,
                sub: `${xpIntoLevel}/100 XP to next level`,
              },
              {
                icon: Award, color: 'text-chart-2', bg: 'bg-chart-2/10',
                label: 'Experience',
                value: `${totalXP.toLocaleString()} XP`,
                progress: null,
                sub: `${earnedBadges.length} badges earned`,
              },
              {
                icon: Flame, color: 'text-chart-1', bg: 'bg-chart-1/10',
                label: 'Streak',
                value: `${streak} days`,
                progress: null,
                sub: `Keep it going 🔥`,
              },
            ].map(({ icon: Icon, color, bg, label, value, progress, sub }, i) => (
              <motion.div key={label} custom={i + 1} variants={cardVariants} initial="hidden" animate="visible">
                <div className="bg-card text-card-foreground flex flex-col gap-3 rounded-xl border py-5 px-5 shadow-sm h-full">
                  <div className="flex items-center gap-3">
                    <div className={cn('p-2 rounded-lg', bg)}>
                      <Icon className={cn('w-5 h-5', color)} />
                    </div>
                    <span className="text-sm text-muted-foreground">{label}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-semibold text-foreground leading-tight">{loading ? '—' : value}</div>
                    {progress !== null && <Progress value={loading ? 0 : progress} />}
                    <p className="text-xs text-muted-foreground">{sub}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Today's Questions (AI-Powered) */}
          <motion.div custom={5} variants={cardVariants} initial="hidden" animate="visible">
            <TodayQuestions
              assignedSlugs={todayPlan?.assigned_questions || []}
              solvedQuestions={questionsForToday}
              onLogQuestion={handleLogQuestion}
              reasoning={planReasoning}
              loading={generatingPlan || planLoading}
            />
          </motion.div>

          {/* Total Work */}
          <motion.div custom={6} variants={cardVariants} initial="hidden" animate="visible">
              <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm h-full">
                <div className="px-6 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-2/10">
                    <BookOpen className="w-5 h-5 text-chart-2" />
                  </div>
                  <div>
                    <p className="font-semibold leading-none">Total Work Completed</p>
                    <p className="text-muted-foreground text-sm mt-1">Your overall progress</p>
                  </div>
                </div>
                <div className="px-6 space-y-4">
                  <div>
                    <div className="text-4xl font-bold text-foreground">{loading ? '—' : questions.length}</div>
                    <p className="text-sm text-muted-foreground mt-1">Total questions logged</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <div className="text-xl font-semibold text-foreground">{loading ? '—' : avgPerDay}</div>
                      <p className="text-xs text-muted-foreground">Avg per day</p>
                    </div>
                    <div>
                      <div className="text-xl font-semibold text-foreground">{dayNum}</div>
                      <p className="text-xs text-muted-foreground">Active days</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

          {/* Pending Reviews */}
          <motion.div custom={7} variants={cardVariants} initial="hidden" animate="visible">
            <div className={cn(
              'bg-card text-card-foreground flex flex-col gap-0 rounded-xl border shadow-sm overflow-hidden',
              dueRevisions.length === 0 ? 'border-chart-2/20' : 'border-chart-3/20'
            )}>
              {/* Status banner */}
              <div className={cn(
                'flex items-center gap-4 px-6 py-5',
                dueRevisions.length === 0 ? 'bg-chart-2/5' : 'bg-chart-3/5'
              )}>
                <div className={cn('p-3 rounded-full', dueRevisions.length === 0 ? 'bg-chart-2/10' : 'bg-chart-3/10')}>
                  {dueRevisions.length === 0
                    ? <CheckCircleIcon className="w-6 h-6 text-chart-2" />
                    : <AlertCircle className="w-6 h-6 text-chart-3" />
                  }
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground">
                    {dueRevisions.length === 0 ? 'No Pending Reviews' : `${dueRevisions.length} Review${dueRevisions.length > 1 ? 's' : ''} Due`}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {dueRevisions.length === 0
                      ? "You're all caught up! No reviews are due today."
                      : `You have ${dueRevisions.length} question${dueRevisions.length > 1 ? 's' : ''} due for spaced repetition today.`
                    }
                  </p>
                </div>
              </div>
              {/* Revision list */}
              {dueRevisions.length > 0 && (
                <div className="px-6 pb-5 pt-2">
                  <RevisionPanel questions={questions} onUpdate={refetch} compact />
                </div>
              )}
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div custom={8} variants={cardVariants} initial="hidden" animate="visible">
            <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm">
              <div className="px-6 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-chart-4/10">
                  <Award className="w-5 h-5 text-chart-4" />
                </div>
                <div>
                  <p className="font-semibold leading-none">Achievements & Milestones</p>
                  <p className="text-muted-foreground text-sm mt-1">{earnedBadges.length} of {badges.length} badges earned</p>
                </div>
              </div>
              <div className="px-6">
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-3">
                  {badges.map(b => (
                    <div
                      key={b.key}
                      title={`${b.label} — ${b.description}`}
                      className={cn(
                        'flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-default',
                        b.earned
                          ? 'bg-chart-4/5 border-chart-4/20 hover:border-chart-4/40'
                          : 'bg-muted/10 border-border opacity-35'
                      )}
                    >
                      <div className="text-2xl mb-1">{b.icon}</div>
                      <p className="text-xs text-center font-medium text-foreground leading-tight line-clamp-2">{b.label}</p>
                      {!b.earned && <p className="text-xs text-muted-foreground mt-0.5">Locked</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Weekly Digest */}
          <motion.div custom={9} variants={cardVariants} initial="hidden" animate="visible">
            <WeeklyDigest questions={questions} />
          </motion.div>

          {/* Action Buttons */}
          <motion.div custom={10} variants={cardVariants} initial="hidden" animate="visible">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link to="/log"
                className="flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-medium">
                <PlusCircleIcon className="w-5 h-5" />
                Log Question
              </Link>
              <Link to="/planner"
                className="flex items-center justify-center gap-2 px-6 py-4 bg-card border border-border text-foreground rounded-xl hover:bg-accent transition-colors font-medium">
                <Calendar className="w-5 h-5" />
                View Planner
              </Link>
              <Link to="/chat"
                className="flex items-center justify-center gap-2 px-6 py-4 bg-card border border-border text-foreground rounded-xl hover:bg-accent transition-colors font-medium">
                <MessageSquare className="w-5 h-5" />
                Open AI Chat
              </Link>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Overlays */}
      <AnimatePresence>
        {newBadges.length > 0 && <BadgeUnlock badges={newBadges} onDismiss={dismissNew} />}
      </AnimatePresence>
      {levelUpData && (
        <LevelUp level={levelUpData.level} levelName={levelUpData.name} onDismiss={() => setLevelUpData(null)} />
      )}
      
      {/* Question Logging Modal */}
      <QuestionModal
        open={modalOpen}
        initial={modalInitial}
        onClose={() => {
          setModalOpen(false)
          setModalInitial(undefined)
        }}
        onSave={handleSaveQuestion}
      />
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={remove} />
    </>
  )
}
