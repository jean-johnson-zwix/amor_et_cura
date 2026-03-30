'use client'

import { useRef, useState } from 'react'
import { useReactToPrint } from 'react-to-print'
import ReactMarkdown from 'react-markdown'
import {
  Sparkles,
  Loader2,
  Printer,
  AlertCircle,
  BarChart3,
  Users,
  ClipboardList,
  TrendingUp,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────

type ServiceBreakdown = { service_type: string; count: number }

type ReportStats = {
  unique_clients: number
  total_visits: number
  visit_breakdown: ServiceBreakdown[]
  avg_duration_minutes: number | null
  prev_period_visits: number
  period_days: number
}

type ReportResult = {
  narrative: string
  stats: ReportStats
  generated_at: string
}

// ── Prose styles (shared between preview and print) ──────────

const PROSE =
  'prose prose-sm max-w-none ' +
  '[&_h3]:text-[13px] [&_h3]:font-semibold [&_h3]:uppercase [&_h3]:tracking-wide [&_h3]:text-navy [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:first:mt-0 ' +
  '[&_p]:text-[13px] [&_p]:text-[#374151] [&_p]:mb-2 [&_p]:last:mb-0 ' +
  '[&_ul]:pl-5 [&_ul]:mb-2 [&_li]:text-[13px] [&_li]:text-[#374151] [&_li]:mb-1 ' +
  '[&_strong]:font-semibold [&_strong]:text-navy'

// ── Print document (hidden on screen, shown when printing) ───

function PrintDocument({
  narrative,
  stats,
  dateRange,
  programFilter,
  generatedAt,
}: {
  narrative: string
  stats: ReportStats
  dateRange: { from: string; to: string }
  programFilter: string
  generatedAt: string
}) {
  const exportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const growthPct =
    stats.prev_period_visits > 0
      ? (((stats.total_visits - stats.prev_period_visits) / stats.prev_period_visits) * 100).toFixed(1)
      : null

  return (
    <div className="font-sans text-[#1a1a2e] bg-white">
      {/* Header */}
      <div className="flex items-start justify-between border-b-2 border-teal pb-4 mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-navy">{process.env.NEXT_PUBLIC_ORG_NAME ?? 'Amor et Cura'}</h1>
          <p className="text-[13px] text-[#6b7280] mt-0.5">
            Impact Report · {dateRange.from} – {dateRange.to}
            {programFilter !== 'All Programs' ? ` · ${programFilter}` : ''}
          </p>
        </div>
        <div className="text-right text-[11px] text-[#9ca3af]">
          <p>Generated {exportDate}</p>
          <p className="text-[10px] mt-0.5">AI-assisted · Staff reviewed</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Unique Clients Served', value: String(stats.unique_clients) },
          { label: 'Total Services Delivered', value: String(stats.total_visits) },
          {
            label: 'Avg Session Duration',
            value: stats.avg_duration_minutes ? `${stats.avg_duration_minutes} min` : 'N/A',
          },
          {
            label: 'Period-over-Period Growth',
            value: growthPct != null ? `${Number(growthPct) >= 0 ? '+' : ''}${growthPct}%` : 'N/A',
          },
        ].map(({ label, value }) => (
          <div key={label} className="rounded border border-[#e2e8f0] p-3 text-center">
            <p className="text-[20px] font-bold text-navy">{value}</p>
            <p className="text-[10px] text-[#6b7280] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Service breakdown */}
      <div className="mb-6">
        <h2 className="text-[14px] font-bold text-navy mb-2 pb-1 border-b border-[#e2e8f0]">
          Service Breakdown
        </h2>
        <table className="w-full text-[12px] border-collapse">
          <thead>
            <tr className="bg-[#f8fafc]">
              <th className="border border-[#e2e8f0] px-3 py-1.5 text-left font-semibold text-navy">
                Service Type
              </th>
              <th className="border border-[#e2e8f0] px-3 py-1.5 text-right font-semibold text-navy w-24">
                Sessions
              </th>
              <th className="border border-[#e2e8f0] px-3 py-1.5 text-right font-semibold text-navy w-24">
                Share
              </th>
            </tr>
          </thead>
          <tbody>
            {stats.visit_breakdown.map((row) => (
              <tr key={row.service_type}>
                <td className="border border-[#e2e8f0] px-3 py-1.5 text-[#374151]">
                  {row.service_type}
                </td>
                <td className="border border-[#e2e8f0] px-3 py-1.5 text-right tabular-nums">
                  {row.count}
                </td>
                <td className="border border-[#e2e8f0] px-3 py-1.5 text-right tabular-nums text-[#6b7280]">
                  {stats.total_visits > 0
                    ? `${((row.count / stats.total_visits) * 100).toFixed(0)}%`
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AI Narrative */}
      <div>
        <h2 className="text-[14px] font-bold text-navy mb-3 pb-1 border-b border-[#e2e8f0] flex items-center gap-2">
          Impact Narrative
          <span className="text-[10px] font-semibold rounded-full bg-teal/20 px-2 py-0.5 text-[#007b58]">
            AI · Staff Reviewed
          </span>
        </h2>
        <div
          className="text-[13px] text-[#374151] leading-relaxed
          [&_h3]:text-[12px] [&_h3]:font-bold [&_h3]:uppercase [&_h3]:tracking-wide [&_h3]:text-navy [&_h3]:mt-4 [&_h3]:mb-1.5 [&_h3]:first:mt-0
          [&_p]:mb-2 [&_p]:last:mb-0
          [&_ul]:pl-4 [&_li]:mb-0.5
          [&_strong]:font-semibold [&_strong]:text-navy"
        >
          <ReactMarkdown>{narrative}</ReactMarkdown>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 border-t border-[#e2e8f0] pt-3 text-[11px] text-[#9ca3af] flex justify-between">
        <span>{process.env.NEXT_PUBLIC_ORG_NAME ?? 'Amor et Cura'} · Confidential · Not for public distribution</span>
        <span>Generated {new Date(generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
      </div>
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string
  value: string
  sub?: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="rounded-[14px] border border-[#e2e8f0] bg-white p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal/10">
          <Icon className="size-3.5 text-teal" />
        </div>
        <p className="text-[11px] text-[#6b7280] font-medium uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-2xl font-bold tabular-nums text-navy">{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-[#6b7280]">{sub}</p>}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────

export function ReportsHub({ serviceTypes }: { serviceTypes: string[] }) {
  // Default date range: last 90 days
  const today = new Date()
  const ninetyDaysAgo = new Date(today)
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
  const fmt = (d: Date) => d.toISOString().split('T')[0]

  const [dateFrom, setDateFrom] = useState(fmt(ninetyDaysAgo))
  const [dateTo, setDateTo] = useState(fmt(today))
  const [programFilter, setProgramFilter] = useState('')

  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<ReportResult | null>(null)
  const [editorValue, setEditorValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Impact_Report_${dateFrom}_${dateTo}`,
    pageStyle: `
      @page { size: letter; margin: 18mm 16mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    `,
  })

  async function generate() {
    setStatus('loading')
    setResult(null)
    setError(null)

    try {
      const res = await fetch('/api/funder-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_date: dateFrom,
          end_date: dateTo,
          program_filter: programFilter || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`)
      setResult(data as ReportResult)
      setEditorValue((data as ReportResult).narrative)
      setStatus('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report.')
      setStatus('error')
    }
  }

  const stats = result?.stats
  const growthPct =
    stats && stats.prev_period_visits > 0
      ? (((stats.total_visits - stats.prev_period_visits) / stats.prev_period_visits) * 100).toFixed(1)
      : null

  const programLabel = programFilter || 'All Programs'

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* ── Controls ──────────────────────────────────────── */}
      <div className="rounded-[14px] border border-[#e2e8f0] bg-white p-5 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-[#6b7280]">
            Date Range
          </label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              max={dateTo}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-[13px] text-navy outline-none focus:ring-2 focus:ring-teal/30"
            />
            <span className="text-[13px] text-[#6b7280]">to</span>
            <input
              type="date"
              value={dateTo}
              min={dateFrom}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-[13px] text-navy outline-none focus:ring-2 focus:ring-teal/30"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 sm:w-56">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-[#6b7280]">
            Program Filter
          </label>
          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-[13px] text-navy outline-none focus:ring-2 focus:ring-teal/30 bg-white"
          >
            <option value="">All Programs</option>
            {serviceTypes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={generate}
          disabled={status === 'loading'}
          className="inline-flex items-center gap-2 rounded-lg bg-teal px-5 py-2 text-[13px] font-semibold text-white hover:bg-[#009e77] disabled:opacity-60 transition-colors self-end"
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles className="size-4" />
              Generate Impact Narrative
            </>
          )}
        </button>
      </div>

      {/* ── Loading state ─────────────────────────────────── */}
      {status === 'loading' && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-[14px] border border-[#e2e8f0] bg-white py-16">
          <Loader2 className="size-8 animate-spin text-teal" />
          <p className="text-[13px] text-[#6b7280]">
            Aggregating data and generating narrative…
          </p>
          <p className="text-[11px] text-[#9ca3af]">This may take 15–30 seconds</p>
        </div>
      )}

      {/* ── Error state ───────────────────────────────────── */}
      {status === 'error' && error && (
        <div className="flex items-start gap-3 rounded-[14px] border border-amber-200 bg-amber-50 p-5">
          <AlertCircle className="size-5 shrink-0 text-amber-500 mt-0.5" />
          <div>
            <p className="text-[13px] font-semibold text-amber-800">Generation failed</p>
            <p className="mt-0.5 text-[12px] text-amber-700">{error}</p>
          </div>
        </div>
      )}

      {/* ── Results ───────────────────────────────────────── */}
      {status === 'done' && result && stats && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="Unique Clients"
              value={String(stats.unique_clients)}
              icon={Users}
            />
            <StatCard
              label="Services Delivered"
              value={String(stats.total_visits)}
              sub={`${stats.period_days}-day period`}
              icon={ClipboardList}
            />
            <StatCard
              label="Avg Session"
              value={stats.avg_duration_minutes ? `${stats.avg_duration_minutes} min` : 'N/A'}
              icon={BarChart3}
            />
            <StatCard
              label="Period Growth"
              value={
                growthPct != null
                  ? `${Number(growthPct) >= 0 ? '+' : ''}${growthPct}%`
                  : 'N/A'
              }
              sub={
                stats.prev_period_visits > 0
                  ? `vs. ${stats.prev_period_visits} prior`
                  : 'No prior data'
              }
              icon={TrendingUp}
            />
          </div>

          {/* Service breakdown */}
          {stats.visit_breakdown.length > 0 && (
            <div className="rounded-[14px] border border-[#e2e8f0] bg-white overflow-hidden">
              <div className="px-5 py-3 border-b border-[#f1f5f9]">
                <p className="text-[13px] font-semibold text-navy">Service Breakdown</p>
              </div>
              <div className="divide-y divide-[#f8fafc]">
                {stats.visit_breakdown.map((row) => {
                  const pct =
                    stats.total_visits > 0
                      ? Math.round((row.count / stats.total_visits) * 100)
                      : 0
                  return (
                    <div key={row.service_type} className="flex items-center gap-3 px-5 py-3">
                      <p className="text-[13px] text-navy flex-1">{row.service_type}</p>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-1.5 rounded-full bg-[#f1f5f9] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-teal"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[12px] tabular-nums text-[#6b7280] w-10 text-right">
                          {row.count}
                        </span>
                        <span className="text-[11px] tabular-nums text-[#9ca3af] w-8 text-right">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* AI Narrative editor */}
          <div className="rounded-[14px] border border-[#e2e8f0] bg-white overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] px-5 py-3">
              <div className="flex items-center gap-2">
                <Sparkles className="size-3.5 text-teal" />
                <p className="text-[13px] font-semibold text-navy">Impact Narrative</p>
                <span className="rounded-full bg-teal/10 px-1.5 py-0.5 text-[9px] font-semibold text-teal">
                  AI
                </span>
                <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700">
                  Review before printing
                </span>
              </div>
              <button
                onClick={() => handlePrint()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-[12px] font-medium text-navy hover:bg-teal/5 transition-colors"
              >
                <Printer className="size-3.5" />
                Download PDF
              </button>
            </div>

            {/* Split: preview | editor */}
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#e2e8f0]">
              {/* Preview */}
              <div className="flex flex-col overflow-hidden">
                <p className="shrink-0 border-b border-[#f8fafc] px-5 py-2 text-[10px] font-semibold uppercase tracking-wide text-[#9ca3af]">
                  Preview
                </p>
                <div className={`flex-1 overflow-y-auto p-5 ${PROSE}`}>
                  <ReactMarkdown>{editorValue}</ReactMarkdown>
                </div>
              </div>

              {/* Editor */}
              <div className="flex flex-col">
                <p className="shrink-0 border-b border-[#f8fafc] px-5 py-2 text-[10px] font-semibold uppercase tracking-wide text-[#9ca3af]">
                  Edit before printing
                </p>
                <textarea
                  value={editorValue}
                  onChange={(e) => setEditorValue(e.target.value)}
                  className="flex-1 resize-none p-5 font-mono text-[12px] leading-relaxed text-navy outline-none focus:ring-2 focus:ring-inset focus:ring-teal/20 min-h-100"
                  spellCheck
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Hidden print document ─────────────────────────── */}
      {status === 'done' && result && stats && (
        <div className="hidden print:block">
          <div ref={printRef}>
            <PrintDocument
              narrative={editorValue}
              stats={stats}
              dateRange={{ from: dateFrom, to: dateTo }}
              programFilter={programLabel}
              generatedAt={result.generated_at}
            />
          </div>
        </div>
      )}
    </div>
  )
}
