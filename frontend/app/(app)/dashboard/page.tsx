import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ServiceBreakdownChart from '@/components/dashboard/ServiceBreakdownChart'
import VisitTrendChart from '@/components/dashboard/VisitTrendChart'
import { getDashboardStats } from '@/lib/dashboard'

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <button
          onClick={() => window.print()}
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-input bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted print:hidden"
        >
          Print / Save PDF
        </button>
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

      <p className="text-xs text-muted-foreground print:hidden">
        Data is stubbed — live figures will appear after Supabase is connected (issue #7).
      </p>
    </div>
  )
}
