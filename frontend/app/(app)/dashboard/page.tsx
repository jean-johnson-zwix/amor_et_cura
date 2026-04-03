import Link from 'next/link'
import { ClipboardList, UserPlus, CalendarPlus, Sun, ChevronRight } from 'lucide-react'

const ORG_NAME = process.env.NEXT_PUBLIC_ORG_NAME ?? 'our organization'
import ServiceBreakdownChart from '@/components/dashboard/ServiceBreakdownChart'
import VisitTrendChart from '@/components/dashboard/VisitTrendChart'
import { computeDashboardStats } from '@/lib/dashboard'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/supabase/session'
import DashboardAppointments from './DashboardAppointments'


const AVATAR_COLORS = ['#F2673C']

function getInitials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}


export default async function DashboardPage() {
  const supabase = await createClient()
  const session = await getSession()

  const firstName = session?.profile?.full_name?.split(' ')[0] ?? 'there'

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const tomorrowStart = new Date(todayStart)
  tomorrowStart.setDate(tomorrowStart.getDate() + 1)

  const [{ count: activeClients }, { data: rawVisits }, { data: rawAppointments }, { data: recentClients }] =
    await Promise.all([
      supabase.from('clients').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('visits').select('visit_date, service_types(name)').order('visit_date', { ascending: false }),
      supabase
        .from('appointments')
        .select('id, scheduled_at, duration_minutes, clients(first_name, last_name), service_types(name), profiles(full_name), status')
        .gte('scheduled_at', todayStart.toISOString())
        .lt('scheduled_at', tomorrowStart.toISOString())
        .neq('status', 'cancelled')
        .order('scheduled_at'),
      supabase
        .from('clients')
        .select('id, first_name, last_name, programs, is_active')
        .order('created_at', { ascending: false })
        .limit(4),
    ])

  const visits = (rawVisits ?? []).map((v) => ({
    visit_date: v.visit_date,
    service_type_name: (v.service_types as unknown as { name: string } | null)?.name ?? null,
  }))

  const todayAppointments = (rawAppointments ?? []).map((a) => ({
    id: a.id,
    scheduled_at: a.scheduled_at,
    duration_minutes: a.duration_minutes,
    status: a.status as string,
    client_name: (() => {
      const c = (a.clients as unknown as { first_name: string; last_name: string } | null)
      return c ? `${c.first_name} ${c.last_name}` : '—'
    })(),
    service_type_name: (a.service_types as unknown as { name: string } | null)?.name ?? '—',
    case_worker_name: (a.profiles as unknown as { full_name: string } | null)?.full_name ?? '—',
  }))

  const stats = computeDashboardStats(visits, activeClients ?? 0)

  return (
    <div className="flex flex-col gap-6 p-6">

      {/* ── Quick actions ──────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link
          href="/services/visits/new"
          className="flex flex-col gap-3 rounded border border-[#D1CCC8] bg-white p-5 hover:border-[#C2BAB5] hover:bg-[#F7F3EF] active:scale-[0.99] transition-all"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF0F8]">
            <ClipboardList className="size-5 text-[#F6339A]" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[15px] font-bold text-navy leading-tight">Record a Visit</p>
            <p className="mt-0.5 text-[13px] text-muted-foreground">Log today&apos;s visit</p>
          </div>
        </Link>

        <Link
          href="/clients/new"
          className="flex flex-col gap-3 rounded border border-[#D1CCC8] bg-white p-5 hover:border-[#C2BAB5] hover:bg-[#F7F3EF] active:scale-[0.99] transition-all"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF8E7]">
            <UserPlus className="size-5 text-[#B58000]" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[15px] font-bold text-navy leading-tight">Add a Client</p>
            <p className="mt-0.5 text-[13px] text-muted-foreground">Register someone new</p>
          </div>
        </Link>

        <Link
          href="/services/schedule/new"
          className="flex flex-col gap-3 rounded border border-[#D1CCC8] bg-white p-5 hover:border-[#C2BAB5] hover:bg-[#F7F3EF] active:scale-[0.99] transition-all"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F3F0FF]">
            <CalendarPlus className="size-5 text-[#8B5CF6]" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[15px] font-bold text-navy leading-tight">New Appointment</p>
            <p className="mt-0.5 text-[13px] text-muted-foreground">Schedule a session</p>
          </div>
        </Link>
      </div>

      {/* ── Charts ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="rounded border border-[#D1CCC8] bg-white p-5">
          <p className="mb-1 text-base font-bold text-navy">Visit trend</p>
          <p className="mb-4 text-sm text-muted-foreground">Visits per week over the last 8 weeks</p>
          <VisitTrendChart data={stats.visitTrend} />
        </div>
        <div className="rounded border border-[#D1CCC8] bg-white p-5">
          <p className="mb-1 text-base font-bold text-navy">What services were provided?</p>
          <p className="mb-4 text-sm text-muted-foreground">All visits grouped by service type</p>
          <ServiceBreakdownChart data={stats.serviceBreakdown} />
        </div>
      </div>

      {/* ── Bottom row ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Today's appointments — with cancel/reschedule */}
        <DashboardAppointments appointments={todayAppointments} />

        {/* Recently added clients */}
        <div className="rounded border border-[#D1CCC8] bg-white">
          <div className="flex items-center justify-between border-b border-[#D1CCC8] px-5 py-4">
            <p className="text-base font-bold text-navy">Recently added clients</p>
            <Link href="/clients" className="inline-flex items-center gap-1 text-sm font-medium text-teal hover:underline">
              View all <ChevronRight className="size-4" />
            </Link>
          </div>
          {(recentClients ?? []).length === 0 ? (
            <p className="px-5 py-8 text-center text-base text-[#6B7280]">No clients added yet.</p>
          ) : (
            <div className="divide-y divide-[#EDE9E4]">
              {(recentClients ?? []).map((c, i) => {
                const initials = getInitials(c.first_name, c.last_name)
                const color = AVATAR_COLORS[i % AVATAR_COLORS.length]
                return (
                  <div key={c.id} className="flex items-center gap-3 px-5 py-4">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ background: color }}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/clients/${c.id}`}
                        className="text-base font-semibold text-navy hover:underline truncate block"
                      >
                        {c.first_name} {c.last_name}
                      </Link>
                      <p className="text-sm text-[#6B7280] truncate">
                        {(c.programs ?? []).join(', ') || 'No programs assigned'}
                      </p>
                    </div>
                    <span
                      className="shrink-0 rounded-full px-2.5 py-1 text-sm font-medium"
                      style={
                        c.is_active
                          ? { background: '#FFF7ED', color: '#C2400A' }
                          : { background: '#F0ECE8', color: '#6B7280' }
                      }
                    >
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
