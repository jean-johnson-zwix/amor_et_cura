// Appointment helpers

export type AppointmentWithDetails = {
  id: string
  scheduled_at: string
  duration_minutes: number | null
  notes?: string | null
  status: 'scheduled' | 'completed' | 'cancelled'
  client_id: string
  client_name: string
  client_number: string
  case_worker_name: string
  service_type_name: string
}

export function formatTime(isoDatetime: string): string {
  const d = new Date(isoDatetime)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

export function formatDateHeading(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

export function getMondayOfWeek(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - ((day + 6) % 7))
  d.setHours(0, 0, 0, 0)
  return d.toISOString().split('T')[0]
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export function getWeekDays(monday: string): string[] {
  return Array.from({ length: 5 }, (_, i) => addDays(monday, i))
}

export function appointmentsForDate(
  appointments: AppointmentWithDetails[],
  date: string
): AppointmentWithDetails[] {
  return appointments
    .filter((a) => a.scheduled_at.startsWith(date))
    .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))
}
