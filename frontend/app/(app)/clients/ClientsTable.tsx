'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { clientsToCsv, downloadCsv } from '@/lib/csv'
import type { Client } from '@/types/database'

export default function ClientsTable({ clients }: { clients: Client[] }) {
  const [query, setQuery] = useState('')

  function handleExport() {
    const csv = clientsToCsv(clients)
    const date = new Date().toISOString().split('T')[0]
    downloadCsv(csv, `clients-${date}.csv`)
  }

  const filtered = clients.filter((c) => {
    if (!query.trim()) return true
    const name = `${c.first_name} ${c.last_name}`.toLowerCase()
    return (
      name.includes(query.toLowerCase()) ||
      c.client_number.toLowerCase().includes(query.toLowerCase())
    )
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="max-w-sm flex-1">
          <Input
            placeholder="Search by name or ID…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button
          onClick={handleExport}
          className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-input bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted"
        >
          Export CSV
        </button>
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? 'client' : 'clients'} found
      </p>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Date of Birth</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Program</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => (
                <tr
                  key={client.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {client.client_number}
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
                  <td className="px-4 py-3">{client.program ?? '—'}</td>
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
