import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Client, Visit } from '@/lib/types'

// ── Stub data (replace with Supabase queries after #1 Auth lands) ──────────

const STUB_CLIENTS: Client[] = [
  { id: '1', client_number: 'CLT-00001', first_name: 'Maria', last_name: 'Garcia', dob: '1985-04-12', phone: '(602) 555-0101', email: 'mgarcia@example.com', address: '123 Main St, Chandler, AZ', program: 'Family Services', is_active: true, custom_fields: {}, created_by: null, created_at: '2026-01-10T00:00:00Z', updated_at: '2026-01-10T00:00:00Z' },
  { id: '2', client_number: 'CLT-00002', first_name: 'James', last_name: 'Thompson', dob: '1972-09-30', phone: '(602) 555-0102', email: null, address: '456 Oak Ave, Chandler, AZ', program: 'Housing Support', is_active: true, custom_fields: {}, created_by: null, created_at: '2026-01-15T00:00:00Z', updated_at: '2026-01-15T00:00:00Z' },
  { id: '3', client_number: 'CLT-00003', first_name: 'Aisha', last_name: 'Patel', dob: '1991-02-18', phone: '(602) 555-0103', email: 'apatel@example.com', address: '789 Elm Blvd, Gilbert, AZ', program: 'Food Assistance', is_active: true, custom_fields: {}, created_by: null, created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
  { id: '4', client_number: 'CLT-00004', first_name: 'Carlos', last_name: 'Rivera', dob: '1968-11-05', phone: null, email: 'crivera@example.com', address: '321 Pine St, Mesa, AZ', program: 'Employment Support', is_active: true, custom_fields: {}, created_by: null, created_at: '2026-02-01T00:00:00Z', updated_at: '2026-02-01T00:00:00Z' },
  { id: '5', client_number: 'CLT-00005', first_name: 'Linda', last_name: 'Nguyen', dob: '1999-07-22', phone: '(602) 555-0105', email: 'lnguyen@example.com', address: '654 Cedar Rd, Tempe, AZ', program: 'Mental Health Services', is_active: true, custom_fields: {}, created_by: null, created_at: '2026-02-10T00:00:00Z', updated_at: '2026-02-10T00:00:00Z' },
]


const STUB_VISITS: (Visit & { service_type_name: string; case_worker_name: string })[] = [
  { id: 'v-1', client_id: '1', case_worker_id: 'u-1', service_type_id: 'st-1', visit_date: '2026-03-20', duration_minutes: 45, notes: 'Initial intake completed. Client is seeking housing assistance for a family of 3. Referred to housing coordinator.', created_at: '2026-03-20T10:00:00Z', updated_at: '2026-03-20T10:00:00Z', service_type_name: 'Case Management', case_worker_name: 'Alex Rivera' },
  { id: 'v-2', client_id: '1', case_worker_id: 'u-2', service_type_id: 'st-2', visit_date: '2026-03-14', duration_minutes: 30, notes: 'Provided 2-week emergency food assistance. Client scheduled for follow-up pantry visit next week.', created_at: '2026-03-14T14:00:00Z', updated_at: '2026-03-14T14:00:00Z', service_type_name: 'Food Assistance', case_worker_name: 'Jordan Kim' },
  { id: 'v-3', client_id: '1', case_worker_id: 'u-1', service_type_id: 'st-4', visit_date: '2026-02-28', duration_minutes: 60, notes: 'Counseling session focused on stress management strategies. Client reported feeling overwhelmed with recent job loss.', created_at: '2026-02-28T09:30:00Z', updated_at: '2026-02-28T09:30:00Z', service_type_name: 'Mental Health Services', case_worker_name: 'Alex Rivera' },
  { id: 'v-4', client_id: '2', case_worker_id: 'u-1', service_type_id: 'st-3', visit_date: '2026-03-18', duration_minutes: 50, notes: 'Reviewed housing application status. Documents submitted to county. Awaiting response in 2–3 weeks.', created_at: '2026-03-18T11:00:00Z', updated_at: '2026-03-18T11:00:00Z', service_type_name: 'Housing Support', case_worker_name: 'Alex Rivera' },
  { id: 'v-5', client_id: '3', case_worker_id: 'u-2', service_type_id: 'st-2', visit_date: '2026-03-22', duration_minutes: 20, notes: 'Monthly food box pickup. Client requested dietary restriction accommodations (no pork). Updated record.', created_at: '2026-03-22T13:00:00Z', updated_at: '2026-03-22T13:00:00Z', service_type_name: 'Food Assistance', case_worker_name: 'Jordan Kim' },
]

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatDob(dob: string | null) {
  if (!dob) return '—'
  const date = new Date(dob + 'T00:00:00')
  const age = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
  return `${formatDate(dob)} (age ${age})`
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function ClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // TODO(#2): replace with Supabase query once auth (#1) is wired up
  const client = STUB_CLIENTS.find((c) => c.id === id)
  if (!client) notFound()

  const visits = STUB_VISITS
    .filter((v) => v.client_id === id)
    .sort((a, b) => b.visit_date.localeCompare(a.visit_date))

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Breadcrumb */}
      <div>
        <nav className="text-sm text-muted-foreground mb-1">
          <Link href="/clients" className="hover:underline">Clients</Link>
          {' / '}
          <span>{client.first_name} {client.last_name}</span>
        </nav>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">
            {client.first_name} {client.last_name}
          </h1>
          <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {client.client_number}
          </span>
          {client.is_active ? (
            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Active</span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">Inactive</span>
          )}
        </div>
      </div>

      {/* Demographics */}
      <Card>
        <CardHeader>
          <CardTitle>Demographics</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Date of birth</dt>
              <dd className="mt-0.5 font-medium">{formatDob(client.dob)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Program</dt>
              <dd className="mt-0.5 font-medium">{client.program ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd className="mt-0.5 font-medium">{client.phone ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="mt-0.5 font-medium">{client.email ?? '—'}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-muted-foreground">Address</dt>
              <dd className="mt-0.5 font-medium">{client.address ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Registered</dt>
              <dd className="mt-0.5 font-medium">{formatDate(client.created_at)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Visit History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Visit History</CardTitle>
            <div className="flex gap-2">
              <Link
                href={`/clients/${client.id}/handoff`}
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-input bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                Handoff Summary
              </Link>
              <Link
                href={`/visits/new?client_id=${client.id}`}
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
              >
                + Log Visit
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {visits.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              No visits recorded yet.
            </p>
          ) : (
            <div className="divide-y">
              {visits.map((visit) => (
                <div key={visit.id} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{visit.service_type_name}</span>
                        {visit.duration_minutes && (
                          <span className="text-xs text-muted-foreground">{visit.duration_minutes} min</span>
                        )}
                      </div>
                      {visit.notes && (
                        <p className="text-sm text-muted-foreground leading-relaxed">{visit.notes}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {visit.case_worker_name}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {formatDate(visit.visit_date)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
