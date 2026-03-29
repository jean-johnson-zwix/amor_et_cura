import { Suspense } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ServiceBreakdownChart from '@/components/dashboard/ServiceBreakdownChart'
import VisitTrendChart from '@/components/dashboard/VisitTrendChart'
import { getDashboardStats } from '@/lib/dashboard'
import { STUB_APPOINTMENTS, appointmentsForDate, formatTime } from '@/lib/appointments'
import PrintButton from './PrintButton'
import FollowUpSection from './FollowUpSection'

const TODAY = '2026-03-28'

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

export default function DashboardPage() {
  // TODO(#7): replace getDashboardStats() with Supabase queries after #1 Auth lands
  const stats = getDashboardStats()
  const todayAppts = appointmentsForDate(STUB_APPOINTMENTS, TODAY)

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

      {/* Upcoming appointments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Today&apos;s appointments</CardTitle>
            <Link
              href="/schedule"
              className="text-xs text-primary hover:underline"
            >
              View full schedule →
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {todayAppts.length === 0 ? (
            <p className="px-4 py-6 text-sm text-center text-muted-foreground">No appointments today.</p>
          ) : (
            <div className="divide-y">
              {todayAppts.map((appt) => (
                <div key={appt.id} className="flex items-center gap-4 px-4 py-3 text-sm">
                  <span className="w-20 shrink-0 font-medium tabular-nums text-muted-foreground">
                    {formatTime(appt.scheduled_at)}
                  </span>
                  <Link href={`/clients/${appt.client_id}`} className="font-medium hover:underline truncate">
                    {appt.client_name}
                  </Link>
                  <span className="text-muted-foreground truncate hidden sm:block">{appt.service_type_name}</span>
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">{appt.case_worker_name}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Follow-up alerts */}
      <Suspense fallback={<div className="h-32 animate-pulse rounded-xl bg-muted" />}>
        <FollowUpSection />
      </Suspense>

      <p className="text-xs text-muted-foreground print:hidden">
        Stats and appointments use stub data — live figures will appear after Supabase is connected (issues #7, #8).
      </p>
    </div>
  )
}
