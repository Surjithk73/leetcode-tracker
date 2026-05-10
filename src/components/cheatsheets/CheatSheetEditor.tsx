import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { X, Eye, Pencil, Save, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CheatSheet, Topic } from '@/types'

interface Props {
  topic: Topic
  sheet?: CheatSheet
  onClose: () => void
  onSave: (raw: string, formatted?: string) => Promise<void>
  onPolish: (raw: string) => Promise<string>
}

export default function CheatSheetEditor({ topic, sheet, onClose, onSave, onPolish }: Props) {
  const [mode, setMode] = useState<'edit' | 'view'>('edit')
  const [raw, setRaw] = useState(sheet?.raw_notes ?? '')
  const [formatted, setFormatted] = useState(sheet?.formatted_markdown ?? '')
  const [saving, setSaving] = useState(false)
  const [polishing, setPolishing] = useState(false)

  useEffect(() => {
    setRaw(sheet?.raw_notes ?? '')
    setFormatted(sheet?.formatted_markdown ?? '')
    setMode(sheet?.formatted_markdown ? 'view' : 'edit')
  }, [sheet])

  async function handleSave() {
    setSaving(true)
    await onSave(raw, formatted || undefined)
    setSaving(false)
  }

  async function handlePolish() {
    if (!raw.trim()) return
    setPolishing(true)
    try {
      const result = await onPolish(raw)
      setFormatted(result)
      await onSave(raw, result)
      setMode('view')
    } catch (_) { /* handled upstream */ }
    setPolishing(false)
  }

  const displayContent = mode === 'view' ? (formatted || raw) : raw

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
          <h2 className="text-base font-semibold text-foreground">{topic}</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Edit / View toggle */}
          <div className="flex bg-muted/30 rounded-lg p-0.5">
            <button
              onClick={() => setMode('edit')}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                mode === 'edit' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Pencil size={12} /> Edit
            </button>
            <button
              onClick={() => setMode('view')}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                mode === 'view' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Eye size={12} /> View
            </button>
          </div>

          <button
            onClick={handlePolish}
            disabled={polishing || !raw.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-chart-4/10 border border-chart-4/30 text-chart-4 text-xs font-semibold hover:bg-chart-4/20 transition-colors disabled:opacity-40"
          >
            <Sparkles size={13} className={polishing ? 'animate-spin' : ''} />
            {polishing ? 'Polishing…' : 'Polish with AI'}
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Save size={13} />
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {mode === 'edit' ? (
          <textarea
            value={raw}
            onChange={e => setRaw(e.target.value)}
            placeholder={`Write your ${topic} notes in markdown...\n\n## Key Patterns\n- Pattern 1\n\n## Time Complexities\n| Operation | Complexity |\n|-----------|------------|\n| ... | O(n) |`}
            className="w-full h-full resize-none bg-transparent px-6 py-5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none font-mono leading-relaxed"
          />
        ) : (
          <div className="h-full overflow-y-auto px-6 py-5">
            {displayContent ? (
              <div className="prose prose-invert prose-sm max-w-none
                prose-headings:text-foreground prose-headings:font-semibold
                prose-p:text-muted-foreground prose-p:leading-relaxed
                prose-code:text-chart-4 prose-code:bg-muted/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono
                prose-pre:bg-muted/30 prose-pre:border prose-pre:border-border prose-pre:rounded-xl
                prose-strong:text-foreground
                prose-li:text-muted-foreground
                prose-table:text-sm
                prose-th:text-foreground prose-th:font-semibold
                prose-td:text-muted-foreground
                prose-a:text-sidebar-primary
                prose-blockquote:border-sidebar-primary prose-blockquote:text-muted-foreground
              ">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {displayContent}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground text-sm">Nothing to preview yet. Switch to Edit and write some notes.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
