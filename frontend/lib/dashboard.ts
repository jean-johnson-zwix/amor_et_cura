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

export function computeDashboardStats(
  visits: { visit_date: string; service_type_name: string | null }[],
  totalActiveClients: number,
  today = new Date()
): DashboardStats {
  const weekStart = startOfWeek(today)
  const monthStart = startOfMonth(today)
  const quarterStart = startOfQuarter(today)

  let visitsThisWeek = 0
  let visitsThisMonth = 0
  let visitsThisQuarter = 0
  const serviceCount: Record<string, number> = {}
  const trendMap: Record<string, number> = {}

  for (const v of visits) {
    const d = new Date(v.visit_date + 'T00:00:00')
    if (d >= weekStart) visitsThisWeek++
    if (d >= monthStart) visitsThisMonth++
    if (d >= quarterStart) visitsThisQuarter++

    const serviceName = v.service_type_name ?? 'Other'
    serviceCount[serviceName] = (serviceCount[serviceName] ?? 0) + 1

    const weekOf = startOfWeek(d)
    const key = weekOf.toISOString().split('T')[0]
    trendMap[key] = (trendMap[key] ?? 0) + 1
  }

  const serviceBreakdown: ServiceBreakdown[] = Object.entries(serviceCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  const visitTrend: VisitTrend[] = Object.entries(trendMap)
    .map(([date, visits]) => ({ date, visits }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-8)
    .map(({ date, visits }) => ({
      date: new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      visits,
    }))

  return {
    totalActiveClients,
    visitsThisWeek,
    visitsThisMonth,
    visitsThisQuarter,
    serviceBreakdown,
    visitTrend,
  }
}
