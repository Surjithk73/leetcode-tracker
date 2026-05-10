import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Building2, RefreshCw, AlertCircle } from 'lucide-react'

const TREE_API = 'https://api.github.com/repos/snehasishroy/leetcode-companywise-interview-questions/git/trees/master?recursive=1'
const SESSION_KEY = 'lc_companies_list'

function formatSlug(slug: string): string {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function loadFromSession(): string[] | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveToSession(list: string[]) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(list)) } catch { /* ignore */ }
}

export default function Companies() {
  const [companies, setCompanies] = useState<string[]>(() => loadFromSession() ?? [])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(() => !loadFromSession())
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (loadFromSession()) return
    load()
  }, [])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(TREE_API)
      if (!res.ok) throw new Error(`GitHub API error ${res.status}`)
      const data = await res.json()
      const dirs: string[] = []
      const seen = new Set<string>()
      for (const item of data.tree ?? []) {
        if (item.type === 'tree' && !item.path.includes('/')) {
          const slug = item.path as string
          if (!seen.has(slug) && slug !== 'src') {
            seen.add(slug)
            dirs.push(slug)
          }
        }
      }
      dirs.sort()
      saveToSession(dirs)
      setCompanies(dirs)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load companies')
    }
    setLoading(false)
  }

  const filtered = companies.filter(c =>
    c.toLowerCase().includes(search.toLowerCase().trim())
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Companies</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Browse interview questions by company — sourced from GitHub
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-xl">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search companies… (e.g. google, amazon, meta)"
          className="w-full bg-input/20 border border-border rounded-xl pl-9 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-sidebar-primary"
        />
      </div>

      {/* States */}
      {loading && (
        <div className="flex items-center gap-3 text-muted-foreground text-sm py-8 justify-center">
          <RefreshCw size={16} className="animate-spin" />
          Loading company list from GitHub…
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-chart-5/30 bg-chart-5/5 p-4 flex items-start gap-3">
          <AlertCircle size={16} className="text-chart-5 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-foreground">{error}</p>
            <button onClick={load} className="text-xs text-sidebar-primary hover:underline mt-1">
              Retry
            </button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          <p className="text-xs text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? 'company' : 'companies'} {search ? 'match' : 'available'}
          </p>

          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No companies match "{search}"</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2">
              {filtered.map(slug => (
                <button
                  key={slug}
                  onClick={() => navigate(`/companies/${slug}`)}
                  className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-3 text-left hover:bg-muted/30 hover:border-sidebar-primary/40 transition-all group"
                >
                  <Building2 size={14} className="text-muted-foreground group-hover:text-sidebar-primary shrink-0 transition-colors" />
                  <span className="text-sm font-medium text-foreground truncate">{formatSlug(slug)}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
