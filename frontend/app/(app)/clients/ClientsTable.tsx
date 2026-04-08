'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronUp, ChevronDown, ChevronsUpDown, Eye, Pencil } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { clientsToCsv, downloadCsv } from '@/lib/csv'
import type { Client } from '@/types/database'

type SortKey = 'name' | 'dob' | 'programs' | 'status'
type SortDir = 'asc' | 'desc'

const AVATAR_COLORS = ['#F2673C']

function getInitials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="inline size-3.5 ml-0.5 text-[#6b7280]/50" />
  return sortDir === 'asc'
    ? <ChevronUp className="inline size-3.5 ml-0.5 text-[#111827]" />
    : <ChevronDown className="inline size-3.5 ml-0.5 text-[#111827]" />
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

  const thClass =
    'px-4 py-3 text-[11px] font-medium uppercase tracking-[0.05em] cursor-pointer select-none whitespace-nowrap text-[#6b7280] hover:text-[#111827]'

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="max-w-sm flex-1">
          <Input
            placeholder="Search by name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 rounded-lg border-[#e2e8f0] bg-teal-tint text-[13px] placeholder:text-[#6b7280] focus-visible:border-teal focus-visible:ring-teal/20"
          />
        </div>

        <select
          value={programFilter}
          onChange={(e) => setProgramFilter(e.target.value)}
          className="h-9 rounded-lg border border-[#e2e8f0] bg-white px-2.5 text-[13px] text-[#1f2937] outline-none focus:border-teal"
        >
          <option value="">All programs</option>
          {allPrograms.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as '' | 'active' | 'inactive')}
          className="h-9 rounded-lg border border-[#e2e8f0] bg-white px-2.5 text-[13px] text-[#1f2937] outline-none focus:border-teal"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <button
          onClick={handleExport}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-3 text-[13px] font-medium text-[#1f2937] transition-colors hover:bg-teal-tint"
        >
          {selected.size > 0 ? `Export ${selected.size} selected` : 'Export CSV'}
        </button>
      </div>

      <p className="text-[12px] text-[#6b7280]">
        {filtered.length} {filtered.length === 1 ? 'client' : 'clients'} found
        {selected.size > 0 && ` · ${selected.size} selected`}
      </p>

      {/* Table card */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e2e8f0]/50 bg-teal-tint text-left">
              <th className="px-4 py-3 w-8">
                <input
                  type="checkbox"
                  className="size-4 rounded border-[#e2e8f0] accent-teal"
                  checked={allChecked}
                  ref={(el) => { if (el) el.indeterminate = someChecked && !allChecked }}
                  onChange={toggleAll}
                />
              </th>
              <th className={thClass} onClick={() => toggleSort('name')}>
                Client <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th className={thClass} onClick={() => toggleSort('dob')}>
                Date of Birth <SortIcon col="dob" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.05em] text-[#6b7280]">Phone</th>
              <th className={thClass} onClick={() => toggleSort('programs')}>
                Programs <SortIcon col="programs" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th className={thClass} onClick={() => toggleSort('status')}>
                Status <SortIcon col="status" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.05em] text-[#6b7280]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((client, i) => {
              const initials = getInitials(client.first_name, client.last_name)
              const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length]
              const programs = client.programs ?? []
              const visiblePrograms = programs.slice(0, 2)
              const extraCount = programs.length - 2

              return (
                <tr
                  key={client.id}
                  className="border-b border-[#f1f5f9] last:border-0 transition-colors hover:bg-teal-tint"
                  style={{ height: 44 }}
                >
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      className="size-4 rounded border-[#e2e8f0] accent-teal"
                      checked={selected.has(client.id)}
                      onChange={() => toggleRow(client.id)}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                        style={{ background: avatarColor }}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/clients/${client.id}`}
                          className="block truncate text-[13px] font-semibold text-[#111827] hover:underline"
                        >
                          {client.first_name} {client.last_name}
                        </Link>
                        {client.dob && (
                          <p className="text-[11px] text-[#6b7280]">{client.dob}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-[13px] text-[#6b7280]">{client.dob ?? '—'}</td>
                  <td className="px-4 py-2 text-[13px] text-[#6b7280]">{client.phone ?? '—'}</td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      {visiblePrograms.map((p) => (
                        <span
                          key={p}
                          className="rounded bg-teal-light px-1.5 py-0.5 text-[10px] font-medium text-teal"
                          style={{ borderRadius: 4 }}
                        >
                          {p}
                        </span>
                      ))}
                      {extraCount > 0 && (
                        <span className="rounded bg-teal-light px-1.5 py-0.5 text-[10px] font-medium text-teal" style={{ borderRadius: 4 }}>
                          +{extraCount} more
                        </span>
                      )}
                      {programs.length === 0 && <span className="text-[13px] text-[#6b7280]">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    {client.is_active ? (
                      <span className="inline-flex items-center rounded-full bg-teal-light px-2 py-0.5 text-[10px] font-medium text-teal">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-[#F0ECE8] px-2 py-0.5 text-[10px] font-medium text-[#6b7280]">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/clients/${client.id}`}
                        className="rounded p-1 text-[#6b7280] transition-colors hover:text-navy"
                        title="View"
                      >
                        <Eye className="size-4" />
                      </Link>
                      <Link
                        href={`/clients/${client.id}/edit`}
                        className="rounded p-1 text-[#6b7280] transition-colors hover:text-navy"
                        title="Edit"
                      >
                        <Pencil className="size-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <p className="text-[13px] text-[#6b7280]">No clients found{query ? ` for "${query}"` : ''}.</p>
                  <Link href="/clients/new" className="mt-1 text-[13px] text-teal hover:underline">
                    + Add your first client
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
