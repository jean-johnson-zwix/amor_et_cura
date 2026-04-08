'use client'

import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { Printer } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import type { Client, FieldDefinition } from '@/types/database'

type VisitRow = {
  id: string
  visit_date: string
  duration_minutes: number | null
  notes: string | null
  case_notes: string | null
  referral_to: string | null
  service_type_name: string
  case_worker_name: string
}

type SummaryRow = {
  summary_text: string
  generated_at: string
  confirmed_at: string | null
  visit_count_at_generation: number
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

function formatDob(dob: string | null) {
  if (!dob) return '—'
  const date = new Date(dob + 'T00:00:00')
  const age = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
  return `${formatDate(dob)} (age ${age})`
}

// ── Print-only document layout ────────────────────────────────

function PrintDocument({
  client,
  customFields,
  visits,
  summary,
}: {
  client: Client
  customFields: FieldDefinition[]
  visits: VisitRow[]
  summary: SummaryRow | null
}) {
  const exportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="print-document font-sans text-[#1a1a2e] bg-white">
      {/* ── Page header ───────────────────── */}
      <div className="flex items-start justify-between border-b-2 border-[#F2673C] pb-4 mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-[#111827]">{process.env.NEXT_PUBLIC_ORG_NAME ?? 'Amor et Cura'}</h1>
          <p className="text-[13px] text-[#6b7280] mt-0.5">Client Profile Export · {exportDate}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-[#9ca3af] uppercase tracking-wide">Client ID</p>
          <p className="text-[14px] font-mono font-semibold text-[#111827]">{client.client_number}</p>
        </div>
      </div>

      {/* ── Identity ──────────────────────── */}
      <div className="mb-6">
        <h2 className="text-[16px] font-bold text-[#111827] mb-3 pb-1 border-b border-[#e2e8f0]">
          Client Information
        </h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[13px]">
          <div>
            <span className="text-[#6b7280]">Full Name: </span>
            <span className="font-semibold">{client.first_name} {client.last_name}</span>
          </div>
          <div>
            <span className="text-[#6b7280]">Date of Birth: </span>
            <span className="font-semibold">{formatDob(client.dob)}</span>
          </div>
          <div>
            <span className="text-[#6b7280]">Phone: </span>
            <span className="font-semibold">{client.phone ?? '—'}</span>
          </div>
          <div>
            <span className="text-[#6b7280]">Email: </span>
            <span className="font-semibold">{client.email ?? '—'}</span>
          </div>
          <div className="col-span-2">
            <span className="text-[#6b7280]">Address: </span>
            <span className="font-semibold">{client.address ?? '—'}</span>
          </div>
          <div>
            <span className="text-[#6b7280]">Status: </span>
            <span className="font-semibold">{client.is_active ? 'Active' : 'Inactive'}</span>
          </div>
          <div>
            <span className="text-[#6b7280]">Registered: </span>
            <span className="font-semibold">{formatDate(client.created_at)}</span>
          </div>
        </div>
      </div>

      {/* ── Programs ──────────────────────── */}
      {(client.programs ?? []).length > 0 && (
        <div className="mb-6">
          <h2 className="text-[16px] font-bold text-[#111827] mb-2 pb-1 border-b border-[#e2e8f0]">
            Enrolled Services
          </h2>
          <div className="flex flex-wrap gap-2">
            {(client.programs as string[]).map((p) => (
              <span
                key={p}
                className="rounded border border-[#F2673C] px-2.5 py-0.5 text-[12px] font-medium text-[#16A34A]"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Custom fields ─────────────────── */}
      {customFields.length > 0 && (
        <div className="mb-6">
          <h2 className="text-[16px] font-bold text-[#111827] mb-3 pb-1 border-b border-[#e2e8f0]">
            Additional Information
          </h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[13px]">
            {customFields.map((field) => {
              const raw = (client.custom_fields as Record<string, unknown>)?.[field.name]
              const display = Array.isArray(raw) ? raw.join(', ') : String(raw ?? '—')
              return (
                <div key={field.id}>
                  <span className="text-[#6b7280]">{field.label}: </span>
                  <span className="font-semibold">{display || '—'}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── AI Summary ────────────────────── */}
      {summary?.confirmed_at && (
        <div className="mb-6 rounded border border-[#F2673C]/30 bg-[#f0fdf9] p-4">
          <h2 className="text-[16px] font-bold text-[#111827] mb-3 flex items-center gap-2">
            Client Summary
            <span className="text-[10px] font-semibold rounded-full bg-[#F2673C]/20 px-2 py-0.5 text-[#16A34A]">
              AI · Staff Confirmed
            </span>
          </h2>
          <div className="text-[13px] text-[#374151] leading-relaxed
            [&_h3]:text-[12px] [&_h3]:font-bold [&_h3]:uppercase [&_h3]:tracking-wide [&_h3]:text-[#111827] [&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:first:mt-0
            [&_p]:mb-2 [&_p]:last:mb-0
            [&_ul]:pl-4 [&_li]:mb-0.5
            [&_strong]:font-semibold [&_strong]:text-[#111827]">
            <ReactMarkdown>{summary.summary_text}</ReactMarkdown>
          </div>
          <p className="mt-3 text-[11px] text-[#9ca3af]">
            Generated {formatDate(summary.generated_at)} · Based on {summary.visit_count_at_generation} visit{summary.visit_count_at_generation !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* ── Visit history ─────────────────── */}
      <div>
        <h2 className="text-[16px] font-bold text-[#111827] mb-3 pb-1 border-b border-[#e2e8f0]">
          Service History ({visits.length} visit{visits.length !== 1 ? 's' : ''})
        </h2>
        {visits.length === 0 ? (
          <p className="text-[13px] text-[#6b7280]">No visits recorded.</p>
        ) : (
          <table className="w-full text-[12px] border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] text-left">
                <th className="border border-[#e2e8f0] px-2 py-1.5 font-semibold text-[#111827] w-24">Date</th>
                <th className="border border-[#e2e8f0] px-2 py-1.5 font-semibold text-[#111827] w-36">Service</th>
                <th className="border border-[#e2e8f0] px-2 py-1.5 font-semibold text-[#111827] w-32">Staff</th>
                <th className="border border-[#e2e8f0] px-2 py-1.5 font-semibold text-[#111827]">Case Notes</th>
              </tr>
            </thead>
            <tbody>
              {[...visits].reverse().map((v) => (
                <tr key={v.id} className="align-top">
                  <td className="border border-[#e2e8f0] px-2 py-2 text-[#374151] whitespace-nowrap">
                    {new Date(v.visit_date + 'T00:00:00').toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </td>
                  <td className="border border-[#e2e8f0] px-2 py-2 text-[#374151]">
                    {v.service_type_name}
                    {v.duration_minutes && (
                      <span className="block text-[11px] text-[#9ca3af]">{v.duration_minutes} min</span>
                    )}
                    {v.referral_to && (
                      <span className="block text-[11px] text-amber-700">→ {v.referral_to}</span>
                    )}
                  </td>
                  <td className="border border-[#e2e8f0] px-2 py-2 text-[#374151]">
                    {v.case_worker_name}
                  </td>
                  <td className="border border-[#e2e8f0] px-2 py-2 text-[#374151] leading-relaxed">
                    {v.case_notes || v.notes || <span className="text-[#9ca3af] italic">No notes</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Footer ────────────────────────── */}
      <div className="mt-8 border-t border-[#e2e8f0] pt-3 text-[11px] text-[#9ca3af] flex justify-between">
        <span>{process.env.NEXT_PUBLIC_ORG_NAME ?? 'Amor et Cura'} · Confidential</span>
        <span>Exported {exportDate}</span>
      </div>
    </div>
  )
}

// ── Print button (shown in the UI) ────────────────────────────

export function PrintProfileButton({
  client,
  customFields,
  visits,
  summary,
}: {
  client: Client
  customFields: FieldDefinition[]
  visits: VisitRow[]
  summary: SummaryRow | null
}) {
  const contentRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `${client.first_name}_${client.last_name}_Profile`,
    pageStyle: `
      @page { size: letter; margin: 18mm 16mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .print-document { font-size: 12px; }
      }
    `,
  })

  return (
    <>
      <button
        onClick={() => handlePrint()}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-3 text-[13px] font-medium text-[#1f2937] transition-colors hover:bg-teal-tint"
      >
        <Printer className="size-3.5" />
        Print
      </button>

      {/* Hidden print content — rendered in DOM but invisible on screen */}
      <div className="hidden print:block">
        <div ref={contentRef}>
          <PrintDocument
            client={client}
            customFields={customFields}
            visits={visits}
            summary={summary}
          />
        </div>
      </div>
    </>
  )
}
