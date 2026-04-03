import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Topbar } from '@/components/Topbar'
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

const SERVICE_RULES: Array<{ match: string; bg: string; text: string }> = [
  { match: 'food',       bg: '#FFFBEB', text: '#D97706' },  // amber
  { match: 'case',       bg: '#FFF7ED', text: '#C2400A' },  // primary orange
  { match: 'counsel',    bg: '#FFF0F8', text: '#C4006A' },  // pink
  { match: 'mental',     bg: '#FFF0F8', text: '#C4006A' },  // pink
  { match: 'housing',    bg: '#FFFBEB', text: '#D97706' },  // amber
  { match: 'employ',     bg: '#FFF7ED', text: '#C2400A' },  // primary orange
  { match: 'education',  bg: '#FFF7ED', text: '#C2400A' },  // primary orange
  { match: 'medical',    bg: '#FEF2F2', text: '#DC2626' },  // danger red
  { match: 'transport',  bg: '#FFFBEB', text: '#D97706' },  // amber
  { match: 'child',      bg: '#FFF0F8', text: '#C4006A' },  // pink
  { match: 'legal',      bg: '#FEF2F2', text: '#DC2626' },  // danger red
]

function getServiceColor(name: string) {
  const lower = name.toLowerCase()
  const rule = SERVICE_RULES.find((r) => lower.includes(r.match))
  return rule ?? { bg: '#FFF7ED', text: '#C2400A' }
}

function AppointmentChip({ appt }: { appt: AppointmentWithDetails }) {
  const { bg, text } = getServiceColor(appt.service_type_name)
  return (
    <div
      className="rounded-lg px-2 py-1.5 text-xs flex flex-col gap-0.5 transition-opacity hover:opacity-90"
      style={{ background: bg }}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="font-medium tabular-nums" style={{ color: text }}>{formatTime(appt.scheduled_at)}</span>
        {appt.duration_minutes && (
          <span className="text-[10px]" style={{ color: text }}>{appt.duration_minutes}m</span>
        )}
      </div>
      <Link
        href={`/clients/${appt.client_id}`}
        className="font-semibold truncate hover:underline"
        style={{ color: text, fontSize: 11 }}
      >
        {appt.client_name}
      </Link>
      <span className="truncate text-[10px]" style={{ color: text, opacity: 0.8 }}>
        {appt.service_type_name}
      </span>
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

  const weekLabel = `${formatDateHeading(weekDays[0])} – ${formatDateHeading(weekDays[6])}`

  return (
    <>
      <Topbar
        crumbs={[{ label: 'Services' }, { label: 'Schedule' }]}
        actions={
          <Link
            href="/services/schedule/new"
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-teal px-3 text-[13px] font-medium text-white transition-colors hover:bg-[#D45228]"
          >
            + New appointment
          </Link>
        }
      />

      <div className="p-6 flex flex-col gap-4">
        {/* Week navigation row */}
        <div className="flex items-center justify-center gap-3">
          <Link
            href={`/services/schedule?week=${prevMonday}`}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-[#e2e8f0] bg-white px-3 text-[13px] font-medium text-[#1f2937] transition-colors hover:bg-teal-tint"
          >
            <ChevronLeft className="size-4" />
          </Link>
          <span className="text-[14px] font-semibold text-navy">{weekLabel}</span>
          <Link
            href={`/services/schedule?week=${nextMonday}`}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-[#e2e8f0] bg-white px-3 text-[13px] font-medium text-[#1f2937] transition-colors hover:bg-teal-tint"
          >
            <ChevronRight className="size-4" />
          </Link>
        </div>

        {/* Calendar grid */}
        <div className="overflow-hidden rounded-[14px] border border-[#e2e8f0] bg-white">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-[#e2e8f0]">
            {weekDays.map((date) => {
              const isToday = date === today
              return (
                <div
                  key={date}
                  className="px-2 py-2.5 text-center text-[11px] font-medium text-[#6b7280]"
                  style={isToday ? { background: '#F0FDF4' } : {}}
                >
                  {formatDateHeading(date)}
                </div>
              )
            })}
          </div>
          {/* Day columns */}
          <div className="grid grid-cols-7 divide-x divide-[#f1f5f9] min-h-[240px]">
            {weekDays.map((date) => {
              const appts = appointmentsForDate(appointments, date)
              const isToday = date === today
              return (
                <div
                  key={date}
                  className="flex flex-col gap-1.5 p-2"
                  style={isToday ? { background: '#f4fbf9' } : {}}
                >
                  {appts.length === 0 ? (
                    <p className="text-[11px] italic text-[#9ca3af]">No appointments</p>
                  ) : (
                    appts.map((appt) => <AppointmentChip key={appt.id} appt={appt} />)
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {appointments.length === 0 && (
          <p className="text-center text-[13px] text-[#6b7280]">
            No appointments this week.{' '}
            <Link href="/services/schedule/new" className="inline-flex items-center gap-0.5 text-teal hover:underline">
              Schedule one <ChevronRight className="size-3.5" />
            </Link>
          </p>
        )}
      </div>
    </>
  )
}
