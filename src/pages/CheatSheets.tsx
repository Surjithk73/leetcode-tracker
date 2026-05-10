import { useState } from 'react'
import { useCheatSheets } from '@/hooks/useCheatSheets'
import CheatSheetCard from '@/components/cheatsheets/CheatSheetCard'
import CheatSheetEditor from '@/components/cheatsheets/CheatSheetEditor'
import { geminiGenerate } from '@/lib/gemini'
import { TOPICS } from '@/types'
import type { Topic } from '@/types'

export default function CheatSheets() {
  const { sheets, loading, upsert } = useCheatSheets()
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null)

  const activeSheet = sheets.find(s => s.topic === activeTopic)

  async function handleSave(raw: string, formatted?: string) {
    if (!activeTopic) return
    await upsert(activeTopic, raw, formatted)
  }

  async function handlePolish(raw: string): Promise<string> {
    const prompt = `You are a DSA notes formatter. Take the following raw notes and reformat them into clean, well-structured markdown. Use headings, bullet points, code blocks with language tags, time complexity tables, and pattern summaries. Return ONLY the formatted markdown, no commentary or explanation.\n\nRaw notes:\n${raw}`
    return geminiGenerate(prompt)
  }

  const completed = sheets.filter(s => s.formatted_markdown?.trim()).length
  const inProgress = sheets.filter(s => s.raw_notes?.trim() && !s.formatted_markdown?.trim()).length

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cheat Sheets</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {completed} complete · {inProgress} in progress · {TOPICS.length - completed - inProgress} not started
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {[...Array(18)].map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card h-28 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {TOPICS.map(topic => (
              <CheatSheetCard
                key={topic}
                topic={topic}
                sheet={sheets.find(s => s.topic === topic)}
                onClick={() => setActiveTopic(topic)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Full-screen editor */}
      {activeTopic && (
        <CheatSheetEditor
          topic={activeTopic}
          sheet={activeSheet}
          onClose={() => setActiveTopic(null)}
          onSave={handleSave}
          onPolish={handlePolish}
        />
      )}
    </>
  )
}
