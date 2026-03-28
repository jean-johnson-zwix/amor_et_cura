// Appointment helpers + stub data
// TODO(#8): replace STUB_APPOINTMENTS with Supabase queries after #1 Auth lands

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

// Anchored to 2026-03-28 (today in this project)
const TODAY = '2026-03-28'

export const STUB_APPOINTMENTS: AppointmentWithDetails[] = [
  // Today
  { id: 'a-1',  scheduled_at: `${TODAY}T09:00:00`, duration_minutes: 45,  status: 'scheduled',  client_id: '1',  client_name: 'Maria Garcia',     client_number: 'CLT-00001', case_worker_name: 'Alex Rivera',   service_type_name: 'Case Management' },
  { id: 'a-2',  scheduled_at: `${TODAY}T10:30:00`, duration_minutes: 30,  status: 'scheduled',  client_id: '3',  client_name: 'Aisha Patel',      client_number: 'CLT-00003', case_worker_name: 'Jordan Kim',    service_type_name: 'Food Assistance' },
  { id: 'a-3',  scheduled_at: `${TODAY}T13:00:00`, duration_minutes: 60,  status: 'scheduled',  client_id: '5',  client_name: 'Linda Nguyen',     client_number: 'CLT-00005', case_worker_name: 'Jordan Kim',    service_type_name: 'Mental Health Services' },
  { id: 'a-4',  scheduled_at: `${TODAY}T14:30:00`, duration_minutes: 30,  status: 'scheduled',  client_id: '9',  client_name: 'Fatima Al-Hassan', client_number: 'CLT-00009', case_worker_name: 'Alex Rivera',   service_type_name: 'Medical Referral' },
  // Mon Mar 30
  { id: 'a-5',  scheduled_at: '2026-03-30T09:00:00', duration_minutes: 50,  status: 'scheduled', client_id: '2',  client_name: 'James Thompson',   client_number: 'CLT-00002', case_worker_name: 'Alex Rivera',   service_type_name: 'Housing Support' },
  { id: 'a-6',  scheduled_at: '2026-03-30T11:00:00', duration_minutes: 45,  status: 'scheduled', client_id: '4',  client_name: 'Carlos Rivera',    client_number: 'CLT-00004', case_worker_name: 'Jordan Kim',    service_type_name: 'Employment Support' },
  { id: 'a-7',  scheduled_at: '2026-03-30T14:00:00', duration_minutes: 60,  status: 'scheduled', client_id: '7',  client_name: 'Rosa Mendez',      client_number: 'CLT-00007', case_worker_name: 'Jordan Kim',    service_type_name: 'Child & Family Services' },
  // Tue Mar 31
  { id: 'a-8',  scheduled_at: '2026-03-31T10:00:00', duration_minutes: 30,  status: 'scheduled', client_id: '10', client_name: 'Marcus Williams',  client_number: 'CLT-00010', case_worker_name: 'Alex Rivera',   service_type_name: 'Employment Support' },
  { id: 'a-9',  scheduled_at: '2026-03-31T13:30:00', duration_minutes: 45,  status: 'scheduled', client_id: '6',  client_name: 'David Okonkwo',    client_number: 'CLT-00006', case_worker_name: 'Jordan Kim',    service_type_name: 'Case Management' },
  // Wed Apr 1
  { id: 'a-10', scheduled_at: '2026-04-01T09:30:00', duration_minutes: 50,  status: 'scheduled', client_id: '8',  client_name: 'Kevin Johnson',    client_number: 'CLT-00008', case_worker_name: 'Alex Rivera',   service_type_name: 'Housing Support' },
  { id: 'a-11', scheduled_at: '2026-04-01T11:30:00', duration_minutes: 25,  status: 'scheduled', client_id: '11', client_name: 'Priya Sharma',     client_number: 'CLT-00011', case_worker_name: 'Jordan Kim',    service_type_name: 'Education Support' },
  { id: 'a-12', scheduled_at: '2026-04-01T15:00:00', duration_minutes: 30,  status: 'scheduled', client_id: '12', client_name: 'Darius Mitchell',  client_number: 'CLT-00012', case_worker_name: 'Alex Rivera',   service_type_name: 'Medical Referral' },
  // Thu Apr 2
  { id: 'a-13', scheduled_at: '2026-04-02T10:00:00', duration_minutes: 60,  status: 'scheduled', client_id: '5',  client_name: 'Linda Nguyen',     client_number: 'CLT-00005', case_worker_name: 'Jordan Kim',    service_type_name: 'Mental Health Services' },
  { id: 'a-14', scheduled_at: '2026-04-02T14:00:00', duration_minutes: 45,  status: 'scheduled', client_id: '1',  client_name: 'Maria Garcia',     client_number: 'CLT-00001', case_worker_name: 'Alex Rivera',   service_type_name: 'Family Services' },
  // Fri Apr 3
  { id: 'a-15', scheduled_at: '2026-04-03T09:00:00', duration_minutes: 30,  status: 'scheduled', client_id: '3',  client_name: 'Aisha Patel',      client_number: 'CLT-00003', case_worker_name: 'Jordan Kim',    service_type_name: 'Food Assistance' },
]

export function formatTime(isoDatetime: string): string {
  const d = new Date(isoDatetime)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

export function formatDateHeading(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

export function getWeekDays(anchor: string): string[] {
  // Returns Mon–Fri of the week containing `anchor` (YYYY-MM-DD)
  const d = new Date(anchor + 'T00:00:00')
  const day = d.getDay() // 0=Sun
  const monday = new Date(d)
  monday.setDate(d.getDate() - ((day + 6) % 7))
  return Array.from({ length: 5 }, (_, i) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    return date.toISOString().split('T')[0]
  })
}

export function appointmentsForDate(
  appointments: AppointmentWithDetails[],
  date: string
): AppointmentWithDetails[] {
  return appointments
    .filter((a) => a.scheduled_at.startsWith(date))
    .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))
}
