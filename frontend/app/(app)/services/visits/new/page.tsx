import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import VisitLogForm from './VisitLogForm'

export default async function NewVisitPage({
  searchParams,
}: {
  searchParams: Promise<{ client_id?: string }>
}) {
  const { client_id } = await searchParams

  if (!client_id) notFound()

  const supabase = await createClient()

  const [{ data: client }, { data: serviceTypes }, { data: fieldDefs }] = await Promise.all([
    supabase
      .from('clients')
      .select('first_name, last_name')
      .eq('id', client_id)
      .single(),
    supabase
      .from('service_types')
      .select('id, name')
      .order('name'),
    supabase
      .from('field_definitions')
      .select('*')
      .eq('applies_to', 'visit')
      .eq('is_active', true)
      .order('sort_order')
      .order('created_at'),
  ])

  if (!client) notFound()

  const clientName = `${client.first_name} ${client.last_name}`

  return (
    <div className="flex flex-col gap-6">
      <div>
        <nav className="text-sm text-muted-foreground mb-1">
          <Link href="/clients" className="hover:underline">Clients</Link>
          {' / '}
          <Link href={`/clients/${client_id}`} className="hover:underline">{clientName}</Link>
          {' / '}
          <span>Log Visit</span>
        </nav>
        <h1 className="text-xl font-semibold">Log a visit</h1>
      </div>
      <VisitLogForm
        clientId={client_id}
        clientName={clientName}
        serviceTypes={serviceTypes ?? []}
        customFields={fieldDefs ?? []}
      />
    </div>
  )
}
