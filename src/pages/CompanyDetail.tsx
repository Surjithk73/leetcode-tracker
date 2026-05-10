import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Papa from 'papaparse'
import { ArrowLeft, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const BASE = 'https://raw.githubusercontent.com/snehasishroy/leetcode-companywise-interview-questions/master'

// Actual filenames in the repo
type TimeRange = 'thirty-days' | 'three-months' | 'six-months' | 'more-than-six-months' | 'all'
type DiffFilter = 'Easy' | 'Medium' | 'Hard' | ''
type SortKey = 'Frequency %' | 'Acceptance %' | 'Title'

interface Row {
  ID: string
  URL: string
  Title: string
  Difficulty: string
  'Acceptance %': string
  'Frequency %': string
}

const TABS: { key: TimeRange; label: string }[] = [
  { key: 'thirty-days',          label: 'Last 30 Days' },
  { key: 'three-months',         label: '3 Months' },
  { key: 'six-months',           label: '6 Months' },
  { key: 'more-than-six-months', label: '6+ Months' },
  { key: 'all',                  label: 'All Time' },
]

function formatSlug(slug: string) {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

const diffBadge: Record<string, string> = {
  Easy:   'text-chart-2 bg-chart-2/10 border-chart-2/30',
  Medium: 'text-chart-3 bg-chart-3/10 border-chart-3/30',
  Hard:   'text-chart-5 bg-chart-5/10 border-chart-5/30',
}

type TabStatus = 'idle' | 'loading' | 'ok' | 'empty' | 'unavailable' | 'error'

export default function CompanyDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<TimeRange>('all')
  const [tabStatus, setTabStatus] = useState<Record<TimeRange, TabStatus>>({
    'thirty-days': 'idle', 'three-months': 'idle', 'six-months': 'idle',
    'more-than-six-months': 'idle', 'all': 'idle',
  })
  // Cache per tab — persists for the lifetime of this component instance
  const cache = useRef<Partial<Record<TimeRange, Row[]>>>({})
  const [rows, setRows] = useState<Row[]>([])
  const [diffFilter, setDiffFilter] = useState<DiffFilter>('')
  const [sortKey, setSortKey] = useState<SortKey>('Frequency %')

  useEffect(() => {
    // Reset on company change
    cache.current = {}
    setTabStatus({ 'thirty-days': 'idle', 'three-months': 'idle', 'six-months': 'idle', 'more-than-six-months': 'idle', 'all': 'idle' })
    setRows([])
    setActiveTab('all')
    fetchTab('all')
  }, [slug])

  async function fetchTab(tab: TimeRange) {
    setActiveTab(tab)
    setDiffFilter('')

    // Serve from cache if available
    if (cache.current[tab]) {
      setRows(cache.current[tab]!)
      return
    }

    // Don't retry known-unavailable tabs
    if (tabStatus[tab] === 'unavailable') return

    setTabStatus(s => ({ ...s, [tab]: 'loading' }))
    setRows([])

    try {
      const url = `${BASE}/${slug}/${tab}.csv`
      const res = await fetch(url)

      if (res.status === 404) {
        setTabStatus(s => ({ ...s, [tab]: 'unavailable' }))
        return
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const text = await res.text()
      const parsed = Papa.parse<Row>(text, { header: true, skipEmptyLines: true })
      const data = parsed.data.filter(r => r.Title?.trim())

      if (data.length === 0) {
        setTabStatus(s => ({ ...s, [tab]: 'empty' }))
        return
      }

      cache.current[tab] = data
      setRows(data)
      setTabStatus(s => ({ ...s, [tab]: 'ok' }))
    } catch {
      setTabStatus(s => ({ ...s, [tab]: 'error' }))
    }
  }

  const filtered = rows
    .filter(r => !diffFilter || r.Difficulty === diffFilter)
    .sort((a, b) => {
      if (sortKey === 'Title') return a.Title.localeCompare(b.Title)
      const aVal = parseFloat(a[sortKey]) || 0
      const bVal = parseFloat(b[sortKey]) || 0
      return bVal - aVal
    })

  const status = tabStatus[activeTab]

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/companies')}
          className="w-9 h-9 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{formatSlug(slug ?? '')}</h1>
          <p className="text-muted-foreground text-sm">Interview questions by time range</p>
        </div>
      </div>

      {/* Time range tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {TABS.map(tab => {
          const s = tabStatus[tab.key]
          const isActive = activeTab === tab.key
          const isUnavailable = s === 'unavailable'
          return (
            <button
              key={tab.key}
              onClick={() => fetchTab(tab.key)}
              disabled={isUnavailable}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors shrink-0 border',
                isActive
                  ? 'bg-sidebar-primary border-sidebar-primary text-sidebar-primary-foreground'
                  : isUnavailable
                    ? 'border-border text-muted-foreground/30 cursor-not-allowed'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground'
              )}
            >
              {tab.label}
              {s === 'loading' && <RefreshCw size={11} className="inline ml-1.5 animate-spin" />}
            </button>
          )
        })}
      </div>

      {/* Filters — only when data is loaded */}
      {status === 'ok' && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1">
            {(['', 'Easy', 'Medium', 'Hard'] as DiffFilter[]).map(d => (
              <button
                key={d}
                onClick={() => setDiffFilter(d)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
                  diffFilter === d
                    ? d === 'Easy'   ? 'bg-chart-2/20 border-chart-2 text-chart-2'
                      : d === 'Medium' ? 'bg-chart-3/20 border-chart-3 text-chart-3'
                      : d === 'Hard'   ? 'bg-chart-5/20 border-chart-5 text-chart-5'
                      : 'bg-sidebar-primary/20 border-sidebar-primary text-sidebar-primary'
                    : 'border-border text-muted-foreground hover:border-muted-foreground'
                )}
              >{d || 'All'}</button>
            ))}
          </div>

          <select
            value={sortKey}
            onChange={e => setSortKey(e.target.value as SortKey)}
            className="bg-input/20 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-sidebar-primary"
          >
            <option value="Frequency %">Sort: Frequency ↓</option>
            <option value="Acceptance %">Sort: Acceptance ↓</option>
            <option value="Title">Sort: Title A–Z</option>
          </select>

          <span className="text-xs text-muted-foreground ml-auto">
            {filtered.length} of {rows.length} questions
          </span>
        </div>
      )}

      {/* States */}
      {status === 'loading' && (
        <div className="flex items-center gap-3 text-muted-foreground text-sm py-12 justify-center">
          <RefreshCw size={16} className="animate-spin" />
          Loading questions…
        </div>
      )}

      {(status === 'unavailable' || status === 'error') && (
        <div className="rounded-xl border border-chart-5/30 bg-chart-5/5 p-5 flex items-start gap-3">
          <AlertCircle size={16} className="text-chart-5 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-foreground">
              {status === 'unavailable'
                ? 'No data available for this time range.'
                : 'Failed to load — network error.'}
            </p>
            {status === 'error' && (
              <button onClick={() => {
                setTabStatus(s => ({ ...s, [activeTab]: 'idle' }))
                fetchTab(activeTab)
              }} className="text-xs text-sidebar-primary hover:underline mt-1">
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      {status === 'empty' && (
        <p className="text-sm text-muted-foreground py-8 text-center">No questions found for this time range.</p>
      )}

      {status === 'ok' && filtered.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {['#', 'Title', 'Difficulty', 'Acceptance', 'Frequency'].map(h => (
                      <th key={h} className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row, i) => (
                    <tr key={`${row.ID}-${i}`} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-xs text-muted-foreground w-10">{i + 1}</td>
                      <td className="px-4 py-3">
                        <a
                          href={row.URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm text-foreground hover:text-sidebar-primary hover:underline transition-colors group"
                        >
                          {row.Title}
                          <ExternalLink size={12} className="text-muted-foreground/50 group-hover:text-sidebar-primary shrink-0" />
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full border', diffBadge[row.Difficulty] ?? 'text-muted-foreground border-border')}>
                          {row.Difficulty}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{row['Acceptance %']}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{row['Frequency %']}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-2">
            {filtered.map((row, i) => (
              <div key={`${row.ID}-${i}`} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <a
                    href={row.URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-foreground hover:text-sidebar-primary hover:underline transition-colors flex items-center gap-1.5 flex-1 min-w-0"
                  >
                    <span className="truncate">{row.Title}</span>
                    <ExternalLink size={12} className="shrink-0 text-muted-foreground" />
                  </a>
                  <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full border shrink-0', diffBadge[row.Difficulty] ?? 'text-muted-foreground border-border')}>
                    {row.Difficulty}
                  </span>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>Acceptance: {row['Acceptance %']}</span>
                  <span>Frequency: {row['Frequency %']}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
