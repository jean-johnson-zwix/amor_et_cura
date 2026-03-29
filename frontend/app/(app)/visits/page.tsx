import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function VisitsPage() {
  const supabase = await createClient()

  const { data: rawVisits } = await supabase
    .from('visits')
    .select('*, clients(id, first_name, last_name), service_types(name), profiles(full_name)')
    .order('visit_date', { ascending: false })
    .limit(100)

  const visits = (rawVisits ?? []).map((v) => ({
    id: v.id,
    visit_date: v.visit_date,
    duration_minutes: v.duration_minutes,
    notes: v.notes,
    client: v.clients as { id: string; first_name: string; last_name: string } | null,
    service_type_name: (v.service_types as { name: string } | null)?.name ?? '—',
    case_worker_name: (v.profiles as { full_name: string } | null)?.full_name ?? '—',
  }))

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Visits</h1>

      {visits.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No visits recorded yet.{' '}
          <Link href="/clients" className="text-primary hover:underline">
            Open a client profile
          </Link>{' '}
          to log their first visit.
        </p>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {visits.map((visit) => (
                <div key={visit.id} className="flex items-center gap-4 px-4 py-3 text-sm">
                  <span className="w-28 shrink-0 tabular-nums text-muted-foreground">
                    {formatDate(visit.visit_date)}
                  </span>
                  {visit.client ? (
                    <Link
                      href={`/clients/${visit.client.id}`}
                      className="min-w-0 truncate font-medium hover:underline"
                    >
                      {visit.client.first_name} {visit.client.last_name}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                  <span className="hidden truncate text-muted-foreground sm:block">
                    {visit.service_type_name}
                  </span>
                  <span className="ml-auto hidden shrink-0 text-xs text-muted-foreground md:block">
                    {visit.case_worker_name}
                  </span>
                  {visit.duration_minutes && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {visit.duration_minutes} min
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
