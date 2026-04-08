'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'

type VisitRow = {
  id: string
  visit_date: string
  duration_minutes: number | null
  client: { id: string; first_name: string; last_name: string } | null
  service_type_name: string
  case_worker_name: string
}

const AVATAR_COLORS = ['#F2673C']

function getInitials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function VisitsTable({
  visits,
  serviceTypes,
  caseWorkers,
}: {
  visits: VisitRow[]
  serviceTypes: string[]
  caseWorkers: string[]
}) {
  const [query, setQuery] = useState('')
  const [serviceFilter, setServiceFilter] = useState('')
  const [workerFilter, setWorkerFilter] = useState('')

  const filtered = useMemo(() => {
    return visits.filter((v) => {
      if (query.trim()) {
        const name = v.client
          ? `${v.client.first_name} ${v.client.last_name}`.toLowerCase()
          : ''
        if (!name.includes(query.toLowerCase())) return false
      }
      if (serviceFilter && v.service_type_name !== serviceFilter) return false
      if (workerFilter && v.case_worker_name !== workerFilter) return false
      return true
    })
  }, [visits, query, serviceFilter, workerFilter])

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="max-w-sm flex-1">
          <Input
            placeholder="Search by client name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 rounded-lg border-[#e2e8f0] bg-teal-tint text-[13px] placeholder:text-[#6b7280] focus-visible:border-teal focus-visible:ring-teal/20"
          />
        </div>
        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className="h-9 rounded-lg border border-[#e2e8f0] bg-white px-2.5 text-[13px] text-[#1f2937] outline-none focus:border-teal"
        >
          <option value="">All service types</option>
          {serviceTypes.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={workerFilter}
          onChange={(e) => setWorkerFilter(e.target.value)}
          className="h-9 rounded-lg border border-[#e2e8f0] bg-white px-2.5 text-[13px] text-[#1f2937] outline-none focus:border-teal"
        >
          <option value="">All case workers</option>
          {caseWorkers.map((w) => <option key={w} value={w}>{w}</option>)}
        </select>
      </div>

      <p className="text-[12px] text-[#6b7280]">
        {filtered.length} {filtered.length === 1 ? 'visit' : 'visits'} found
      </p>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e2e8f0]/50 bg-teal-tint text-left">
              <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.05em] text-[#6b7280]">Date</th>
              <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.05em] text-[#6b7280]">Client</th>
              <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.05em] text-[#6b7280]">Service type</th>
              <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.05em] text-[#6b7280]">Duration</th>
              <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.05em] text-[#6b7280]">Staff</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[13px] text-[#6b7280]">
                  No visits match{query || serviceFilter || workerFilter ? ' the current filters' : ''}.
                </td>
              </tr>
            ) : (
              filtered.map((visit, i) => {
                const client = visit.client
                const initials = client ? getInitials(client.first_name, client.last_name) : '?'
                const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length]
                return (
                  <tr
                    key={visit.id}
                    className="border-b border-[#f1f5f9] last:border-0 transition-colors hover:bg-teal-tint"
                  >
                    <td className="px-4 py-3 text-[12px] text-[#6b7280] tabular-nums whitespace-nowrap">
                      {formatDate(visit.visit_date)}
                    </td>
                    <td className="px-4 py-3">
                      {client ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                            style={{ background: avatarColor }}
                          >
                            {initials}
                          </div>
                          <Link
                            href={`/clients/${client.id}`}
                            className="text-[13px] font-semibold text-navy hover:underline"
                          >
                            {client.first_name} {client.last_name}
                          </Link>
                        </div>
                      ) : (
                        <span className="text-[13px] text-[#6b7280]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-medium text-teal"
                        style={{ background: '#FFF7ED', borderRadius: 4 }}
                      >
                        {visit.service_type_name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#6b7280]">
                      {visit.duration_minutes ? `${visit.duration_minutes} min` : '—'}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#6b7280]">
                      {visit.case_worker_name}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
