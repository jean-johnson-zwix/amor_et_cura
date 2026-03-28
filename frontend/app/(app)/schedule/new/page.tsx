import Link from 'next/link'
import AppointmentForm from './AppointmentForm'

export default async function NewAppointmentPage({
  searchParams,
}: {
  searchParams: Promise<{ client_id?: string }>
}) {
  const { client_id } = await searchParams

  return (
    <div className="flex flex-col gap-6">
      <div>
        <nav className="text-sm text-muted-foreground mb-1">
          <Link href="/schedule" className="hover:underline">Schedule</Link>
          {' / '}
          <span>New Appointment</span>
        </nav>
        <h1 className="text-xl font-semibold">Schedule an appointment</h1>
      </div>
      <AppointmentForm defaultClientId={client_id} />
    </div>
  )
}
