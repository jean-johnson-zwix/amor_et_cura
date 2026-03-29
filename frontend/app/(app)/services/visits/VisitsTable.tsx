'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

type VisitRow = {
  id: string
  visit_date: string
  duration_minutes: number | null
  client: { id: string; first_name: string; last_name: string } | null
  service_type_name: string
  case_worker_name: string
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
      <div className="flex flex-wrap items-center gap-3">
        <div className="max-w-sm flex-1">
          <Input
            placeholder="Search by client name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className="h-9 rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring"
        >
          <option value="">All service types</option>
          {serviceTypes.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          value={workerFilter}
          onChange={(e) => setWorkerFilter(e.target.value)}
          className="h-9 rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring"
        >
          <option value="">All case workers</option>
          {caseWorkers.map((w) => <option key={w} value={w}>{w}</option>)}
        </select>
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? 'visit' : 'visits'} found
      </p>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              No visits match{query || serviceFilter || workerFilter ? ' the current filters' : ''}.
            </p>
          ) : (
            <div className="divide-y">
              {filtered.map((visit) => (
                <div key={visit.id} className="flex items-center gap-4 px-4 py-3 text-sm">
                  <span className="w-28 shrink-0 tabular-nums text-muted-foreground">
                    {formatDate(visit.visit_date)}
                  </span>
                  {visit.client ? (
                    <Link
                      href={`/clients/${visit.client.id}`}
                      className="min-w-0 w-40 truncate font-medium hover:underline"
                    >
                      {visit.client.first_name} {visit.client.last_name}
                    </Link>
                  ) : (
                    <span className="w-40 text-muted-foreground">—</span>
                  )}
                  <span className="hidden min-w-0 flex-1 truncate text-muted-foreground sm:block">
                    {visit.service_type_name}
                  </span>
                  <span className="ml-auto hidden w-36 shrink-0 truncate text-xs text-muted-foreground md:block">
                    {visit.case_worker_name}
                  </span>
                  {visit.duration_minutes && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {visit.duration_minutes} min
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
