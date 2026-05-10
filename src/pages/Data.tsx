import { useState, useMemo } from 'react'
import { Database, Filter } from 'lucide-react'
import { getMasterQuestionPool, getQuestionsBySource } from '@/lib/questionPool'
import { useQuestions } from '@/hooks/useQuestions'
import { toLeetCodeUrl, cn } from '@/lib/utils'

type TabType = 'all' | 'neetcode' | 'striver'

export default function Data() {
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [topicFilter, setTopicFilter] = useState<string>('All')
  const [difficultyFilter, setDifficultyFilter] = useState<Set<string>>(new Set())
  const [sourceFilter, setSourceFilter] = useState<string>('All')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  
  const { questions: solvedQuestions } = useQuestions()
  
  const allQuestions = useMemo(() => getMasterQuestionPool(), [])
  const neetcodeQuestions = useMemo(() => getQuestionsBySource('neetcode'), [])
  const striverQuestions = useMemo(() => getQuestionsBySource('striver'), [])
  
  const currentPool = activeTab === 'all' ? allQuestions : activeTab === 'neetcode' ? neetcodeQuestions : striverQuestions
  
  const solvedSlugs = useMemo(() => new Set(solvedQuestions.map(q => q.slug).filter(Boolean)), [solvedQuestions])
  
  const filteredQuestions = useMemo(() => {
    return currentPool.filter(q => {
      if (topicFilter !== 'All' && q.topic !== topicFilter) return false
      if (difficultyFilter.size > 0 && !difficultyFilter.has(q.difficulty)) return false
      if (sourceFilter !== 'All') {
        if (sourceFilter === 'Both' && q.source.length !== 2) return false
        if (sourceFilter === 'NeetCode' && !q.source.includes('neetcode')) return false
        if (sourceFilter === 'Striver' && !q.source.includes('striver')) return false
      }
      if (statusFilter !== 'All') {
        const isCompleted = solvedSlugs.has(q.slug)
        if (statusFilter === 'Completed' && !isCompleted) return false
        if (statusFilter === 'Pending' && isCompleted) return false
      }
      return true
    })
  }, [currentPool, topicFilter, difficultyFilter, sourceFilter, statusFilter, solvedSlugs])
  
  const completedCount = currentPool.filter(q => solvedSlugs.has(q.slug)).length
  const totalCount = currentPool.length
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  
  const topics = ['Arrays', 'Strings', 'HashMaps', 'Two Pointers', 'Sliding Window', 'Binary Search', 'Linked Lists', 'Stacks', 'Queues', 'Trees', 'Heaps', 'Graphs', 'Backtracking', 'Dynamic Programming', 'Tries', 'Intervals', 'Greedy', 'Bit Manipulation']
  
  return (
    <div className="min-h-screen w-full bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Database className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Question Data</h1>
            <p className="text-muted-foreground text-sm mt-1">Master question pool from NeetCode 150 and Striver's SDE Sheet</p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          {[
            { key: 'all', label: 'All Questions' },
            { key: 'neetcode', label: 'NeetCode 150' },
            { key: 'striver', label: "Striver's SDE Sheet" },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={cn(
                'px-4 py-2 font-medium text-sm transition-colors border-b-2',
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Summary Bar */}
        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Progress</p>
              <p className="text-2xl font-bold text-foreground">
                {completedCount} <span className="text-muted-foreground text-lg">of {totalCount}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-chart-2">{completionPercent}%</p>
              <p className="text-xs text-muted-foreground">Complete</p>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Filters</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <select
              value={topicFilter}
              onChange={e => setTopicFilter(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground"
            >
              <option value="All">All Topics</option>
              {topics.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            {/* Multi-select difficulty toggles */}
            <div className="flex items-center gap-1.5">
              {(['Easy', 'Medium', 'Hard'] as const).map(d => {
                const active = difficultyFilter.has(d)
                return (
                  <button
                    key={d}
                    onClick={() => {
                      setDifficultyFilter(prev => {
                        const next = new Set(prev)
                        next.has(d) ? next.delete(d) : next.add(d)
                        return next
                      })
                    }}
                    className={cn(
                      'flex-1 px-3 py-2 rounded-lg text-xs font-semibold border transition-all',
                      active && d === 'Easy'   && 'bg-chart-2/20 border-chart-2 text-chart-2',
                      active && d === 'Medium' && 'bg-chart-3/20 border-chart-3 text-chart-3',
                      active && d === 'Hard'   && 'bg-chart-1/20 border-chart-1 text-chart-1',
                      !active && 'border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground bg-background'
                    )}
                  >
                    {d}
                  </button>
                )
              })}
            </div>
            
            {activeTab === 'all' && (
              <select
                value={sourceFilter}
                onChange={e => setSourceFilter(e.target.value)}
                className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground"
              >
                <option value="All">All Sources</option>
                <option value="NeetCode">NeetCode Only</option>
                <option value="Striver">Striver Only</option>
                <option value="Both">Both Sources</option>
              </select>
            )}
            
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground"
            >
              <option value="All">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
        
        {/* Table */}
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/20 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Topic</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Difficulty</th>
                  {activeTab === 'all' && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Source</th>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredQuestions.map((q, idx) => {
                  const isCompleted = solvedSlugs.has(q.slug)
                  return (
                    <tr key={q.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3 text-sm text-muted-foreground">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <a
                          href={toLeetCodeUrl(q.slug)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {q.title}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                          {q.topic}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'text-xs px-2 py-1 rounded-md font-medium',
                          q.difficulty === 'Easy' && 'bg-chart-2/10 text-chart-2',
                          q.difficulty === 'Medium' && 'bg-chart-3/10 text-chart-3',
                          q.difficulty === 'Hard' && 'bg-chart-1/10 text-chart-1'
                        )}>
                          {q.difficulty}
                        </span>
                      </td>
                      {activeTab === 'all' && (
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {q.source.includes('neetcode') && (
                              <span className="text-xs px-2 py-1 rounded-md bg-blue-500/10 text-blue-400">NC</span>
                            )}
                            {q.source.includes('striver') && (
                              <span className="text-xs px-2 py-1 rounded-md bg-purple-500/10 text-purple-400">ST</span>
                            )}
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <span className={cn(
                          'text-xs px-2 py-1 rounded-md font-medium',
                          isCompleted ? 'bg-chart-2/10 text-chart-2' : 'bg-muted text-muted-foreground'
                        )}>
                          {isCompleted ? 'Completed' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {filteredQuestions.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              No questions match the current filters
            </div>
          )}
        </div>
        
      </div>
    </div>
  )
}
