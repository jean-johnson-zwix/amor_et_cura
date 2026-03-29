import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const PAGE_SIZE = 50

const ACTION_BADGE: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-800',
  UPDATE: 'bg-amber-100 text-amber-800',
  DELETE: 'bg-red-100 text-red-800',
}

const TABLE_LABELS: Record<string, string> = {
  clients: 'Client',
  visits: 'Visit',
  appointments: 'Appointment',
  profiles: 'User',
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ table?: string; action?: string; actor?: string; page?: string }>
}) {
  const { table, action, actor, page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10))
  const offset = (page - 1) * PAGE_SIZE

  const supabase = await createClient()

  // Build query with optional filters
  let query = supabase
    .from('audit_log')
    .select('*, profiles(full_name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (table) query = query.eq('table_name', table)
  if (action) query = query.eq('action', action)
  if (actor) query = query.eq('actor_id', actor)

  const { data: rawRows, count } = await query

  const rows = (rawRows ?? []).map((r) => ({
    ...r,
    actor_name: (r.profiles as { full_name: string } | null)?.full_name ?? 'Unknown',
  }))

  // Fetch actors for the filter dropdown
  const { data: actors } = await supabase
    .from('profiles')
    .select('id, full_name')
    .order('full_name')

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  function buildHref(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams()
    const merged = { table, action, actor, page: String(page), ...overrides }
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v)
    }
    return `/admin/audit-log?${params.toString()}`
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <nav className="text-sm text-muted-foreground mb-1">
          <Link href="/admin" className="hover:underline">Admin</Link>
          {' / '}
          <span>Audit Log</span>
        </nav>
        <h1 className="text-xl font-semibold">Audit Log</h1>
      </div>

      {/* Filters */}
      <form method="GET" action="/admin/audit-log" className="flex flex-wrap gap-3">
        <select
          name="table"
          defaultValue={table ?? ''}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring"
        >
          <option value="">All tables</option>
          <option value="clients">Clients</option>
          <option value="visits">Visits</option>
          <option value="appointments">Appointments</option>
          <option value="profiles">Users</option>
        </select>

        <select
          name="action"
          defaultValue={action ?? ''}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring"
        >
          <option value="">All actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
        </select>

        <select
          name="actor"
          defaultValue={actor ?? ''}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring"
        >
          <option value="">All users</option>
          {(actors ?? []).map((a) => (
            <option key={a.id} value={a.id}>{a.full_name}</option>
          ))}
        </select>

        <button
          type="submit"
          className="h-8 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          Filter
        </button>
        {(table || action || actor) && (
          <Link
            href="/admin/audit-log"
            className="h-8 inline-flex items-center rounded-lg border px-3 text-sm text-muted-foreground hover:bg-muted"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Count summary */}
      <p className="text-sm text-muted-foreground">
        {count ?? 0} event{count !== 1 ? 's' : ''}
        {(table || action || actor) ? ' matching filters' : ' total'}
      </p>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium">When</th>
              <th className="px-4 py-2.5 text-left font-medium">Who</th>
              <th className="px-4 py-2.5 text-left font-medium">Action</th>
              <th className="px-4 py-2.5 text-left font-medium">Table</th>
              <th className="px-4 py-2.5 text-left font-medium">Record</th>
              <th className="px-4 py-2.5 text-left font-medium">Fields changed</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No audit events found.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5 whitespace-nowrap tabular-nums text-muted-foreground">
                    {formatDateTime(row.created_at)}
                  </td>
                  <td className="px-4 py-2.5">{row.actor_name}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ACTION_BADGE[row.action] ?? 'bg-zinc-100 text-zinc-600'}`}>
                      {row.action}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {TABLE_LABELS[row.table_name] ?? row.table_name}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                    {row.record_id.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">
                    {row.changed_fields?.join(', ') ?? '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2 text-sm">
          {page > 1 ? (
            <Link href={buildHref({ page: String(page - 1) })} className="rounded-lg border px-3 py-1.5 hover:bg-muted">
              ← Prev
            </Link>
          ) : (
            <span className="rounded-lg border px-3 py-1.5 text-muted-foreground/50">← Prev</span>
          )}
          <span className="text-muted-foreground">Page {page} of {totalPages}</span>
          {page < totalPages ? (
            <Link href={buildHref({ page: String(page + 1) })} className="rounded-lg border px-3 py-1.5 hover:bg-muted">
              Next →
            </Link>
          ) : (
            <span className="rounded-lg border px-3 py-1.5 text-muted-foreground/50">Next →</span>
          )}
        </div>
      )}
    </div>
  )
}
