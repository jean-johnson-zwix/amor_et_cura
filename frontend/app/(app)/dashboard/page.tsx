import Link from 'next/link'
import { Users, CalendarDays, Clock, Monitor, TrendingUp } from 'lucide-react'
import ServiceBreakdownChart from '@/components/dashboard/ServiceBreakdownChart'
import VisitTrendChart from '@/components/dashboard/VisitTrendChart'
import { computeDashboardStats } from '@/lib/dashboard'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/supabase/session'

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
    <div className="rounded-[14px] border border-[#e2e8f0] bg-white p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{ background: iconBg }}
        >
          <Icon className="size-4" style={{ color: iconColor }} />
        </div>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{ background: badgeBg, color: badgeColor }}
        >
          {badge}
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums text-navy">{value}</p>
      <p className="mt-0.5 text-[12px] text-[#6b7280]">{label}</p>
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
      const c = a.clients as { first_name: string; last_name: string } | null
      return c ? `${c.first_name} ${c.last_name}` : '—'
    })(),
    service_type_name: (a.service_types as { name: string } | null)?.name ?? '—',
    case_worker_name: (a.profiles as { full_name: string } | null)?.full_name ?? '—',
  }))

  const stats = computeDashboardStats(visits, activeClients ?? 0)

  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="flex flex-col gap-5 p-6">
        {/* Greeting */}
        <div>
          <h1 className="text-[18px] font-semibold text-navy">Good morning, {firstName} 👋</h1>
          <p className="mt-0.5 text-[12px] text-[#6b7280]">
            Here&apos;s what&apos;s happening at Chandler CARE Center today — {dayName}.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          <StatCard
            label="Active clients"
            value={stats.totalActiveClients}
            icon={Users}
            iconBg="#e0f7f4"
            iconColor="#00bd8e"
            badge="+0 this mo."
            badgeBg="#e0f7f4"
            badgeColor="#007b58"
          />
          <StatCard
            label="Visits this week"
            value={stats.visitsThisWeek}
            icon={TrendingUp}
            iconBg="#e0f7f4"
            iconColor="#00bd8e"
            badge="↑ this week"
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
            badge="Q1 2026"
            badgeBg="#e0f7f4"
            badgeColor="#007b58"
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
          <div className="rounded-[14px] border border-[#e2e8f0] bg-white p-4">
            <p className="mb-3 text-[13px] font-semibold text-navy">Visit trend — last 7 weeks</p>
            <VisitTrendChart data={stats.visitTrend} />
          </div>
          <div className="rounded-[14px] border border-[#e2e8f0] bg-white p-4">
            <p className="mb-3 text-[13px] font-semibold text-navy">Services breakdown</p>
            <ServiceBreakdownChart data={stats.serviceBreakdown} />
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
          {/* Today's appointments */}
          <div className="rounded-[14px] border border-[#e2e8f0] bg-white">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] px-4 py-3">
              <p className="text-[13px] font-semibold text-navy">Today&apos;s appointments</p>
              <Link href="/services/schedule" className="text-[11px] text-teal hover:underline">
                View schedule →
              </Link>
            </div>
            {todayAppointments.length === 0 ? (
              <p className="px-4 py-6 text-center text-[12px] text-[#6b7280]">
                No appointments scheduled for today.
              </p>
            ) : (
              <div className="divide-y divide-[#f1f5f9]">
                {todayAppointments.map((appt) => {
                  const time = new Date(appt.scheduled_at).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })
                  const isConfirmed = appt.status === 'confirmed'
                  return (
                    <div key={appt.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="h-2 w-2 shrink-0 rounded-full bg-teal" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-navy truncate">{appt.client_name}</p>
                        <p className="text-[11px] text-[#6b7280]">{appt.service_type_name}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className="text-[12px] text-[#6b7280] tabular-nums">{time}</span>
                        <span
                          className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                          style={
                            isConfirmed
                              ? { background: '#e0f7f4', color: '#007b58' }
                              : { background: '#fce4f0', color: '#eb3690' }
                          }
                        >
                          {isConfirmed ? 'Confirmed' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Recently added clients */}
          <div className="rounded-[14px] border border-[#e2e8f0] bg-white">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] px-4 py-3">
              <p className="text-[13px] font-semibold text-navy">Recently added clients</p>
              <Link href="/clients" className="text-[11px] text-teal hover:underline">
                View all →
              </Link>
            </div>
            {(recentClients ?? []).length === 0 ? (
              <p className="px-4 py-6 text-center text-[12px] text-[#6b7280]">No clients yet.</p>
            ) : (
              <div className="divide-y divide-[#f1f5f9]">
                {(recentClients ?? []).map((c, i) => {
                  const initials = getInitials(c.first_name, c.last_name)
                  const color = AVATAR_COLORS[i % AVATAR_COLORS.length]
                  return (
                    <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                      <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                        style={{ background: color }}
                      >
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/clients/${c.id}`}
                          className="text-[13px] font-semibold text-navy hover:underline truncate block"
                        >
                          {c.first_name} {c.last_name}
                        </Link>
                        <p className="text-[11px] text-[#6b7280] truncate">
                          {(c.programs ?? []).join(', ') || 'No programs'}
                        </p>
                      </div>
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
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
