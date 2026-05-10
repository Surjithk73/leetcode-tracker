import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { geminiChat, GeminiError, getModel } from '@/lib/gemini'
import { buildSystemPrompt } from '@/lib/aiContext'
import { parseAction, executeAction } from '@/lib/aiActions'
import { useQuestions } from '@/hooks/useQuestions'
import { useToast } from '@/hooks/useToast'
import ToastContainer from '@/components/ui/Toast'

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  actionResult?: string
  error?: boolean
  pending?: boolean
}

const DESTRUCTIVE_ACTIONS = new Set(['delete_question', 'full_replan'])

export default function AIChat() {
  const { questions, refetch } = useQuestions()
  const { toasts, toast, remove } = useToast()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hey! I'm your prep assistant. I can check your progress, log questions, mark revisions, and keep you on track. What's up?",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingAction, setPendingAction] = useState<{ action: ReturnType<typeof parseAction>['action']; msgId: string } | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Proactive nudge on load
  useEffect(() => {
    const hour = new Date().getHours()
    const today = new Date().toISOString().split('T')[0]
    const todayCount = questions.filter(q => q.date_logged === today).length
    const target = new Date() >= new Date('2026-12-01') && new Date() <= new Date('2026-12-31') ? 1 : 2
    if (hour >= 20 && todayCount < target && questions.length > 0) {
      setMessages(prev => [...prev, {
        id: 'nudge',
        role: 'assistant',
        text: `It's past 8 PM and you've only done ${todayCount}/${target} questions today. Still time to knock one out — even a quick Easy counts toward your streak! 🔥`,
      }])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions.length])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', text }
    const assistantId = crypto.randomUUID()
    setMessages(prev => [
      ...prev,
      userMsg,
      { id: assistantId, role: 'assistant', text: '', pending: true },
    ])
    setLoading(true)

    try {
      // Build conversation history for Gemini (exclude pending placeholder)
      const history = [...messages, userMsg]
        .filter(m => !m.pending)
        .map(m => ({
          role: m.role === 'user' ? 'user' as const : 'model' as const,
          text: m.role === 'user' ? m.text : m.text,
        }))

      // Prepend system prompt as first user turn
      const systemPrompt = buildSystemPrompt(questions)
      const fullHistory = [
        { role: 'user' as const, text: systemPrompt },
        { role: 'model' as const, text: 'Understood. I am your prep tracker assistant.' },
        ...history,
      ]

      const raw = await geminiChat(fullHistory)
      const { action, displayText } = parseAction(raw)

      if (action && DESTRUCTIVE_ACTIONS.has(action.type)) {
        // Ask for confirmation
        setMessages(prev => prev.map(m =>
          m.id === assistantId
            ? { ...m, text: displayText || `I'll ${action.type.replace('_', ' ')} — confirm?`, pending: false }
            : m
        ))
        setPendingAction({ action, msgId: assistantId })
      } else if (action) {
        // Execute immediately
        try {
          const result = await executeAction(action)
          toast(result)
          refetch()
          setMessages(prev => prev.map(m =>
            m.id === assistantId
              ? { ...m, text: displayText || 'Done!', actionResult: result, pending: false }
              : m
          ))
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Action failed'
          toast(msg, 'error')
          setMessages(prev => prev.map(m =>
            m.id === assistantId ? { ...m, text: displayText || msg, error: true, pending: false } : m
          ))
        }
      } else {
        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, text: displayText, pending: false } : m
        ))
      }
    } catch (e) {
      const msg = e instanceof GeminiError ? e.message : 'Something went wrong. Check your API key in Settings.'
      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, text: msg, error: true, pending: false } : m
      ))
    }

    setLoading(false)
  }

  async function confirmAction(confirmed: boolean) {
    if (!pendingAction) return
    if (confirmed && pendingAction.action) {
      try {
        const result = await executeAction(pendingAction.action)
        toast(result)
        refetch()
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(), role: 'assistant',
          text: result, actionResult: result,
        }])
      } catch (e) {
        toast(e instanceof Error ? e.message : 'Action failed', 'error')
      }
    } else {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(), role: 'assistant', text: 'Got it, cancelled.',
      }])
    }
    setPendingAction(null)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-3rem)] max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border shrink-0">
        <div className="w-8 h-8 rounded-full bg-chart-4/20 flex items-center justify-center">
          <Bot size={16} className="text-chart-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Prep Assistant</p>
          <p className="text-xs text-muted-foreground">{getModel()}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}>
            {/* Avatar */}
            <div className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5',
              msg.role === 'assistant' ? 'bg-chart-4/20' : 'bg-sidebar-primary/20'
            )}>
              {msg.role === 'assistant'
                ? <Bot size={14} className="text-chart-4" />
                : <User size={14} className="text-sidebar-primary" />
              }
            </div>

            {/* Bubble */}
            <div className={cn(
              'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
              msg.role === 'assistant'
                ? cn('bg-card border border-border text-foreground rounded-tl-sm',
                    msg.error && 'border-chart-5/40 bg-chart-5/5')
                : 'bg-sidebar-primary text-white rounded-tr-sm'
            )}>
              {msg.pending ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 size={14} className="animate-spin" />
                  <span>Thinking…</span>
                </div>
              ) : (
                <>
                  {msg.error && <AlertCircle size={14} className="text-chart-5 inline mr-1.5 mb-0.5" />}
                  <span className="whitespace-pre-wrap">{msg.text}</span>
                  {msg.actionResult && (
                    <div className="mt-2 pt-2 border-t border-border/50 text-xs text-chart-2">
                      {msg.actionResult}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}

        {/* Confirm/cancel buttons for destructive actions */}
        {pendingAction && (
          <div className="flex gap-2 pl-10">
            <button
              onClick={() => confirmAction(true)}
              className="px-4 py-2 rounded-lg bg-chart-5/10 border border-chart-5/40 text-chart-5 text-xs font-semibold hover:bg-chart-5/20 transition-colors"
            >
              Yes, confirm
            </button>
            <button
              onClick={() => confirmAction(false)}
              className="px-4 py-2 rounded-lg border border-border text-muted-foreground text-xs font-medium hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 pt-3 border-t border-border">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your progress, log a question, check revisions…"
            rows={1}
            className="flex-1 resize-none bg-input/20 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-sidebar-primary max-h-32 overflow-y-auto"
            style={{ fieldSizing: 'content' } as React.CSSProperties}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center text-white hover:opacity-90 transition-opacity disabled:opacity-40 shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Enter to send · Shift+Enter for new line
        </p>
      </div>

      <ToastContainer toasts={toasts} onRemove={remove} />
    </div>
  )
}
