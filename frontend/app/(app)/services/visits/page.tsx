import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/Topbar'
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
    <>
      <Topbar
        crumbs={[{ label: 'Services' }, { label: 'Visits' }]}
        actions={
          <Link
            href="/services/visits/new"
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-teal px-3 text-[13px] font-medium text-white transition-colors hover:bg-[#009e77]"
          >
            + Log Visit
          </Link>
        }
      />

      <div className="p-6">
        {visits.length === 0 ? (
          <p className="text-[13px] text-[#6b7280]">
            No visits recorded yet.{' '}
            <Link href="/clients" className="text-teal hover:underline">
              Open a client profile
            </Link>{' '}
            to log their first visit.
          </p>
        ) : (
          <VisitsTable visits={visits} serviceTypes={serviceTypes} caseWorkers={caseWorkers} />
        )}
      </div>
    </>
  )
}
