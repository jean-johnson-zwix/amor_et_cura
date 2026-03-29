import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/Topbar'
import VisitLogForm from './VisitLogForm'

export default async function NewVisitPage({
  searchParams,
}: {
  searchParams: Promise<{ client_id?: string }>
}) {
  const { client_id } = await searchParams
  const supabase = await createClient()

  const [clientResult, { data: serviceTypes }, { data: fieldDefs }, { data: clients }] =
    await Promise.all([
      client_id
        ? supabase.from('clients').select('first_name, last_name').eq('id', client_id).single()
        : Promise.resolve({ data: null, error: null }),
      supabase.from('service_types').select('id, name').order('name'),
      supabase
        .from('field_definitions')
        .select('*')
        .eq('applies_to', 'visit')
        .eq('is_active', true)
        .order('sort_order')
        .order('created_at'),
      supabase
        .from('clients')
        .select('id, first_name, last_name')
        .eq('is_active', true)
        .order('last_name'),
    ])

  const prefilledClient = clientResult.data
  const clientName = prefilledClient
    ? `${prefilledClient.first_name} ${prefilledClient.last_name}`
    : null

  const crumbs = client_id && clientName
    ? [
        { label: 'Clients', href: '/clients' },
        { label: clientName, href: `/clients/${client_id}` },
        { label: 'Log visit' },
      ]
    : [{ label: 'Services' }, { label: 'Visits', href: '/services/visits' }, { label: 'Log visit' }]

  return (
    <>
      <Topbar crumbs={crumbs} />
      <div className="p-6">
        <VisitLogForm
          clientId={client_id ?? null}
          clientName={clientName}
          allClients={(clients ?? []).map((c) => ({
            id: c.id,
            name: `${c.first_name} ${c.last_name}`,
          }))}
          serviceTypes={serviceTypes ?? []}
          customFields={fieldDefs ?? []}
        />
      </div>
    </>
  )
}
