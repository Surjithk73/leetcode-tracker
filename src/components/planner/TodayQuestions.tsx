import { CheckCircle, Circle, ExternalLink, Plus, Sparkles } from 'lucide-react'
import { toLeetCodeUrl, cn } from '@/lib/utils'
import { getQuestionBySlug } from '@/lib/questionPool'
import type { Question } from '@/types'

interface TodayQuestionsProps {
  assignedSlugs: string[]
  solvedQuestions: Question[]
  onLogQuestion: (slug: string) => void
  reasoning?: string
  loading?: boolean
}

export default function TodayQuestions({ assignedSlugs, solvedQuestions, onLogQuestion, reasoning, loading }: TodayQuestionsProps) {
  const today = new Date().toISOString().split('T')[0]
  const solvedToday = solvedQuestions.filter(q => q.date_logged === today)
  const solvedSlugs = new Set(solvedToday.map(q => q.slug).filter(Boolean))
  
  const questions = assignedSlugs.map(slug => {
    const masterQ = getQuestionBySlug(slug)
    const solved = solvedSlugs.has(slug)
    const solvedEntry = solvedToday.find(q => q.slug === slug)
    return { slug, masterQ, solved, result: solvedEntry?.result }
  }).filter(q => q.masterQ)
  
  const completedCount = questions.filter(q => q.solved).length
  const totalCount = questions.length
  
  if (loading) {
    return (
      <div className="bg-card border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          <p className="text-foreground font-medium">AI is planning your questions for today...</p>
        </div>
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-16 bg-muted/20 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }
  
  if (totalCount === 0) {
    return (
      <div className="bg-card border rounded-xl p-6 text-center">
        <Circle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
        <p className="text-muted-foreground">No questions assigned for today</p>
        <p className="text-xs text-muted-foreground mt-1">Check the Planner or log an unplanned question</p>
      </div>
    )
  }
  
  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg text-foreground">Today's Questions</h3>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">{Math.round((completedCount / totalCount) * 100)}%</div>
            <p className="text-xs text-muted-foreground">Progress</p>
          </div>
        </div>
        {reasoning && (
          <p className="text-sm text-muted-foreground italic">
            {reasoning}
          </p>
        )}
        <p className="text-sm text-muted-foreground mt-1">
          {completedCount} of {totalCount} completed
        </p>
      </div>
      
      {/* Question List */}
      <div className="divide-y divide-border">
        {questions.map(({ slug, masterQ, solved, result }) => {
          if (!masterQ) return null
          
          return (
            <div
              key={slug}
              className={cn(
                'px-6 py-4 flex items-center gap-4 transition-colors',
                solved ? 'bg-chart-2/5' : 'hover:bg-muted/10'
              )}
            >
              {/* Status Icon */}
              <div className="shrink-0">
                {solved ? (
                  <CheckCircle className="w-5 h-5 text-chart-2" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              
              {/* Question Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <a
                    href={toLeetCodeUrl(slug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1"
                  >
                    {masterQ.title}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-md font-medium',
                    masterQ.difficulty === 'Easy' && 'bg-chart-2/10 text-chart-2',
                    masterQ.difficulty === 'Medium' && 'bg-chart-3/10 text-chart-3',
                    masterQ.difficulty === 'Hard' && 'bg-chart-1/10 text-chart-1'
                  )}>
                    {masterQ.difficulty}
                  </span>
                  <span className="text-xs text-muted-foreground">{masterQ.topic}</span>
                </div>
              </div>
              
              {/* Action / Result */}
              <div className="shrink-0">
                {solved ? (
                  <span className={cn(
                    'text-xs px-3 py-1 rounded-md font-medium',
                    result === 'Solved' && 'bg-chart-2/10 text-chart-2',
                    result === 'Hint' && 'bg-chart-3/10 text-chart-3',
                    result === 'Stuck' && 'bg-chart-1/10 text-chart-1'
                  )}>
                    {result}
                  </span>
                ) : (
                  <button
                    onClick={() => onLogQuestion(slug)}
                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Log
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
