import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/supabase/session'
import { can } from '@/lib/auth/permissions'
import { Topbar } from '@/components/Topbar'
import EditClientForm from './EditClientForm'

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const session = await getSession()
  if (!can.editClient(session?.profile?.role)) notFound()

  const supabase = await createClient()
  const [{ data: client }, { data: serviceTypes }, { data: fieldDefs }] = await Promise.all([
    supabase.from('clients').select('*').eq('id', id).single(),
    supabase.from('service_types').select('id, name').eq('is_active', true).order('name'),
    supabase
      .from('field_definitions')
      .select('*')
      .eq('applies_to', 'client')
      .eq('is_active', true)
      .order('sort_order')
      .order('created_at'),
  ])

  if (!client) notFound()

  return (
    <>
      <Topbar crumbs={[
        { label: 'Clients', href: '/clients' },
        { label: `${client.first_name} ${client.last_name}`, href: `/clients/${id}` },
        { label: 'Edit' },
      ]} />
      <div className="p-6">
        <EditClientForm client={client} serviceTypes={serviceTypes ?? []} customFields={fieldDefs ?? []} />
      </div>
    </>
  )
}
