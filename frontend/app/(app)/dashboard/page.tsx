import Link from 'next/link'
import { LayoutDashboard, ClipboardList, UserPlus, CalendarPlus, ChevronRight, MessageSquare, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/supabase/session'
import DashboardSearchBar from './DashboardSearchBar'

const URGENCY_STYLES = {
  high:   { bg: '#FEE2E2', color: '#DC2626', label: 'High' },
  medium: { bg: '#FFF7ED', color: '#C2400A', label: 'Normal' },
  low:    { bg: '#F0ECE8', color: '#6B7280', label: 'Low' },
}

const AVATAR_COLORS = ['#F2673C', '#8B5CF6', '#059669', '#B58000']

function getInitials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}

function timeAgo(isoDate: string) {
  const diff = Date.now() - new Date(isoDate).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} min${mins !== 1 ? 's' : ''} ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  return `${days} day${days !== 1 ? 's' : ''} ago`
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const session = await getSession()

  const firstName = session?.profile?.full_name?.split(' ')[0] ?? 'there'

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const tomorrowStart = new Date(todayStart)
  tomorrowStart.setDate(tomorrowStart.getDate() + 1)

  const [{ data: rawAppointments }, { data: rawTasks }, { data: rawRecentVisits }] =
    await Promise.all([
      supabase
        .from('appointments')
        .select('id, scheduled_at, clients(first_name, last_name), status')
        .gte('scheduled_at', todayStart.toISOString())
        .lt('scheduled_at', tomorrowStart.toISOString())
        .neq('status', 'cancelled')
        .order('scheduled_at'),
      supabase
        .from('follow_ups')
        .select('id, client_id, description, urgency, clients(first_name, last_name)')
        .eq('status', 'active')
        .order('suggested_due_date', { ascending: true, nullsFirst: false })
        .limit(5),
      supabase
        .from('visits')
        .select('client_id, visit_date, clients(id, first_name, last_name)')
        .order('visit_date', { ascending: false })
        .limit(20),
    ])

  const todayAppointments = (rawAppointments ?? []).map((a) => ({
    id: a.id,
    scheduled_at: a.scheduled_at,
    client_name: (() => {
      const c = a.clients as unknown as { first_name: string; last_name: string } | null
      return c ? `${c.first_name} ${c.last_name}` : '—'
    })(),
  }))

  const pendingTasks = (rawTasks ?? []).map((t) => {
    const client = t.clients as unknown as { first_name: string; last_name: string } | null
    return {
      id: t.id,
      client_id: t.client_id,
      description: t.description,
      urgency: (t.urgency ?? 'medium') as 'high' | 'medium' | 'low',
      client_first_name: client?.first_name ?? '—',
      client_last_name: client?.last_name ?? '',
    }
  })

  const seenClientIds = new Set<string>()
  const recentlyInteracted: { id: string; first_name: string; last_name: string; visit_date: string }[] = []
  for (const v of rawRecentVisits ?? []) {
    const c = v.clients as unknown as { id: string; first_name: string; last_name: string } | null
    if (!c || seenClientIds.has(c.id)) continue
    seenClientIds.add(c.id)
    recentlyInteracted.push({ id: c.id, first_name: c.first_name, last_name: c.last_name, visit_date: v.visit_date })
    if (recentlyInteracted.length >= 4) break
  }

  return (
    <div className="flex flex-col gap-6 p-6">

      <h1 className="flex items-center gap-2 text-2xl font-bold text-navy">
            <LayoutDashboard className="size-6 text-teal shrink-0" />
            Dashboard
          </h1>

      {/* ── Search ─────────────────────────────────────────── */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Quick Search</p>
        <DashboardSearchBar />
      </div>

      {/* ── Quick actions ──────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/services/visits/new"
          className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF0F8]">
              <ClipboardList className="size-6 text-pink" strokeWidth={1.5} />
            </div>
            <p className="text-[15px] font-bold text-navy">Log a Visit</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal">
            <ArrowRight className="size-4 text-white" />
          </div>
        </Link>

        <Link
          href="/clients/new"
          className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF8E7]">
              <UserPlus className="size-6 text-[#B58000]" strokeWidth={1.5} />
            </div>
            <p className="text-[15px] font-bold text-navy">Add New Client</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal">
            <ArrowRight className="size-4 text-white" />
          </div>
        </Link>

        <Link
          href="/services/schedule/new"
          className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-light">
              <CalendarPlus className="size-6 text-pink-accent" strokeWidth={1.5} />
            </div>
            <p className="text-[15px] font-bold text-navy">Schedule Appointment</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal">
            <ArrowRight className="size-4 text-white" />
          </div>
        </Link>
      </div>

      {/* ── Panels ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* Today's Schedule */}
        <div className="rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#F0ECE8] px-5 py-4">
            <p className="text-base font-bold text-navy">Today&apos;s Schedule</p>
            <Link href="/services/schedule" className="inline-flex items-center gap-1 text-sm font-medium text-teal hover:underline">
              Full calendar <ChevronRight className="size-4" />
            </Link>
          </div>
          {todayAppointments.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">No appointments scheduled for today.</p>
          ) : (
            <div className="divide-y divide-[#F0ECE8]">
              {todayAppointments.map((a) => (
                <div key={a.id} className="px-5 py-4">
                  <p className="text-sm text-navy">
                    <span className="font-medium">{formatTime(a.scheduled_at)}</span>
                    {' — '}{a.client_name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Tasks */}
        <div className="rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#F0ECE8] px-5 py-4">
            <p className="text-base font-bold text-navy">Pending Tasks</p>
            <Link href="/tasks" className="inline-flex items-center gap-1 text-sm font-medium text-teal hover:underline">
              View all <ChevronRight className="size-4" />
            </Link>
          </div>
          {pendingTasks.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">No active tasks right now.</p>
          ) : (
            <div className="divide-y divide-[#F0ECE8]">
              {pendingTasks.map((task) => {
                const style = URGENCY_STYLES[task.urgency]
                return (
                  <div key={task.id} className="flex items-center justify-between gap-3 px-5 py-4">
                    <p className="min-w-0 flex-1 truncate text-sm text-navy">{task.description}</p>
                    <span
                      className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={{ background: style.bg, color: style.color }}
                    >
                      {style.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recently Interacted */}
        <div className="rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#F0ECE8] px-5 py-4">
            <p className="text-base font-bold text-navy">Recent Clients</p>
            <Link href="/clients" className="inline-flex items-center gap-1 text-sm font-medium text-teal hover:underline">
              View all <ChevronRight className="size-4" />
            </Link>
          </div>
          {recentlyInteracted.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">No recent visits.</p>
          ) : (
            <div className="divide-y divide-[#F0ECE8]">
              {recentlyInteracted.map((c, i) => (
                <div key={c.id} className="flex items-center gap-3 px-5 py-4">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                  >
                    {getInitials(c.first_name, c.last_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/clients/${c.id}`}
                      className="block truncate text-sm font-semibold text-navy hover:underline"
                    >
                      {c.first_name} {c.last_name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{timeAgo(c.visit_date + 'T12:00:00')}</p>
                  </div>
                  <Link
                    href={`/clients/${c.id}`}
                    className="shrink-0 text-muted-foreground hover:text-teal transition-colors"
                  >
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
