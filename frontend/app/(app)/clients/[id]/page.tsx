import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Topbar } from '@/components/Topbar'
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

function getInitials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}

function LabelValue({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-3 border-b border-[#f1f5f9] last:border-0">
      <dt className="text-[12px] text-[#6b7280]">{label}</dt>
      <dd className="text-[13px] font-semibold text-navy">{value}</dd>
    </div>
  )
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

  const clientName = `${client.first_name} ${client.last_name}`

  return (
    <>
      <Topbar
        crumbs={[{ label: 'Clients', href: '/clients' }, { label: clientName }]}
        actions={
          <ClientActions
            clientId={client.id}
            isActive={client.is_active}
            canEdit={can.editClient(session?.profile?.role)}
            canDeactivate={can.deactivateClient(session?.profile?.role)}
          />
        }
      />

      <div className="p-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Left column (2/3) */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            {/* Profile header card */}
            <div className="rounded-[14px] border border-[#e2e8f0] bg-white p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-teal text-[18px] font-semibold text-white">
                  {getInitials(client.first_name, client.last_name)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-[20px] font-semibold text-navy">{clientName}</h1>
                    {client.is_active ? (
                      <span className="rounded-full bg-teal-light px-2 py-0.5 text-[10px] font-medium text-[#007b58]">Active</span>
                    ) : (
                      <span className="rounded-full bg-[#f3f4f6] px-2 py-0.5 text-[10px] font-medium text-[#6b7280]">Inactive</span>
                    )}
                  </div>
                  {client.dob && (
                    <p className="mt-0.5 text-[12px] text-[#6b7280]">{formatDob(client.dob)}</p>
                  )}
                  {(client.programs ?? []).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(client.programs ?? []).map((p: string) => (
                        <span key={p} className="rounded bg-teal-light px-1.5 py-0.5 text-[10px] font-medium text-[#007b58]" style={{ borderRadius: 4 }}>
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Demographics card */}
            <div className="rounded-[14px] border border-[#e2e8f0] bg-white px-5 pt-4 pb-1">
              <p className="mb-1 text-[13px] font-semibold text-navy">Demographics</p>
              <dl>
                <LabelValue label="Date of birth" value={formatDob(client.dob)} />
                <LabelValue label="Phone" value={client.phone ?? '—'} />
                <LabelValue label="Email" value={client.email ?? '—'} />
                <LabelValue label="Address" value={client.address ?? '—'} />
                <LabelValue label="Registered" value={formatDate(client.created_at)} />
              </dl>
            </div>

            {/* Custom fields card */}
            {activeCustomFields.length > 0 && (
              <div className="rounded-[14px] border border-[#e2e8f0] bg-white px-5 pt-4 pb-1">
                <p className="mb-1 text-[13px] font-semibold text-navy">Additional information</p>
                <dl>
                  {activeCustomFields.map((field) => {
                    const raw = (client.custom_fields as Record<string, unknown>)[field.name]
                    const display = Array.isArray(raw) ? raw.join(', ') : String(raw ?? '—')
                    return <LabelValue key={field.id} label={field.label} value={display || '—'} />
                  })}
                </dl>
              </div>
            )}
          </div>

          {/* Right column (1/3) */}
          <div className="flex flex-col gap-4">
            {/* Visit history */}
            <div className="rounded-[14px] border border-[#e2e8f0] bg-white">
              <div className="flex items-center justify-between border-b border-[#e2e8f0] px-4 py-3">
                <p className="text-[13px] font-semibold text-navy">Visit history</p>
                <Link
                  href={`/services/visits/new?client_id=${client.id}`}
                  className="text-[11px] text-teal hover:underline"
                >
                  Log new visit →
                </Link>
              </div>
              {visits.length === 0 ? (
                <p className="px-4 py-6 text-center text-[12px] text-[#6b7280]">No visits recorded yet.</p>
              ) : (
                <div className="divide-y divide-[#f1f5f9]">
                  {visits.map((visit) => (
                    <div key={visit.id} className="flex items-start gap-3 px-4 py-3">
                      <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-navy">{visit.service_type_name}</p>
                        {visit.notes && (
                          <p className="truncate text-[12px] text-[#6b7280]">{visit.notes}</p>
                        )}
                        <p className="mt-0.5 text-[11px] text-[#6b7280]">{visit.case_worker_name}</p>
                      </div>
                      <span className="shrink-0 text-[11px] text-[#6b7280] tabular-nums">
                        {formatDate(visit.visit_date)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
