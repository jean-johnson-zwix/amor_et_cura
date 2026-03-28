// Dashboard data helpers
// TODO(#7): replace STUB_* with Supabase queries after #1 Auth lands

export type ServiceBreakdown = { name: string; count: number }
export type VisitTrend = { date: string; visits: number }
export type DashboardStats = {
  totalActiveClients: number
  visitsThisWeek: number
  visitsThisMonth: number
  visitsThisQuarter: number
  serviceBreakdown: ServiceBreakdown[]
  visitTrend: VisitTrend[]
}

// Stub visit data matching seed.sql
const STUB_VISITS: { visit_date: string; service_type: string }[] = [
  { visit_date: '2026-03-25', service_type: 'Education Support' },
  { visit_date: '2026-03-24', service_type: 'Food Assistance' },
  { visit_date: '2026-03-23', service_type: 'Child & Family Services' },
  { visit_date: '2026-03-22', service_type: 'Food Assistance' },
  { visit_date: '2026-03-21', service_type: 'Mental Health Services' },
  { visit_date: '2026-03-20', service_type: 'Case Management' },
  { visit_date: '2026-03-20', service_type: 'Medical Referral' },
  { visit_date: '2026-03-19', service_type: 'Employment Support' },
  { visit_date: '2026-03-18', service_type: 'Housing Support' },
  { visit_date: '2026-03-18', service_type: 'Employment Support' },
  { visit_date: '2026-03-17', service_type: 'Case Management' },
  { visit_date: '2026-03-16', service_type: 'Housing Support' },
  { visit_date: '2026-03-14', service_type: 'Food Assistance' },
  { visit_date: '2026-03-13', service_type: 'Medical Referral' },
  { visit_date: '2026-03-12', service_type: 'Education Support' },
  { visit_date: '2026-03-11', service_type: 'Education Support' },
  { visit_date: '2026-03-10', service_type: 'Employment Support' },
  { visit_date: '2026-03-09', service_type: 'Housing Support' },
  { visit_date: '2026-03-08', service_type: 'Transportation Assistance' },
  { visit_date: '2026-03-07', service_type: 'Mental Health Services' },
  { visit_date: '2026-03-05', service_type: 'Case Management' },
  { visit_date: '2026-03-04', service_type: 'Employment Support' },
  { visit_date: '2026-03-03', service_type: 'Legal Aid Referral' },
  { visit_date: '2026-03-01', service_type: 'Case Management' },
  { visit_date: '2026-02-28', service_type: 'Mental Health Services' },
  { visit_date: '2026-02-28', service_type: 'Case Management' },
  { visit_date: '2026-02-25', service_type: 'Case Management' },
  { visit_date: '2026-02-22', service_type: 'Case Management' },
  { visit_date: '2026-02-20', service_type: 'Child & Family Services' },
  { visit_date: '2026-02-18', service_type: 'Education Support' },
  { visit_date: '2026-02-15', service_type: 'Food Assistance' },
  { visit_date: '2026-02-10', service_type: 'Food Assistance' },
]

function startOfWeek(date: Date): Date {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function startOfQuarter(date: Date): Date {
  const month = date.getMonth()
  const quarterStart = month - (month % 3)
  return new Date(date.getFullYear(), quarterStart, 1)
}

export function getDashboardStats(today = new Date()): DashboardStats {
  const weekStart = startOfWeek(today)
  const monthStart = startOfMonth(today)
  const quarterStart = startOfQuarter(today)

  let visitsThisWeek = 0
  let visitsThisMonth = 0
  let visitsThisQuarter = 0
  const serviceCount: Record<string, number> = {}

  for (const v of STUB_VISITS) {
    const d = new Date(v.visit_date + 'T00:00:00')
    if (d >= weekStart) visitsThisWeek++
    if (d >= monthStart) visitsThisMonth++
    if (d >= quarterStart) visitsThisQuarter++
    serviceCount[v.service_type] = (serviceCount[v.service_type] ?? 0) + 1
  }

  const serviceBreakdown: ServiceBreakdown[] = Object.entries(serviceCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  // Visit trend: last 8 weeks, grouped by week starting Monday
  const trendMap: Record<string, number> = {}
  for (const v of STUB_VISITS) {
    const d = new Date(v.visit_date + 'T00:00:00')
    const weekOf = startOfWeek(d)
    const key = weekOf.toISOString().split('T')[0]
    trendMap[key] = (trendMap[key] ?? 0) + 1
  }

  const visitTrend: VisitTrend[] = Object.entries(trendMap)
    .map(([date, visits]) => ({ date, visits }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-8)
    .map(({ date, visits }) => ({
      date: new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      visits,
    }))

  return {
    totalActiveClients: 12, // matches seed.sql
    visitsThisWeek,
    visitsThisMonth,
    visitsThisQuarter,
    serviceBreakdown,
    visitTrend,
  }
}
