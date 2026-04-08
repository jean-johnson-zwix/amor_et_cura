'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, Loader2, Sparkles, X, AlertCircle } from 'lucide-react'

type ClientResult = {
  id: string
  first_name: string
  last_name: string
  client_number: string
  status: string
}

type SemanticResult = {
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

function SimilarityBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  const bg = pct >= 80 ? '#FFF7ED' : pct >= 60 ? '#FFFBEB' : '#F0ECE8'
  const color = pct >= 80 ? '#C2400A' : pct >= 60 ? '#D97706' : '#6b7280'
  return (
    <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: bg, color }}>
      {pct}% match
    </span>
  )
}

export default function DashboardSearchBar() {
  const [query, setQuery] = useState('')
  const [smartSearch, setSmartSearch] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [clientResults, setClientResults] = useState<ClientResult[]>([])
  const [semanticResults, setSemanticResults] = useState<SemanticResult[]>([])
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const searchClients = useCallback(async (q: string) => {
    if (!q.trim()) { setClientResults([]); setStatus('idle'); return }
    setStatus('loading')
    try {
      const res = await fetch(`/api/clients/search?q=${encodeURIComponent(q.trim())}`)
      const data = await res.json()
      setClientResults(data.results ?? [])
      setStatus('done')
    } catch {
      setStatus('error')
      setError('Could not reach the search service.')
    }
  }, [])

  const searchSemantic = useCallback(async (q: string) => {
    if (!q.trim()) return
    setStatus('loading')
    setError(null)
    setSemanticResults([])
    try {
      const res = await fetch('/api/semantic-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`)
      setSemanticResults(data.results ?? [])
      setStatus('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setStatus('error')
    }
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    setOpen(true)
    if (!smartSearch) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (val.trim()) {
        debounceRef.current = setTimeout(() => searchClients(val), 300)
      } else {
        setClientResults([])
        setStatus('idle')
      }
    } else {
      if (!val.trim()) { setSemanticResults([]); setStatus('idle') }
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!query.trim()) return
    if (smartSearch) searchSemantic(query)
    else searchClients(query)
  }

  function clear() {
    setQuery('')
    setClientResults([])
    setSemanticResults([])
    setStatus('idle')
    setError(null)
    setOpen(false)
    inputRef.current?.focus()
  }

  function toggleSmartSearch() {
    setSmartSearch(v => !v)
    setSemanticResults([])
    setClientResults([])
    setStatus('idle')
    setError(null)
  }

  const hasResults =
    (smartSearch && semanticResults.length > 0) ||
    (!smartSearch && clientResults.length > 0)

  const showDropdown =
    open &&
    query.trim().length > 0 &&
    (status !== 'idle' || (smartSearch && query.trim().length > 0))

  return (
    <div ref={containerRef} className="relative">
      <form onSubmit={handleSubmit}>
        <div className={`flex items-center rounded-full bg-white shadow-sm transition-shadow focus-within:shadow-md ${smartSearch ? 'ring-2 ring-teal/30' : ''}`}>
          <Search className="ml-5 size-5 shrink-0 text-[#9ca3af]" />
          <input
            ref={inputRef}
            value={query}
            onChange={handleChange}
            onFocus={() => { if (query.trim()) setOpen(true) }}
            placeholder={
              smartSearch
                ? 'Ask anything — e.g. "Who needs housing help?" or "Clients with food insecurity"'
                : 'Search for a client, visit, or task (e.g., "Who needs housing help?")'
            }
            className="h-14 flex-1 bg-transparent px-4 text-base text-navy outline-none placeholder:text-[#9ca3af]"
          />
          {query && (
            <button type="button" onClick={clear} className="mr-2 text-[#9ca3af] hover:text-navy">
              <X className="size-4" />
            </button>
          )}
          {/* AI toggle */}
          <button
            type="button"
            onClick={toggleSmartSearch}
            className={`mr-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              smartSearch
                ? 'bg-teal text-white'
                : 'text-[#6b7280] hover:text-navy'
            }`}
          >
            <Sparkles className="size-4" />
            AI Semantic Search
          </button>
          {smartSearch && (
            <button
              type="submit"
              disabled={status === 'loading' || !query.trim()}
              className="mr-3 inline-flex h-9 items-center rounded-full bg-teal px-4 text-sm font-semibold text-white hover:bg-[#D45228] disabled:opacity-60 transition-colors"
            >
              {status === 'loading' ? <Loader2 className="size-4 animate-spin" /> : 'Search'}
            </button>
          )}
        </div>
      </form>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-[#EDE9E4] bg-white shadow-xl z-50">
          <div className="flex items-center justify-between border-b border-[#f1f5f9] px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              {smartSearch ? (
                <>
                  <Sparkles className="size-3.5 text-teal" />
                  <span className="text-sm font-semibold text-navy">Smart Search</span>
                  <span className="rounded-full bg-teal/10 px-1.5 py-0.5 text-[10px] font-semibold text-teal">AI</span>
                  <span className="ml-1 text-sm text-[#6b7280]">Searching case notes by meaning</span>
                </>
              ) : (
                <>
                  <Search className="size-3.5 text-[#9ca3af]" />
                  <span className="text-sm font-semibold text-navy">Clients</span>
                </>
              )}
            </div>
            {hasResults && (
              <span className="text-xs text-[#9ca3af]">
                {smartSearch ? semanticResults.length : clientResults.length} result
                {(smartSearch ? semanticResults.length : clientResults.length) !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="max-h-[440px] overflow-y-auto p-2">
            {status === 'loading' && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-5 animate-spin text-teal" />
              </div>
            )}
            {status === 'error' && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 mx-1 my-2 px-3 py-2.5">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600" />
                <p className="text-sm text-amber-700">{error ?? 'Something went wrong. Please try again.'}</p>
              </div>
            )}
            {smartSearch && status === 'idle' && query.trim() && (
              <p className="py-6 text-center text-sm text-[#6b7280]">
                Press Enter or click <span className="font-medium text-navy">Search</span> to find case notes by meaning
              </p>
            )}
            {status === 'done' && !hasResults && (
              <p className="py-6 text-center text-sm text-[#6b7280]">
                {smartSearch
                  ? 'No matching case notes found. Try different wording.'
                  : `No clients found for "${query}"`}
              </p>
            )}

            {!smartSearch && clientResults.map(c => (
              <div key={c.id} className="flex items-center justify-between rounded-lg px-3 py-3 hover:bg-[#f8fafc] transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy/10 text-sm font-semibold text-navy">
                    {c.first_name[0]}{c.last_name[0]}
                  </div>
                  <div>
                    <Link
                      href={`/clients/${c.id}`}
                      onClick={() => setOpen(false)}
                      className="block text-sm font-semibold text-navy hover:text-teal hover:underline leading-tight"
                    >
                      {c.first_name} {c.last_name}
                    </Link>
                    <span className="text-xs text-[#9ca3af]">{c.client_number}</span>
                  </div>
                </div>
                <Link
                  href={`/services/schedule/new?client_id=${c.id}`}
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#e2e8f0] px-2.5 py-1 text-xs font-medium text-[#6b7280] hover:border-teal hover:text-teal transition-colors whitespace-nowrap"
                >
                  + Add Follow-up
                </Link>
              </div>
            ))}

            {smartSearch && semanticResults.map(r => {
              const snippet = r.case_notes || r.notes
              return (
                <div key={r.id} className="rounded-xl border border-[#e2e8f0] m-1 p-3 hover:border-teal/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/clients/${r.client_id}`}
                          onClick={() => setOpen(false)}
                          className="text-sm font-semibold text-navy hover:text-teal hover:underline"
                        >
                          {r.first_name} {r.last_name}
                        </Link>
                        <span className="text-xs text-[#9ca3af]">{r.client_number}</span>
                        <SimilarityBadge score={r.similarity} />
                      </div>
                      <div className="mt-0.5 text-xs text-[#6b7280]">
                        {r.service_type_name} ·{' '}
                        {new Date(r.visit_date + 'T00:00:00').toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </div>
                      {snippet && (
                        <p className="mt-1.5 text-xs text-[#374151] leading-relaxed line-clamp-2">
                          {snippet.length > 200 ? snippet.slice(0, 200) + '…' : snippet}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <Link
                        href={`/services/schedule/new?client_id=${r.client_id}`}
                        onClick={() => setOpen(false)}
                        className="inline-flex items-center gap-1 rounded-lg bg-teal px-2.5 py-1 text-xs font-medium text-white hover:bg-[#D45228] transition-colors whitespace-nowrap"
                      >
                        + Add Follow-up
                      </Link>
                      <Link
                        href={`/clients/${r.client_id}`}
                        onClick={() => setOpen(false)}
                        className="text-xs font-medium text-teal hover:underline"
                      >
                        View profile →
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
