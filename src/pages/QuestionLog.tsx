import { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useQuestions } from '@/hooks/useQuestions'
import { useToast } from '@/hooks/useToast'
import { calcXP, calcNextReviewDate } from '@/lib/xp'
import QuestionModal from '@/components/questions/QuestionModal'
import QuestionFilters, { type Filters } from '@/components/questions/QuestionFilters'
import QuestionRow from '@/components/questions/QuestionRow'
import ToastContainer from '@/components/ui/Toast'
import type { Question } from '@/types'

export default function QuestionLog() {
  const { questions, loading, refetch } = useQuestions()
  const { toasts, toast, remove } = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Question | undefined>()
  const [filters, setFilters] = useState<Filters>({ topic: '', difficulty: '', result: '', search: '' })

  const filtered = useMemo(() => {
    return questions.filter(q => {
      if (filters.topic && q.topic !== filters.topic) return false
      if (filters.difficulty && q.difficulty !== filters.difficulty) return false
      if (filters.result && q.result !== filters.result) return false
      if (filters.search && !q.name.toLowerCase().includes(filters.search.toLowerCase())) return false
      return true
    })
  }, [questions, filters])

  function openAdd() { setEditing(undefined); setModalOpen(true) }
  function openEdit(q: Question) { setEditing(q); setModalOpen(true) }

  async function handleSave(data: Omit<Question, 'id' | 'xp_awarded' | 'touch_number' | 'next_review_date'>) {
    const xp = calcXP(data.difficulty, data.result)
    const next_review_date = calcNextReviewDate(data.date_logged, 1)

    if (editing?.id) {
      // Update — recalc XP but keep touch_number
      const { error } = await supabase
        .from('questions')
        .update({ ...data, xp_awarded: xp, next_review_date })
        .eq('id', editing.id)
      if (error) { toast(error.message, 'error'); return }
      toast('Question updated')
    } else {
      // Insert new
      const { error } = await supabase
        .from('questions')
        .insert({ ...data, touch_number: 1, xp_awarded: xp, next_review_date })
      if (error) { toast(error.message, 'error'); return }
      toast(`+${xp} XP — Question logged!`)
    }
    refetch()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this question log?')) return
    const { error } = await supabase.from('questions').delete().eq('id', id)
    if (error) { toast(error.message, 'error'); return }
    toast('Question deleted')
    refetch()
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Question Log</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {questions.length} question{questions.length !== 1 ? 's' : ''} logged
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-sidebar-primary text-sidebar-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Log Question</span>
        </button>
      </div>

      {/* Filters */}
      <QuestionFilters filters={filters} onChange={setFilters} />

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            {questions.length === 0 ? 'No questions logged yet. Hit "Log Question" to start.' : 'No questions match your filters.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {['Question', 'Difficulty', 'Topic', 'Result', 'Date', 'Touch', 'Next Review', 'Notes', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(q => (
                  <QuestionRow key={q.id} question={q} onEdit={openEdit} onDelete={handleDelete} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <QuestionModal
        open={modalOpen}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />

      <ToastContainer toasts={toasts} onRemove={remove} />
    </div>
  )
}
