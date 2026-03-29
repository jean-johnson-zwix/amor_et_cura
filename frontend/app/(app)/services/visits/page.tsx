import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import VisitsTable from './VisitsTable'

export default async function VisitsPage() {
  const supabase = await createClient()

  const { data: rawVisits } = await supabase
    .from('visits')
    .select('*, clients(id, first_name, last_name), service_types(name), profiles(full_name)')
    .order('visit_date', { ascending: false })
    .limit(500)

  const visits = (rawVisits ?? []).map((v) => ({
    id: v.id,
    visit_date: v.visit_date,
    duration_minutes: v.duration_minutes,
    client: v.clients as { id: string; first_name: string; last_name: string } | null,
    service_type_name: (v.service_types as { name: string } | null)?.name ?? '—',
    case_worker_name: (v.profiles as { full_name: string } | null)?.full_name ?? '—',
  }))

  const serviceTypes = Array.from(
    new Set(visits.map((v) => v.service_type_name).filter((s) => s !== '—'))
  ).sort()

  const caseWorkers = Array.from(
    new Set(visits.map((v) => v.case_worker_name).filter((w) => w !== '—'))
  ).sort()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">All Visits</h1>
        <Link
          href="/services/visits/new"
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          + Log Visit
        </Link>
      </div>

      {visits.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No visits recorded yet.{' '}
          <Link href="/clients" className="text-primary hover:underline">
            Open a client profile
          </Link>{' '}
          to log their first visit.
        </p>
      ) : (
        <VisitsTable visits={visits} serviceTypes={serviceTypes} caseWorkers={caseWorkers} />
      )}
    </div>
  )
}
