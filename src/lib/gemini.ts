const BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

export const DEFAULT_MODEL = 'gemini-3.1-flash-lite-preview'

export function getApiKey(): string {
  return localStorage.getItem('gemini_api_key') ?? ''
}

export function getModel(): string {
  return localStorage.getItem('gemini_model') || DEFAULT_MODEL
}

export class GeminiError extends Error {}

export async function geminiGenerate(prompt: string): Promise<string> {
  const key = getApiKey()
  if (!key) throw new GeminiError('No Gemini API key. Add it in Settings.')

  const res = await fetch(`${BASE}/${getModel()}:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new GeminiError(err?.error?.message ?? `Gemini API error ${res.status}`)
  }

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

export async function geminiChat(messages: { role: 'user' | 'model'; text: string }[]): Promise<string> {
  const key = getApiKey()
  if (!key) throw new GeminiError('No Gemini API key. Add it in Settings.')

  const contents = messages.map(m => ({
    role: m.role,
    parts: [{ text: m.text }],
  }))

  const res = await fetch(`${BASE}/${getModel()}:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: { temperature: 0.8, maxOutputTokens: 1024 },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new GeminiError(err?.error?.message ?? `Gemini API error ${res.status}`)
  }

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}
