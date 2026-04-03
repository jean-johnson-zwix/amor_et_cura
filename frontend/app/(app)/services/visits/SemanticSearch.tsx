'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Search, Loader2, AlertCircle, Sparkles, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

type SearchResult = {
  id: string
  client_id: string
  visit_date: string
  case_notes: string | null
  notes: string | null
  similarity: number
  first_name: string
  last_name: string
  client_number: string
  service_type_name: string
}

function Snippet({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const limit = 300
  const truncated = text.length > limit && !expanded

  return (
    <div className="mt-2 text-[12px] text-[#374151] leading-relaxed">
      <div className={`prose prose-sm max-w-none
        [&_h3]:text-[11px] [&_h3]:font-semibold [&_h3]:uppercase [&_h3]:tracking-wide [&_h3]:text-navy [&_h3]:mt-2 [&_h3]:mb-0.5 [&_h3]:first:mt-0
        [&_p]:mb-1 [&_p]:last:mb-0 [&_ul]:pl-3 [&_li]:mb-0 [&_strong]:text-navy`}>
        <ReactMarkdown>{truncated ? text.slice(0, limit) + '…' : text}</ReactMarkdown>
      </div>
      {text.length > limit && (
        <button onClick={() => setExpanded(v => !v)}
          className="mt-1 text-[11px] font-medium text-teal hover:underline">
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  )
}

function SimilarityBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  const bg = pct >= 80 ? '#FFF7ED' : pct >= 60 ? '#FFFBEB' : '#F0ECE8'
  const color = pct >= 80 ? '#C2400A' : pct >= 60 ? '#D97706' : '#6b7280'
  return (
    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
      style={{ background: bg, color }}>
      {pct}% match
    </span>
  )
}

export default function SemanticSearch() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [results, setResults] = useState<SearchResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setStatus('loading')
    setError(null)
    setResults([])
    try {
      const res = await fetch('/api/semantic-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`)
      setResults(data.results ?? [])
      setStatus('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setStatus('error')
    }
  }

  function clear() {
    setQuery('')
    setResults([])
    setStatus('idle')
    setError(null)
    inputRef.current?.focus()
  }

  return (
    <div className="mb-6 rounded-[14px] border border-[#e2e8f0] bg-white p-5">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="size-4 text-teal" />
        <p className="text-[13px] font-semibold text-navy">Semantic search</p>
        <span className="rounded-full bg-teal/10 px-2 py-0.5 text-[10px] font-semibold text-teal">AI</span>
        <p className="ml-1 text-[11px] text-[#6b7280]">Search case notes by meaning, not just keywords</p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-[#9ca3af]" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder='e.g. "clients struggling with housing instability" or "follow-up needed for mental health"'
            className="h-9 w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] pl-8 pr-8 text-[13px] text-navy outline-none transition-all focus:border-teal focus:ring-2 focus:ring-teal/20 placeholder:text-[#9ca3af]"
          />
          {query && (
            <button type="button" onClick={clear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-navy">
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={status === 'loading' || !query.trim()}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-teal px-4 text-[13px] font-medium text-white transition-colors hover:bg-[#D45228] disabled:opacity-60"
        >
          {status === 'loading' ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
          {status === 'loading' ? 'Searching…' : 'Search'}
        </button>
      </form>

      {/* Error */}
      {status === 'error' && error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <p className="text-[12px] text-amber-700">{error}</p>
        </div>
      )}

      {/* No results */}
      {status === 'done' && results.length === 0 && (
        <p className="mt-3 text-[12px] text-[#6b7280]">
          No case notes matched that query. Try different wording, or note that only visits with case narratives are searchable.
        </p>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-4 flex flex-col gap-3">
          <p className="text-[11px] text-[#6b7280]">{results.length} result{results.length !== 1 ? 's' : ''} found</p>
          {results.map((r) => (
            <div key={r.id} className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/clients/${r.client_id}`}
                      className="text-[13px] font-semibold text-navy hover:text-teal hover:underline">
                      {r.first_name} {r.last_name}
                    </Link>
                    <span className="text-[11px] text-[#9ca3af]">{r.client_number}</span>
                    <span className="rounded-full bg-white border border-[#e2e8f0] px-2 py-0.5 text-[11px] text-[#6b7280]">
                      {r.service_type_name}
                    </span>
                    <span className="text-[11px] text-[#9ca3af]">
                      {new Date(r.visit_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  {r.case_notes && <Snippet text={r.case_notes} />}
                  {!r.case_notes && r.notes && (
                    <p className="mt-1.5 text-[12px] text-[#6b7280] italic">{r.notes}</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <SimilarityBadge score={r.similarity} />
                  <Link href={`/clients/${r.client_id}`}
                    className="text-[11px] font-medium text-teal hover:underline">
                    View profile →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
