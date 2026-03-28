import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import {
  STUB_APPOINTMENTS,
  getWeekDays,
  appointmentsForDate,
  formatTime,
  formatDateHeading,
  type AppointmentWithDetails,
} from '@/lib/appointments'

const TODAY = '2026-03-28'

function AppointmentChip({ appt }: { appt: AppointmentWithDetails }) {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-2 text-xs flex flex-col gap-0.5 hover:bg-primary/10 transition-colors">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-foreground">{formatTime(appt.scheduled_at)}</span>
        {appt.duration_minutes && (
          <span className="text-muted-foreground">{appt.duration_minutes}m</span>
        )}
      </div>
      <Link
        href={`/clients/${appt.client_id}`}
        className="font-medium text-primary hover:underline truncate"
      >
        {appt.client_name}
      </Link>
      <span className="text-muted-foreground truncate">{appt.service_type_name}</span>
      <span className="text-muted-foreground truncate">{appt.case_worker_name}</span>
    </div>
  )
}

export default function SchedulePage() {
  // TODO(#8): replace with Supabase query after #1 Auth lands
  const weekDays = getWeekDays(TODAY)
  const todayAppts = appointmentsForDate(STUB_APPOINTMENTS, TODAY)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Schedule</h1>
          <p className="text-sm text-muted-foreground">Week of {formatDateHeading(weekDays[0])}</p>
        </div>
        <Link
          href="/schedule/new"
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          + New Appointment
        </Link>
      </div>

      {/* Today's appointments — quick view */}
      {todayAppts.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Today</h2>
          <div className="flex flex-col gap-2">
            {todayAppts.map((appt) => (
              <div
                key={appt.id}
                className="flex items-center gap-4 rounded-lg border bg-card px-4 py-3 text-sm"
              >
                <span className="w-20 shrink-0 font-medium tabular-nums">{formatTime(appt.scheduled_at)}</span>
                <Link href={`/clients/${appt.client_id}`} className="font-medium hover:underline min-w-0 truncate">
                  {appt.client_name}
                </Link>
                <span className="text-muted-foreground min-w-0 truncate hidden sm:block">{appt.service_type_name}</span>
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
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">This Week</h2>
        <div className="grid grid-cols-5 gap-3">
          {weekDays.map((date) => {
            const appts = appointmentsForDate(STUB_APPOINTMENTS, date)
            const isToday = date === TODAY
            return (
              <div key={date} className="flex flex-col gap-2">
                <div className={`text-xs font-medium pb-1 border-b ${isToday ? 'text-primary border-primary' : 'text-muted-foreground border-border'}`}>
                  {formatDateHeading(date)}
                </div>
                {appts.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No appointments</p>
                ) : (
                  appts.map((appt) => (
                    <AppointmentChip key={appt.id} appt={appt} />
                  ))
                )}
              </div>
            )
          })}
        </div>
      </div>

      <Card>
        <CardContent className="py-3">
          <p className="text-xs text-muted-foreground">
            Showing stub appointments — live data will appear after Supabase is connected (issue #8).
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
