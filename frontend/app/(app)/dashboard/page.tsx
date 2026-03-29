import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ServiceBreakdownChart from '@/components/dashboard/ServiceBreakdownChart'
import VisitTrendChart from '@/components/dashboard/VisitTrendChart'
import { computeDashboardStats } from '@/lib/dashboard'
import { createClient } from '@/lib/supabase/server'
import PrintButton from './PrintButton'

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="py-5 flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-3xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const tomorrowStart = new Date(todayStart)
  tomorrowStart.setDate(tomorrowStart.getDate() + 1)

  const [{ count: activeClients }, { data: rawVisits }, { data: rawAppointments }] = await Promise.all([
    supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true),
    supabase
      .from('visits')
      .select('visit_date, service_types(name)')
      .order('visit_date', { ascending: false }),
    supabase
      .from('appointments')
      .select('id, scheduled_at, duration_minutes, clients(first_name, last_name), service_types(name), profiles(full_name)')
      .gte('scheduled_at', todayStart.toISOString())
      .lt('scheduled_at', tomorrowStart.toISOString())
      .neq('status', 'cancelled')
      .order('scheduled_at'),
  ])

  const visits = (rawVisits ?? []).map((v) => ({
    visit_date: v.visit_date,
    service_type_name: (v.service_types as unknown as { name: string } | null)?.name ?? null,
  }))

  const todayAppointments = (rawAppointments ?? []).map((a) => ({
    id: a.id,
    scheduled_at: a.scheduled_at,
    duration_minutes: a.duration_minutes,
    client_name: (() => { const c = a.clients as { first_name: string; last_name: string } | null; return c ? `${c.first_name} ${c.last_name}` : '—' })(),
    service_type_name: (a.service_types as { name: string } | null)?.name ?? '—',
    case_worker_name: (a.profiles as { full_name: string } | null)?.full_name ?? '—',
  }))

  const stats = computeDashboardStats(visits, activeClients ?? 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <PrintButton />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Active clients" value={stats.totalActiveClients} />
        <StatCard label="Visits this week" value={stats.visitsThisWeek} />
        <StatCard label="Visits this month" value={stats.visitsThisMonth} />
        <StatCard label="Visits this quarter" value={stats.visitsThisQuarter} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Services by type</CardTitle>
          </CardHeader>
          <CardContent>
            <ServiceBreakdownChart data={stats.serviceBreakdown} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visit trend (by week)</CardTitle>
          </CardHeader>
          <CardContent>
            <VisitTrendChart data={stats.visitTrend} />
          </CardContent>
        </Card>
      </div>

      {/* Today's appointments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Today&apos;s appointments</CardTitle>
            <Link href="/services/schedule" className="text-xs text-primary hover:underline">
              View full schedule →
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {todayAppointments.length === 0 ? (
            <p className="px-4 py-6 text-sm text-center text-muted-foreground">
              No appointments scheduled for today.
            </p>
          ) : (
            <div className="divide-y">
              {todayAppointments.map((appt) => {
                const time = new Date(appt.scheduled_at).toLocaleTimeString('en-US', {
                  hour: 'numeric', minute: '2-digit', hour12: true,
                })
                return (
                  <div key={appt.id} className="flex items-start justify-between gap-4 px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">{appt.client_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {appt.service_type_name} · {appt.case_worker_name}
                        {appt.duration_minutes ? ` · ${appt.duration_minutes} min` : ''}
                      </span>
                    </div>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{time}</span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
