'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { clientsToCsv, downloadCsv } from '@/lib/csv'
import type { Client } from '@/types/database'

type SortKey = 'name' | 'dob' | 'programs' | 'status'
type SortDir = 'asc' | 'desc'

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="inline size-3.5 ml-0.5 text-muted-foreground/50" />
  return sortDir === 'asc'
    ? <ChevronUp className="inline size-3.5 ml-0.5" />
    : <ChevronDown className="inline size-3.5 ml-0.5" />
}

export default function ClientsTable({ clients }: { clients: Client[] }) {
  const [query, setQuery] = useState('')
  const [programFilter, setProgramFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'' | 'active' | 'inactive'>('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const allPrograms = useMemo(() => {
    const set = new Set<string>()
    clients.forEach((c) => (c.programs ?? []).forEach((p) => set.add(p)))
    return Array.from(set).sort()
  }, [clients])

  const filtered = useMemo(() => {
    let list = clients.filter((c) => {
      if (query.trim()) {
        const name = `${c.first_name} ${c.last_name}`.toLowerCase()
        if (!name.includes(query.toLowerCase())) return false
      }
      if (programFilter && !(c.programs ?? []).includes(programFilter)) return false
      if (statusFilter === 'active' && !c.is_active) return false
      if (statusFilter === 'inactive' && c.is_active) return false
      return true
    })

    list = [...list].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name') {
        cmp = `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
      } else if (sortKey === 'dob') {
        cmp = (a.dob ?? '').localeCompare(b.dob ?? '')
      } else if (sortKey === 'programs') {
        cmp = (a.programs ?? []).join().localeCompare((b.programs ?? []).join())
      } else if (sortKey === 'status') {
        cmp = Number(b.is_active) - Number(a.is_active)
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return list
  }, [clients, query, programFilter, statusFilter, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  const allFilteredIds = filtered.map((c) => c.id)
  const allChecked = allFilteredIds.length > 0 && allFilteredIds.every((id) => selected.has(id))
  const someChecked = allFilteredIds.some((id) => selected.has(id))

  function toggleAll() {
    if (allChecked) {
      setSelected((prev) => { const next = new Set(prev); allFilteredIds.forEach((id) => next.delete(id)); return next })
    } else {
      setSelected((prev) => new Set([...prev, ...allFilteredIds]))
    }
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleExport() {
    const toExport = selected.size > 0
      ? clients.filter((c) => selected.has(c.id))
      : filtered
    const csv = clientsToCsv(toExport)
    const date = new Date().toISOString().split('T')[0]
    downloadCsv(csv, `clients-${date}.csv`)
  }

  const thClass = 'px-4 py-3 font-medium cursor-pointer select-none whitespace-nowrap hover:text-foreground'

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="max-w-sm flex-1">
          <Input
            placeholder="Search by name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <select
          value={programFilter}
          onChange={(e) => setProgramFilter(e.target.value)}
          className="h-9 rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring"
        >
          <option value="">All programs</option>
          {allPrograms.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as '' | 'active' | 'inactive')}
          className="h-9 rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <button
          onClick={handleExport}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-input bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted"
        >
          {selected.size > 0 ? `Export ${selected.size} selected` : 'Export CSV'}
        </button>
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? 'client' : 'clients'} found
        {selected.size > 0 && ` · ${selected.size} selected`}
      </p>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                <th className="px-4 py-3 w-8">
                  <input
                    type="checkbox"
                    className="size-4 rounded border"
                    checked={allChecked}
                    ref={(el) => { if (el) el.indeterminate = someChecked && !allChecked }}
                    onChange={toggleAll}
                  />
                </th>
                <th className={thClass} onClick={() => toggleSort('name')}>
                  Name <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} />
                </th>
                <th className={thClass} onClick={() => toggleSort('dob')}>
                  Date of Birth <SortIcon col="dob" sortKey={sortKey} sortDir={sortDir} />
                </th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className={thClass} onClick={() => toggleSort('programs')}>
                  Programs <SortIcon col="programs" sortKey={sortKey} sortDir={sortDir} />
                </th>
                <th className={thClass} onClick={() => toggleSort('status')}>
                  Status <SortIcon col="status" sortKey={sortKey} sortDir={sortDir} />
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => (
                <tr
                  key={client.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="size-4 rounded border"
                      checked={selected.has(client.id)}
                      onChange={() => toggleRow(client.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/clients/${client.id}`}
                      className="font-medium hover:underline"
                    >
                      {client.first_name} {client.last_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{client.dob ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{client.phone ?? '—'}</td>
                  <td className="px-4 py-3">{(client.programs ?? []).length > 0 ? (client.programs ?? []).join(', ') : '—'}</td>
                  <td className="px-4 py-3">
                    {client.is_active ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                        Inactive
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No clients found{query ? ` for "${query}"` : ''}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
