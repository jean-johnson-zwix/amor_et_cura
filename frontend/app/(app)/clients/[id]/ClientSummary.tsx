'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Sparkles, Loader2, Check, X, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export type SummaryRow = {
  id: string
  summary_text: string
  generated_at: string
  confirmed_at: string | null
  visit_count_at_generation: number
}

const PROSE =
  'prose prose-sm max-w-none ' +
  '[&_h3]:text-[12px] [&_h3]:font-semibold [&_h3]:uppercase [&_h3]:tracking-wide [&_h3]:text-navy [&_h3]:mt-4 [&_h3]:mb-1.5 [&_h3]:first:mt-0 ' +
  '[&_p]:text-[13px] [&_p]:text-[#374151] [&_p]:mb-2 [&_p]:last:mb-0 ' +
  '[&_ul]:pl-5 [&_ul]:mb-2 [&_li]:text-[13px] [&_li]:text-[#374151] [&_li]:mb-1 ' +
  '[&_strong]:font-semibold [&_strong]:text-navy'

// ── Panel: read-only summary displayed in the Overview tab ────

export function ClientSummaryPanel({ summary }: { summary: SummaryRow | null }) {
  if (!summary) {
    return (
      <div className="rounded-[14px] border border-dashed border-[#e2e8f0] bg-white flex flex-col items-center justify-center gap-2 py-10 px-5">
        <Sparkles className="size-5 text-[#d1d5db]" />
        <p className="text-[12px] text-[#9ca3af] text-center">
          No summary yet — click <span className="font-medium text-navy">Summarize</span> to generate one
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-[14px] border border-[#e2e8f0] bg-white flex flex-col h-full">
      <div className="flex items-center gap-2 border-b border-[#f1f5f9] px-4 py-3">
        <Sparkles className="size-3.5 text-teal" />
        <p className="text-[13px] font-semibold text-navy">Client Summary</p>
        <span className="rounded-full bg-teal/10 px-1.5 py-0.5 text-[9px] font-semibold text-teal">AI</span>
        {summary.confirmed_at && (
          <span className="flex items-center gap-1 text-[11px] text-[#6b7280] ml-auto">
            <Check className="size-3 text-teal" />
            Confirmed
          </span>
        )}
      </div>
      <div className={`flex-1 overflow-y-auto p-4 ${PROSE}`}>
        <ReactMarkdown>{summary.summary_text}</ReactMarkdown>
      </div>
      <div className="border-t border-[#f1f5f9] px-4 py-2 text-[10px] text-[#9ca3af]">
        {new Date(summary.generated_at).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric',
        })}
        {' · '}{summary.visit_count_at_generation} visit{summary.visit_count_at_generation !== 1 ? 's' : ''}
      </div>
    </div>
  )
}

// ── Button + Modal: lives in the profile header ───────────────

export function ClientSummaryButton({
  clientId,
  visitCount,
  initialSummary,
}: {
  clientId: string
  visitCount: number
  initialSummary: SummaryRow | null
}) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<'loading' | 'draft' | 'saving'>('loading')
  const [draft, setDraft] = useState<string | null>(null)
  const [editorValue, setEditorValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const hasNewVisits =
    initialSummary != null && visitCount > initialSummary.visit_count_at_generation

  async function generate() {
    setStatus('loading')
    setDraft(null)
    setError(null)
    try {
      const res = await fetch('/api/client-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`)
      setDraft(data.summary)
      setEditorValue(data.summary)
      setStatus('draft')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate summary.')
      setStatus('draft') // stay in draft state so error is shown inside modal
    }
  }

  function handleOpen() {
    setOpen(true)
    generate()
  }

  function handleClose() {
    setOpen(false)
    setDraft(null)
    setEditorValue('')
    setError(null)
    setStatus('loading')
  }

  async function confirm() {
    if (!editorValue.trim()) return
    setStatus('saving')
    setError(null)
    try {
      const supabase = createClient()
      const now = new Date().toISOString()
      const { error: dbErr } = await supabase
        .from('client_summaries')
        .upsert(
          {
            client_id: clientId,
            summary_text: editorValue.trim(),
            generated_at: now,
            confirmed_at: now,
            visit_count_at_generation: visitCount,
            updated_at: now,
          },
          { onConflict: 'client_id' }
        )
      if (dbErr) throw new Error(dbErr.message)
      handleClose()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save. Please try again.')
      setStatus('draft')
    }
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-[12px] font-medium text-navy hover:bg-teal-tint transition-colors"
      >
        <Sparkles className="size-3.5 text-teal" />
        {initialSummary ? 'Regenerate' : 'Summarize'}
        {hasNewVisits && (
          <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-amber-400" />
        )}
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={handleClose}
        >
          <div
            className="flex h-[80vh] w-full max-w-5xl flex-col rounded-[14px] border border-[#e2e8f0] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex shrink-0 items-center justify-between border-b border-[#e2e8f0] px-5 py-3.5">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-teal" />
                <p className="text-[14px] font-semibold text-navy">Client Summary</p>
                <span className="rounded-full bg-teal/10 px-2 py-0.5 text-[10px] font-semibold text-teal">AI</span>
                {status === 'loading' && (
                  <span className="text-[12px] text-[#6b7280]">Generating…</span>
                )}
                {status === 'draft' && !error && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                    Draft — review before saving
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {status === 'draft' && (
                  <>
                    <button
                      onClick={generate}
                      disabled={!draft && !error}
                      className="text-[12px] text-[#6b7280] hover:text-navy disabled:opacity-40"
                    >
                      Regenerate
                    </button>
                    <button
                      onClick={confirm}
                      disabled={!editorValue.trim()}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-teal px-3 py-1.5 text-[12px] font-medium text-white hover:bg-[#009e77] disabled:opacity-60"
                    >
                      <Check className="size-3.5" />
                      Confirm &amp; Save
                    </button>
                  </>
                )}
                {status === 'saving' && (
                  <button disabled className="inline-flex items-center gap-1.5 rounded-lg bg-teal px-3 py-1.5 text-[12px] font-medium text-white opacity-60">
                    <Loader2 className="size-3.5 animate-spin" />
                    Saving…
                  </button>
                )}
                <button onClick={handleClose} className="ml-1 text-[#9ca3af] hover:text-navy">
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Loading state */}
            {status === 'loading' && (
              <div className="flex flex-1 items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="size-8 animate-spin text-teal" />
                  <p className="text-[13px] text-[#6b7280]">
                    Synthesizing visit history and demographics…
                  </p>
                </div>
              </div>
            )}

            {/* Error (no draft) */}
            {status === 'draft' && error && !draft && (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-700 max-w-md">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  {error}
                </div>
                <button
                  onClick={generate}
                  className="inline-flex items-center gap-2 rounded-lg bg-teal px-4 py-2 text-[13px] font-medium text-white hover:bg-[#009e77]"
                >
                  <Sparkles className="size-4" />
                  Try Again
                </button>
              </div>
            )}

            {/* Split view */}
            {status === 'draft' && draft && (
              <div className="grid min-h-0 flex-1 grid-cols-2 divide-x divide-[#e2e8f0]">
                {/* Left: AI Draft */}
                <div className="flex flex-col overflow-hidden">
                  <p className="shrink-0 border-b border-[#f8fafc] px-5 py-2 text-[10px] font-semibold uppercase tracking-wide text-[#9ca3af]">
                    AI Draft
                  </p>
                  <div className={`flex-1 overflow-y-auto p-5 ${PROSE}`}>
                    <ReactMarkdown>{draft}</ReactMarkdown>
                  </div>
                </div>

                {/* Right: Editable */}
                <div className="flex flex-col overflow-hidden">
                  <p className="shrink-0 border-b border-[#f8fafc] px-5 py-2 text-[10px] font-semibold uppercase tracking-wide text-[#9ca3af]">
                    Final Version
                    <span className="ml-1 normal-case font-normal text-[#b0b8c4]">
                      — edit before confirming
                    </span>
                  </p>
                  {error && (
                    <div className="mx-4 mt-2 flex shrink-0 items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-700">
                      <AlertCircle className="size-4 shrink-0" />
                      {error}
                    </div>
                  )}
                  <textarea
                    value={editorValue}
                    onChange={(e) => setEditorValue(e.target.value)}
                    className="flex-1 resize-none p-5 font-mono text-[12px] leading-relaxed text-navy outline-none focus:ring-2 focus:ring-inset focus:ring-teal/20"
                    spellCheck
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
