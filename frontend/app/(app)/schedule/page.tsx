import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import {
  getWeekDays,
  getMondayOfWeek,
  addDays,
  appointmentsForDate,
  formatTime,
  formatDateHeading,
  type AppointmentWithDetails,
} from '@/lib/appointments'

function AppointmentChip({ appt }: { appt: AppointmentWithDetails }) {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-2 text-xs flex flex-col gap-0.5 hover:bg-primary/10 transition-colors">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-foreground">{formatTime(appt.scheduled_at)}</span>
        {appt.duration_minutes && (
          <span className="text-muted-foreground">{appt.duration_minutes}m</span>
        )}
      </div>
      <Link href={`/clients/${appt.client_id}`} className="font-medium text-primary hover:underline truncate">
        {appt.client_name}
      </Link>
      <span className="text-muted-foreground truncate">{appt.service_type_name}</span>
      <span className="text-muted-foreground truncate">{appt.case_worker_name}</span>
    </div>
  )
}

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>
}) {
  const { week } = await searchParams
  const today = new Date().toISOString().split('T')[0]
  const monday = week ?? getMondayOfWeek(new Date())
  const nextMonday = addDays(monday, 7)
  const prevMonday = addDays(monday, -7)
  const weekDays = getWeekDays(monday)

  const supabase = await createClient()
  const { data: rawAppts } = await supabase
    .from('appointments')
    .select('*, clients(id, first_name, last_name, client_number), profiles(full_name), service_types(name)')
    .gte('scheduled_at', `${monday}T00:00:00`)
    .lt('scheduled_at', `${nextMonday}T00:00:00`)
    .order('scheduled_at')

  const appointments: AppointmentWithDetails[] = (rawAppts ?? []).map((a) => {
    const client = a.clients as { id: string; first_name: string; last_name: string; client_number: string } | null
    return {
      id: a.id,
      scheduled_at: a.scheduled_at,
      duration_minutes: a.duration_minutes,
      notes: a.notes,
      status: a.status,
      client_id: a.client_id,
      client_name: client ? `${client.first_name} ${client.last_name}` : '—',
      client_number: client?.client_number ?? '',
      case_worker_name: (a.profiles as { full_name: string } | null)?.full_name ?? '—',
      service_type_name: (a.service_types as { name: string } | null)?.name ?? '—',
    }
  })

  const todayAppts = appointmentsForDate(appointments, today)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Schedule</h1>
          <p className="text-sm text-muted-foreground">Week of {formatDateHeading(weekDays[0])}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/schedule?week=${prevMonday}`}
            className="inline-flex h-8 items-center justify-center rounded-lg border border-input bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            ← Prev
          </Link>
          <Link
            href="/schedule"
            className="inline-flex h-8 items-center justify-center rounded-lg border border-input bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            Today
          </Link>
          <Link
            href={`/schedule?week=${nextMonday}`}
            className="inline-flex h-8 items-center justify-center rounded-lg border border-input bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            Next →
          </Link>
          <Link
            href="/schedule/new"
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          >
            + New Appointment
          </Link>
        </div>
      </div>

      {/* Today's appointments — quick view (only shown on current week) */}
      {monday === getMondayOfWeek(new Date()) && todayAppts.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Today</h2>
          <div className="flex flex-col gap-2">
            {todayAppts.map((appt) => (
              <div key={appt.id} className="flex items-center gap-4 rounded-lg border bg-card px-4 py-3 text-sm">
                <span className="w-20 shrink-0 font-medium tabular-nums">{formatTime(appt.scheduled_at)}</span>
                <Link href={`/clients/${appt.client_id}`} className="min-w-0 truncate font-medium hover:underline">
                  {appt.client_name}
                </Link>
                <span className="hidden min-w-0 truncate text-muted-foreground sm:block">{appt.service_type_name}</span>
                {appt.duration_minutes && (
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">{appt.duration_minutes} min</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Week view grid */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">This Week</h2>
        <div className="grid grid-cols-5 gap-3">
          {weekDays.map((date) => {
            const appts = appointmentsForDate(appointments, date)
            const isToday = date === today
            return (
              <div key={date} className="flex flex-col gap-2">
                <div className={`border-b pb-1 text-xs font-medium ${isToday ? 'border-primary text-primary' : 'border-border text-muted-foreground'}`}>
                  {formatDateHeading(date)}
                </div>
                {appts.length === 0 ? (
                  <p className="text-xs italic text-muted-foreground">No appointments</p>
                ) : (
                  appts.map((appt) => <AppointmentChip key={appt.id} appt={appt} />)
                )}
              </div>
            )
          })}
        </div>
      </div>

      {appointments.length === 0 && (
        <Card>
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            No appointments this week.{' '}
            <Link href="/schedule/new" className="text-primary hover:underline">
              Schedule one →
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
