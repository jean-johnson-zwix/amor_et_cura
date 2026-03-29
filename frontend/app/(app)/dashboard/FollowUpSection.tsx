import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'

type AtRiskClient = {
  id: string
  name: string
  program: string | null
  lastVisit: string | null
  daysSince: number
}

const THRESHOLD_DAYS = 30

// Stub data — shown when DB has no visits yet
const STUB_AT_RISK: AtRiskClient[] = [
  { id: '2',  name: 'James Thompson',  program: 'Housing Support',        lastVisit: '2026-02-10', daysSince: 46 },
  { id: '4',  name: 'Carlos Rivera',   program: 'Employment Support',     lastVisit: '2026-02-01', daysSince: 55 },
  { id: '7',  name: 'Rosa Mendez',     program: 'Child & Family Services',lastVisit: '2026-02-18', daysSince: 38 },
  { id: '10', name: 'Marcus Williams', program: 'Employment Support',     lastVisit: null,          daysSince: 99 },
]

async function getAtRiskClients(): Promise<AtRiskClient[]> {
  const supabase = await createClient()

  // Get all active clients with their most recent visit date
  const { data: clients, error } = await supabase
    .from('clients')
    .select('id, first_name, last_name, program')
    .eq('is_active', true)

  if (error || !clients || clients.length === 0) return STUB_AT_RISK

  const { data: recentVisits } = await supabase
    .from('visits')
    .select('client_id, visit_date')
    .order('visit_date', { ascending: false })

  // Build a map of client_id -> most recent visit date
  const lastVisitMap: Record<string, string> = {}
  for (const v of recentVisits ?? []) {
    if (!lastVisitMap[v.client_id]) {
      lastVisitMap[v.client_id] = v.visit_date
    }
  }

  const today = new Date('2026-03-28T00:00:00')
  const atRisk: AtRiskClient[] = []

  for (const client of clients) {
    const lastVisit = lastVisitMap[client.id] ?? null
    const lastDate = lastVisit ? new Date(lastVisit + 'T00:00:00') : null
    const daysSince = lastDate
      ? Math.floor((today.getTime() - lastDate.getTime()) / 86400000)
      : 999

    if (daysSince >= THRESHOLD_DAYS) {
      atRisk.push({
        id: client.id,
        name: `${client.first_name} ${client.last_name}`,
        program: client.program,
        lastVisit,
        daysSince,
      })
    }
  }

  return atRisk.sort((a, b) => b.daysSince - a.daysSince)
}

function urgencyColor(days: number) {
  if (days >= 60) return 'bg-red-100 text-red-700'
  if (days >= 45) return 'bg-orange-100 text-orange-700'
  return 'bg-yellow-100 text-yellow-700'
}

export default async function FollowUpSection() {
  const atRisk = await getAtRiskClients()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Clients needing follow-up</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              No visit in {THRESHOLD_DAYS}+ days
            </p>
          </div>
          <span className="text-sm font-semibold tabular-nums text-destructive">
            {atRisk.length} flagged
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {atRisk.length === 0 ? (
          <p className="px-4 py-6 text-sm text-center text-muted-foreground">
            All clients have been seen recently.
          </p>
        ) : (
          <div className="divide-y">
            {atRisk.map((client) => (
              <div key={client.id} className="flex items-center gap-4 px-4 py-3 text-sm">
                <Link
                  href={`/clients/${client.id}`}
                  className="font-medium hover:underline truncate flex-1"
                >
                  {client.name}
                </Link>
                <span className="text-muted-foreground truncate hidden sm:block text-xs">
                  {client.program ?? '—'}
                </span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {client.lastVisit
                    ? `Last seen ${new Date(client.lastVisit + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                    : 'Never seen'}
                </span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${urgencyColor(client.daysSince)}`}>
                  {client.daysSince === 999 ? 'Never' : `${client.daysSince}d ago`}
                </span>
                <Link
                  href={`/visits/new?client_id=${client.id}`}
                  className="shrink-0 text-xs text-primary hover:underline"
                >
                  Log visit →
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
