import Link from 'next/link'
import { notFound } from 'next/navigation'
import VisitLogForm from './VisitLogForm'
import { createClient } from '@/lib/supabase/server'

export default async function NewVisitPage({
  searchParams,
}: {
  searchParams: Promise<{ client_id?: string }>
}) {
  const { client_id } = await searchParams

  if (!client_id) notFound()

  const supabase = await createClient()
  const { data: client } = await supabase
    .from('clients')
    .select('id, first_name, last_name')
    .eq('id', client_id)
    .single()

  if (!client) notFound()

  const { data: serviceTypes } = await supabase
    .from('service_types')
    .select('id, name')
    .eq('is_active', true)
    .order('name')

  return (
    <div className="flex flex-col gap-6">
      <div>
        <nav className="text-sm text-muted-foreground mb-1">
          <Link href="/clients" className="hover:underline">Clients</Link>
          {' / '}
          <Link href={`/clients/${client_id}`} className="hover:underline">{client.name}</Link>
          {' / '}
          <span>Log Visit</span>
        </nav>
        <h1 className="text-xl font-semibold">Log a visit</h1>
      </div>
      <VisitLogForm
        clientId={client.id}
        clientName={`${client.first_name} ${client.last_name}`}
        serviceTypes={serviceTypes ?? []}
      />
    </div>
  )
}
