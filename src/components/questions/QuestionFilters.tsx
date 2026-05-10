import { TOPICS, DIFFICULTIES, RESULTS } from '@/types'
import type { Difficulty, Result, Topic } from '@/types'
import { cn } from '@/lib/utils'

export interface Filters {
  topic: Topic | ''
  difficulty: Difficulty | ''
  result: Result | ''
  search: string
}

interface Props {
  filters: Filters
  onChange: (f: Filters) => void
}

export default function QuestionFilters({ filters, onChange }: Props) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch })

  return (
    <div className="flex flex-wrap gap-2">
      <input
        value={filters.search}
        onChange={e => set({ search: e.target.value })}
        placeholder="Search questions…"
        className="bg-input/20 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-sidebar-primary w-48"
      />

      <select
        value={filters.topic}
        onChange={e => set({ topic: e.target.value as Topic | '' })}
        className={cn('bg-input/20 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sidebar-primary', filters.topic ? 'text-foreground' : 'text-muted-foreground')}
      >
        <option value="">All Topics</option>
        {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
      </select>

      <select
        value={filters.difficulty}
        onChange={e => set({ difficulty: e.target.value as Difficulty | '' })}
        className={cn('bg-input/20 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sidebar-primary', filters.difficulty ? 'text-foreground' : 'text-muted-foreground')}
      >
        <option value="">All Difficulties</option>
        {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
      </select>

      <select
        value={filters.result}
        onChange={e => set({ result: e.target.value as Result | '' })}
        className={cn('bg-input/20 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sidebar-primary', filters.result ? 'text-foreground' : 'text-muted-foreground')}
      >
        <option value="">All Results</option>
        {RESULTS.map(r => <option key={r} value={r}>{r}</option>)}
      </select>

      {(filters.topic || filters.difficulty || filters.result || filters.search) && (
        <button
          onClick={() => onChange({ topic: '', difficulty: '', result: '', search: '' })}
          className="px-3 py-2 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  )
}
