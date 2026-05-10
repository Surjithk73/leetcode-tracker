import { useState } from 'react'
import { Layers, ArrowRight, RotateCcw, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'
import { useFlashcards } from '@/hooks/useFlashcards'
import { useToast } from '@/hooks/useToast'
import { toLeetCodeUrl, cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function Flashcards() {
  const { flashcards, loading, advanceFlashcard, rescheduleFlashcard, resetFlashcard } = useFlashcards()
  const { toast } = useToast()
  const [isReviewing, setIsReviewing] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showBack, setShowBack] = useState(false)
  const [sessionStats, setSessionStats] = useState({ gotIt: 0, shaky: 0, missed: 0 })
  
  const currentCard = flashcards[currentIndex]
  
  function startReview() {
    if (flashcards.length === 0) return
    setIsReviewing(true)
    setCurrentIndex(0)
    setShowBack(false)
    setSessionStats({ gotIt: 0, shaky: 0, missed: 0 })
  }
  
  async function handleResponse(type: 'gotIt' | 'shaky' | 'missed') {
    if (!currentCard) return
    
    try {
      if (type === 'gotIt') {
        await advanceFlashcard(currentCard)
        setSessionStats(s => ({ ...s, gotIt: s.gotIt + 1 }))
        toast('+5 XP', 'success')
      } else if (type === 'shaky') {
        await rescheduleFlashcard(currentCard)
        setSessionStats(s => ({ ...s, shaky: s.shaky + 1 }))
      } else {
        await resetFlashcard(currentCard)
        setSessionStats(s => ({ ...s, missed: s.missed + 1 }))
      }
      
      // Move to next card
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setShowBack(false)
      } else {
        // Session complete
        setIsReviewing(false)
      }
    } catch (err) {
      toast('Failed to update flashcard', 'error')
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading flashcards...</p>
      </div>
    )
  }
  
  if (isReviewing && currentCard) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center p-6">
        <div className="max-w-3xl w-full space-y-6">
          
          {/* Progress */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Card {currentIndex + 1} of {flashcards.length}
            </p>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
              />
            </div>
          </div>
          
          {/* Card */}
          <div className="bg-card border rounded-2xl p-8 min-h-[400px] flex flex-col justify-between">
            
            {/* Front */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={cn(
                  'text-xs px-3 py-1 rounded-full',
                  currentCard.type === 'question' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
                )}>
                  {currentCard.type === 'question' ? 'Question Note' : 'Code Snippet'}
                </span>
                <span className="text-xs text-muted-foreground">Touch {currentCard.touch_number}</span>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">{currentCard.front}</h2>
                {currentCard.type === 'question' && currentCard.metadata?.slug && (
                  <a
                    href={toLeetCodeUrl(currentCard.metadata.slug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    Open on LeetCode <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              
              {/* Back (revealed) */}
              {showBack && (
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {currentCard.back}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="mt-6">
              {!showBack ? (
                <button
                  onClick={() => setShowBack(true)}
                  className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-medium"
                >
                  Show Answer
                </button>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleResponse('missed')}
                    className="px-4 py-3 bg-chart-1/10 text-chart-1 rounded-xl hover:bg-chart-1/20 transition-colors font-medium"
                  >
                    Missed
                  </button>
                  <button
                    onClick={() => handleResponse('shaky')}
                    className="px-4 py-3 bg-chart-3/10 text-chart-3 rounded-xl hover:bg-chart-3/20 transition-colors font-medium"
                  >
                    Shaky
                  </button>
                  <button
                    onClick={() => handleResponse('gotIt')}
                    className="px-4 py-3 bg-chart-2/10 text-chart-2 rounded-xl hover:bg-chart-2/20 transition-colors font-medium"
                  >
                    Got It
                  </button>
                </div>
              )}
            </div>
            
          </div>
          
        </div>
      </div>
    )
  }
  
  if (!isReviewing && sessionStats.gotIt + sessionStats.shaky + sessionStats.missed > 0) {
    // Session complete summary
    const total = sessionStats.gotIt + sessionStats.shaky + sessionStats.missed
    const xpEarned = sessionStats.gotIt * 5
    
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center p-6">
        <div className="max-w-2xl w-full space-y-6 text-center">
          <div className="p-4 rounded-full bg-chart-2/10 w-20 h-20 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-chart-2" />
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Session Complete!</h2>
            <p className="text-muted-foreground">You reviewed {total} flashcard{total > 1 ? 's' : ''}</p>
          </div>
          
          <div className="bg-card border rounded-xl p-6 grid grid-cols-3 gap-4">
            <div>
              <p className="text-3xl font-bold text-chart-2">{sessionStats.gotIt}</p>
              <p className="text-sm text-muted-foreground">Got It</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-chart-3">{sessionStats.shaky}</p>
              <p className="text-sm text-muted-foreground">Shaky</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-chart-1">{sessionStats.missed}</p>
              <p className="text-sm text-muted-foreground">Missed</p>
            </div>
          </div>
          
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
            <p className="text-2xl font-bold text-primary">+{xpEarned} XP</p>
            <p className="text-sm text-muted-foreground">Earned this session</p>
          </div>
          
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen w-full bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Layers className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Flashcard Review</h1>
            <p className="text-muted-foreground text-sm mt-1">Spaced repetition for question notes and code snippets</p>
          </div>
        </div>
        
        {/* Queue Status */}
        <div className="bg-card border rounded-xl p-6">
          {flashcards.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-chart-2 mx-auto mb-4" />
              <p className="text-lg font-semibold text-foreground mb-2">All caught up!</p>
              <p className="text-sm text-muted-foreground">No flashcards due for review today</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-foreground">{flashcards.length}</p>
                  <p className="text-sm text-muted-foreground">Flashcard{flashcards.length > 1 ? 's' : ''} due today</p>
                </div>
                <button
                  onClick={startReview}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-medium flex items-center gap-2"
                >
                  Start Review <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <AlertCircle className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground">
                      {flashcards.filter(c => c.type === 'question').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Question Notes</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <RotateCcw className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground">
                      {flashcards.filter(c => c.type === 'snippet').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Code Snippets</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
      </div>
    </div>
  )
}
