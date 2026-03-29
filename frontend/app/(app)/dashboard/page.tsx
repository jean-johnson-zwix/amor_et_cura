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

  const [{ count: activeClients }, { data: rawVisits }] = await Promise.all([
    supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true),
    supabase
      .from('visits')
      .select('visit_date, service_types(name)')
      .order('visit_date', { ascending: false }),
  ])

  const visits = (rawVisits ?? []).map((v) => ({
    visit_date: v.visit_date,
    service_type_name: (v.service_types as unknown as { name: string } | null)?.name ?? null,
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

      {/* Today's appointments — wired in issue #8 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Today&apos;s appointments</CardTitle>
            <Link href="/services/schedule" className="text-xs text-primary hover:underline">
              View full schedule →
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <p className="py-2 text-sm text-center text-muted-foreground">
            No appointments scheduled.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
