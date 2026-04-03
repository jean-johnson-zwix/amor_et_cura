import Link from 'next/link'
import { Users, CalendarDays, Clock, Monitor, TrendingUp, ClipboardList, UserPlus, CalendarPlus, Sun, ChevronRight } from 'lucide-react'

const ORG_NAME = process.env.NEXT_PUBLIC_ORG_NAME ?? 'our organization'
import ServiceBreakdownChart from '@/components/dashboard/ServiceBreakdownChart'
import VisitTrendChart from '@/components/dashboard/VisitTrendChart'
import { computeDashboardStats } from '@/lib/dashboard'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/supabase/session'
import DashboardAppointments from './DashboardAppointments'
import PendingFollowUps, { type FollowUp } from './PendingFollowUps'

const AVATAR_COLORS = ['#00bd8e', '#eb3690', '#3960a3', '#7b3fa8']

function getInitials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  badge,
  badgeBg,
  badgeColor,
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  iconBg: string
  iconColor: string
  badge: string
  badgeBg: string
  badgeColor: string
}) {
  return (
    <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5">
      <div className="flex items-start justify-between gap-2">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{ background: iconBg }}
        >
          <Icon className="size-5" style={{ color: iconColor }} />
        </div>
        <span
          className="rounded-full px-2.5 py-1 text-sm font-medium"
          style={{ background: badgeBg, color: badgeColor }}
        >
          {badge}
        </span>
      </div>
      <p className="mt-4 text-4xl font-bold tabular-nums text-navy">{value}</p>
      <p className="mt-1 text-base text-[#6b7280]">{label}</p>
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const session = await getSession()

  const firstName = session?.profile?.full_name?.split(' ')[0] ?? 'there'

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const tomorrowStart = new Date(todayStart)
  tomorrowStart.setDate(tomorrowStart.getDate() + 1)

  const [
    { count: activeClients },
    { data: rawVisits },
    { data: rawAppointments },
    { data: recentClients },
    { data: rawFollowUps },
  ] = await Promise.all([
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
    supabase
      .from('follow_ups')
      .select('id, client_id, visit_id, description, category, suggested_due_date, created_at, clients(first_name, last_name), visits(visit_date)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10),
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

  const pendingFollowUps: FollowUp[] = (rawFollowUps ?? []).map((f) => {
    const client = f.clients as unknown as { first_name: string; last_name: string } | null
    const visit = f.visits as unknown as { visit_date: string } | null
    return {
      id: f.id,
      client_id: f.client_id,
      visit_id: f.visit_id,
      description: f.description,
      category: f.category as FollowUp['category'],
      suggested_due_date: f.suggested_due_date,
      created_at: f.created_at,
      client_first_name: client?.first_name ?? '—',
      client_last_name: client?.last_name ?? '',
      visit_date: visit?.visit_date ?? '',
    }
  })

  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })


  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
          <Sun className="size-6 text-amber-400 shrink-0" />
          Good morning, {firstName}
        </h1>
        <p className="mt-1 text-base text-[#6b7280]">
          {dayName} &mdash; {ORG_NAME}
        </p>
      </div>

      {/* ── Quick actions ──────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link
          href="/services/visits/new"
          className="flex items-center gap-4 rounded-2xl bg-teal px-5 py-4 text-white shadow-sm hover:bg-[#009e77] active:scale-[0.98] transition-all min-h-[64px]"
        >
          <ClipboardList className="size-7 shrink-0" />
          <div>
            <p className="text-lg font-bold leading-tight">Record a Visit</p>
            <p className="text-sm opacity-80">Log today&apos;s visit</p>
          </div>
        </Link>

        <Link
          href="/clients/new"
          className="flex items-center gap-4 rounded-2xl bg-[#0a1e52] px-5 py-4 text-white shadow-sm hover:bg-[#1f3e80] active:scale-[0.98] transition-all min-h-[64px]"
        >
          <UserPlus className="size-7 shrink-0" />
          <div>
            <p className="text-lg font-bold leading-tight">Add a Client</p>
            <p className="text-sm opacity-80">Register someone new</p>
          </div>
        </Link>

        <Link
          href="/services/schedule/new"
          className="flex items-center gap-4 rounded-2xl bg-[#eb3690] px-5 py-4 text-white shadow-sm hover:bg-[#c92d7b] active:scale-[0.98] transition-all min-h-[64px]"
        >
          <CalendarPlus className="size-7 shrink-0" />
          <div>
            <p className="text-lg font-bold leading-tight">New Appointment</p>
            <p className="text-sm opacity-80">Schedule a session</p>
          </div>
        </Link>
      </div>

      {/* ── Stat cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Active clients"
          value={stats.totalActiveClients}
          icon={Users}
          iconBg="#e0f7f4"
          iconColor="#00bd8e"
          badge="Total"
          badgeBg="#e0f7f4"
          badgeColor="#007b58"
        />
        <StatCard
          label="Visits this week"
          value={stats.visitsThisWeek}
          icon={TrendingUp}
          iconBg="#e0f7f4"
          iconColor="#00bd8e"
          badge="This week"
          badgeBg="#e0f7f4"
          badgeColor="#007b58"
        />
        <StatCard
          label="Appointments today"
          value={todayAppointments.length}
          icon={Clock}
          iconBg="#fce4f0"
          iconColor="#eb3690"
          badge="Today"
          badgeBg="#fce4f0"
          badgeColor="#eb3690"
        />
        <StatCard
          label="Visits this month"
          value={stats.visitsThisMonth}
          icon={Monitor}
          iconBg="#e0f7f4"
          iconColor="#00bd8e"
          badge="This month"
          badgeBg="#e0f7f4"
          badgeColor="#007b58"
        />
      </div>

      {/* ── Charts ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5">
          <p className="mb-1 text-base font-bold text-navy">Visit trend</p>
          <p className="mb-4 text-sm text-[#6b7280]">Visits per week over the last 8 weeks</p>
          <VisitTrendChart data={stats.visitTrend} />
        </div>
        <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5">
          <p className="mb-1 text-base font-bold text-navy">What services were provided?</p>
          <p className="mb-4 text-sm text-[#6b7280]">All visits grouped by service type</p>
          <ServiceBreakdownChart data={stats.serviceBreakdown} />
        </div>
      </div>

      {/* ── Pending follow-ups ─────────────────────────────── */}
      <PendingFollowUps initialFollowUps={pendingFollowUps} />

      {/* ── Bottom row ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Today's appointments — with cancel/reschedule */}
        <DashboardAppointments appointments={todayAppointments} />

        {/* Recently added clients */}
        <div className="rounded-2xl border border-[#e2e8f0] bg-white">
          <div className="flex items-center justify-between border-b border-[#e2e8f0] px-5 py-4">
            <p className="text-base font-bold text-navy">Recently added clients</p>
            <Link href="/clients" className="inline-flex items-center gap-1 text-sm font-medium text-teal hover:underline">
              View all <ChevronRight className="size-4" />
            </Link>
          </div>
          {(recentClients ?? []).length === 0 ? (
            <p className="px-5 py-8 text-center text-base text-[#6b7280]">No clients added yet.</p>
          ) : (
            <div className="divide-y divide-[#f1f5f9]">
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
                      <p className="text-sm text-[#6b7280] truncate">
                        {(c.programs ?? []).join(', ') || 'No programs assigned'}
                      </p>
                    </div>
                    <span
                      className="shrink-0 rounded-full px-2.5 py-1 text-sm font-medium"
                      style={
                        c.is_active
                          ? { background: '#e0f7f4', color: '#007b58' }
                          : { background: '#f3f4f6', color: '#6b7280' }
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
