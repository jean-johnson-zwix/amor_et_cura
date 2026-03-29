import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/supabase/session'
import { can } from '@/lib/auth/permissions'
import ClientActions from './ClientActions'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatDob(dob: string | null) {
  if (!dob) return '—'
  const date = new Date(dob + 'T00:00:00')
  const age = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
  return `${formatDate(dob)} (age ${age})`
}

export default async function ClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [session, supabase] = await Promise.all([getSession(), createClient()])

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (!client) notFound()

  const [{ data: rawVisits }, { data: fieldDefs }] = await Promise.all([
    supabase
      .from('visits')
      .select('*, service_types(name), profiles(full_name)')
      .eq('client_id', id)
      .order('visit_date', { ascending: false }),
    supabase
      .from('field_definitions')
      .select('*')
      .eq('applies_to', 'client')
      .eq('is_active', true)
      .order('sort_order')
      .order('created_at'),
  ])

  const activeCustomFields = (fieldDefs ?? []).filter(
    (f) => client.custom_fields && f.name in client.custom_fields
  )

  const visits = (rawVisits ?? []).map((v) => ({
    ...v,
    service_type_name: (v.service_types as { name: string } | null)?.name ?? '—',
    case_worker_name: (v.profiles as { full_name: string } | null)?.full_name ?? '—',
  }))

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Breadcrumb */}
      <div>
        <nav className="text-sm text-muted-foreground mb-1">
          <Link href="/clients" className="hover:underline">Clients</Link>
          {' / '}
          <span>{client.first_name} {client.last_name}</span>
        </nav>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">
              {client.first_name} {client.last_name}
            </h1>
            {client.is_active ? (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Active</span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">Inactive</span>
            )}
          </div>
          <ClientActions
            clientId={client.id}
            isActive={client.is_active}
            canEdit={can.editClient(session?.profile?.role)}
            canDeactivate={can.deactivateClient(session?.profile?.role)}
          />
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
              <dt className="text-muted-foreground">Programs</dt>
              <dd className="mt-0.5 font-medium">{(client.programs ?? []).length > 0 ? (client.programs ?? []).join(', ') : '—'}</dd>
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

            {activeCustomFields.map((field) => {
              const raw = (client.custom_fields as Record<string, unknown>)[field.name]
              const display = Array.isArray(raw) ? raw.join(', ') : String(raw ?? '—')
              return (
                <div key={field.id}>
                  <dt className="text-muted-foreground">{field.label}</dt>
                  <dd className="mt-0.5 font-medium">{display || '—'}</dd>
                </div>
              )
            })}
          </dl>
        </CardContent>
      </Card>

      {/* Visit History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Visit History</CardTitle>
            <Link
              href={`/services/visits/new?client_id=${client.id}`}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
            >
              + Log Visit
            </Link>
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
