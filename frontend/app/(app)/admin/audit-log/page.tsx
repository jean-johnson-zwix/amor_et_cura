import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/Topbar'

const PAGE_SIZE = 50

const ACTION_BADGE: Record<string, { bg: string; text: string }> = {
  CREATE: { bg: '#e0f7f4', text: '#007b58' },
  UPDATE: { bg: '#e8ecf6', text: '#0a1e52' },
  DELETE: { bg: '#fce4f0', text: '#eb3690' },
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

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

const AVATAR_COLORS = ['#00bd8e', '#eb3690', '#3960a3', '#7b3fa8']

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ table?: string; action?: string; actor?: string; page?: string }>
}) {
  const { table, action, actor, page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10))
  const offset = (page - 1) * PAGE_SIZE

  const supabase = await createClient()

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

  const selectClass = 'h-9 rounded-lg border border-[#e2e8f0] bg-white px-2.5 text-[13px] text-[#1f2937] outline-none focus:border-teal'

  return (
    <>
      <Topbar crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Audit log' }]} />

      <div className="p-6 flex flex-col gap-4">
        {/* Filter bar */}
        <form method="GET" action="/admin/audit-log"
          className="flex flex-wrap items-center gap-3 rounded-[14px] border border-[#e2e8f0] bg-white px-4 py-3"
        >
          <select name="table" defaultValue={table ?? ''} className={selectClass}>
            <option value="">All tables</option>
            <option value="clients">Clients</option>
            <option value="visits">Visits</option>
            <option value="appointments">Appointments</option>
            <option value="profiles">Users</option>
          </select>
          <select name="action" defaultValue={action ?? ''} className={selectClass}>
            <option value="">All actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
          </select>
          <select name="actor" defaultValue={actor ?? ''} className={selectClass}>
            <option value="">All users</option>
            {(actors ?? []).map((a) => (
              <option key={a.id} value={a.id}>{a.full_name}</option>
            ))}
          </select>
          <button
            type="submit"
            className="h-9 rounded-lg bg-teal px-3 text-[13px] font-medium text-white transition-colors hover:bg-[#009e77]"
          >
            Filter
          </button>
          {(table || action || actor) && (
            <Link
              href="/admin/audit-log"
              className="inline-flex h-9 items-center rounded-lg border border-[#e2e8f0] px-3 text-[13px] text-[#6b7280] hover:bg-teal-tint"
            >
              Clear
            </Link>
          )}
        </form>

        <p className="text-[12px] text-[#6b7280]">
          {count ?? 0} event{count !== 1 ? 's' : ''}
          {(table || action || actor) ? ' matching filters' : ' total'}
        </p>

        {/* Table */}
        <div className="overflow-hidden rounded-[14px] border border-[#e2e8f0] bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e2e8f0]/50 bg-teal-tint text-left">
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.05em] text-[#6b7280]">When</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.05em] text-[#6b7280]">Who</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.05em] text-[#6b7280]">Action</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.05em] text-[#6b7280]">Table</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.05em] text-[#6b7280]">Record</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.05em] text-[#6b7280]">Fields changed</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[13px] text-[#6b7280]">
                    No audit events found.
                  </td>
                </tr>
              ) : (
                rows.map((row, i) => {
                  const badge = ACTION_BADGE[row.action] ?? { bg: '#f3f4f6', text: '#6b7280' }
                  const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length]
                  return (
                    <tr key={row.id} className="border-b border-[#f1f5f9] last:border-0 transition-colors hover:bg-teal-tint">
                      <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#6b7280] tabular-nums">
                        {formatDateTime(row.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                            style={{ background: avatarColor }}
                          >
                            {getInitials(row.actor_name)}
                          </div>
                          <span className="text-[13px] text-navy">{row.actor_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium"
                          style={{ background: badge.bg, color: badge.text }}
                        >
                          {row.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#6b7280]">
                        {TABLE_LABELS[row.table_name] ?? row.table_name}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-[#6b7280]">
                        {row.record_id.slice(0, 8)}…
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#6b7280]">
                        {row.changed_fields?.join(', ') ?? '—'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            {page > 1 ? (
              <Link href={buildHref({ page: String(page - 1) })}
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#e2e8f0] px-3 text-[13px] text-[#6b7280] hover:bg-teal-tint"
              >
                <ChevronLeft className="size-3.5" /> Prev
              </Link>
            ) : (
              <span className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#e2e8f0] px-3 text-[13px] text-[#6b7280]/40"><ChevronLeft className="size-3.5" /> Prev</span>
            )}
            <span className="text-[12px] text-[#6b7280]">Page {page} of {totalPages}</span>
            {page < totalPages ? (
              <Link href={buildHref({ page: String(page + 1) })}
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#e2e8f0] px-3 text-[13px] text-[#6b7280] hover:bg-teal-tint"
              >
                Next <ChevronRight className="size-3.5" />
              </Link>
            ) : (
              <span className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#e2e8f0] px-3 text-[13px] text-[#6b7280]/40">Next <ChevronRight className="size-3.5" /></span>
            )}
          </div>
        )}
      </div>
    </>
  )
}
