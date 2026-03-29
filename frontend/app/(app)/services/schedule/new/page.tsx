import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/Topbar'
import AppointmentForm from './AppointmentForm'

export default async function NewAppointmentPage({
  searchParams,
}: {
  searchParams: Promise<{ client_id?: string }>
}) {
  const { client_id } = await searchParams
  const supabase = await createClient()

  const [{ data: clients }, { data: serviceTypes }] = await Promise.all([
    supabase
      .from('clients')
      .select('id, first_name, last_name, client_number')
      .eq('is_active', true)
      .order('last_name'),
    supabase.from('service_types').select('id, name').order('name'),
  ])

  return (
    <>
      <Topbar crumbs={[
        { label: 'Services' },
        { label: 'Schedule', href: '/services/schedule' },
        { label: 'New appointment' },
      ]} />
      <div className="p-6">
        <AppointmentForm
          defaultClientId={client_id}
          clients={(clients ?? []).map((c) => ({
            id: c.id,
            name: `${c.first_name} ${c.last_name}`,
            number: c.client_number,
          }))}
          serviceTypes={serviceTypes ?? []}
        />
      </div>
    </>
  )
}
