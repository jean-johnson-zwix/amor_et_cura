import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
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
    supabase
      .from('service_types')
      .select('id, name')
      .order('name'),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <nav className="text-sm text-muted-foreground mb-1">
          <Link href="/services/schedule" className="hover:underline">Calendar</Link>
          {' / '}
          <span>New Appointment</span>
        </nav>
        <h1 className="text-xl font-semibold">Schedule an appointment</h1>
      </div>
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
  )
}
