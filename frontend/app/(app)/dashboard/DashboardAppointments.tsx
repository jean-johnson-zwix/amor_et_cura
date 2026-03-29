'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cancelAppointment, rescheduleAppointment } from './actions'
import { X, Clock, CheckCircle, ChevronRight } from 'lucide-react'

type Appointment = {
  id: string
  scheduled_at: string
  duration_minutes: number | null
  status: string
  client_name: string
  service_type_name: string
  case_worker_name: string
}

type Step =
  | { type: 'list' }
  | { type: 'confirm-cancel'; appt: Appointment }
  | { type: 'reschedule'; appt: Appointment }
  | { type: 'success'; message: string }

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

const btnPrimary =
  'inline-flex h-12 items-center justify-center rounded-xl px-5 text-base font-semibold text-white transition-colors disabled:opacity-60'
const btnSecondary =
  'inline-flex h-12 items-center justify-center rounded-xl border-2 border-[#e2e8f0] bg-white px-5 text-base font-semibold text-navy hover:bg-teal-tint disabled:opacity-60'

export default function DashboardAppointments({ appointments }: { appointments: Appointment[] }) {
  const [step, setStep] = useState<Step>({ type: 'list' })
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // ── Step: list ───────────────────────────────────────────────

  if (step.type === 'list') {
    return (
      <div className="rounded-2xl border border-[#e2e8f0] bg-white">
        <div className="flex items-center justify-between border-b border-[#e2e8f0] px-5 py-4">
          <p className="text-base font-bold text-navy">Today&apos;s appointments</p>
          <Link href="/services/schedule" className="inline-flex items-center gap-1 text-sm font-medium text-teal hover:underline">
            Full calendar <ChevronRight className="size-4" />
          </Link>
        </div>

        {appointments.length === 0 ? (
          <p className="px-5 py-8 text-center text-base text-[#6b7280]">
            No appointments scheduled for today.
          </p>
        ) : (
          <div className="divide-y divide-[#f1f5f9]">
            {appointments.map((appt) => (
              <div key={appt.id} className="px-5 py-4">
                {/* Appointment info */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-teal" />
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-navy">{appt.client_name}</p>
                    <p className="text-sm text-[#6b7280]">
                      {appt.service_type_name} · {formatTime(appt.scheduled_at)}
                      {appt.duration_minutes ? ` · ${appt.duration_minutes} min` : ''}
                    </p>
                  </div>
                </div>
                {/* Action buttons */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => { setError(null); setStep({ type: 'reschedule', appt }) }}
                    className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-teal px-4 text-sm font-semibold text-white hover:bg-[#009e77] transition-colors"
                  >
                    <Clock className="size-4" />
                    Pick a new time
                  </button>
                  <button
                    onClick={() => { setError(null); setStep({ type: 'confirm-cancel', appt }) }}
                    className="inline-flex h-10 items-center gap-1.5 rounded-xl border-2 border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <X className="size-4" />
                    Cancel this appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── Step: confirm-cancel ─────────────────────────────────────

  if (step.type === 'confirm-cancel') {
    const { appt } = step
    return (
      <div className="rounded-2xl border-2 border-red-200 bg-white">
        <div className="border-b border-red-100 px-5 py-4">
          <p className="text-base font-bold text-navy">Cancel this appointment?</p>
        </div>
        <div className="px-5 py-6">
          <div className="mb-6 rounded-xl bg-red-50 px-4 py-4">
            <p className="text-lg font-bold text-navy">{appt.client_name}</p>
            <p className="mt-1 text-base text-[#6b7280]">
              {appt.service_type_name}
            </p>
            <p className="text-base text-[#6b7280]">{formatDateTime(appt.scheduled_at)}</p>
          </div>

          {error && <p className="mb-4 text-base text-red-600">{error}</p>}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              disabled={isPending}
              onClick={() => {
                setError(null)
                startTransition(async () => {
                  const result = await cancelAppointment(appt.id)
                  if (result.error) {
                    setError(result.error)
                  } else {
                    setStep({ type: 'success', message: `Appointment with ${appt.client_name} has been cancelled.` })
                    router.refresh()
                  }
                })
              }}
              className={`${btnPrimary} bg-red-500 hover:bg-red-600 flex-1`}
            >
              {isPending ? 'Cancelling…' : 'Yes, cancel it'}
            </button>
            <button
              disabled={isPending}
              onClick={() => setStep({ type: 'list' })}
              className={`${btnSecondary} flex-1`}
            >
              Keep this appointment
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Step: reschedule ─────────────────────────────────────────

  if (step.type === 'reschedule') {
    const { appt } = step
    const today = new Date().toISOString().split('T')[0]
    const currentTime = new Date(appt.scheduled_at)
      .toTimeString()
      .slice(0, 5)

    return (
      <div className="rounded-2xl border-2 border-teal bg-white">
        <div className="border-b border-[#e2e8f0] px-5 py-4">
          <p className="text-base font-bold text-navy">Pick a new time</p>
          <p className="mt-0.5 text-sm text-[#6b7280]">For {appt.client_name} — {appt.service_type_name}</p>
        </div>
        <form
          className="px-5 py-6 flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            const date = fd.get('new_date') as string
            const time = fd.get('new_time') as string
            if (!date || !time) return
            const scheduledAt = `${date}T${time}:00`

            setError(null)
            startTransition(async () => {
              const result = await rescheduleAppointment(appt.id, scheduledAt)
              if (result.error) {
                setError(result.error)
              } else {
                const newDate = new Date(`${date}T${time}`)
                const label = newDate.toLocaleString('en-US', {
                  weekday: 'long', month: 'long', day: 'numeric',
                  hour: 'numeric', minute: '2-digit', hour12: true,
                })
                setStep({ type: 'success', message: `Appointment moved to ${label}.` })
                router.refresh()
              }
            })
          }}
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="new_date" className="text-base font-semibold text-navy">New date</label>
            <input
              id="new_date"
              name="new_date"
              type="date"
              required
              min={today}
              defaultValue={today}
              className="h-12 w-full rounded-xl border-2 border-[#e2e8f0] px-4 text-base text-navy outline-none focus:border-teal"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="new_time" className="text-base font-semibold text-navy">New time</label>
            <input
              id="new_time"
              name="new_time"
              type="time"
              required
              defaultValue={currentTime}
              className="h-12 w-full rounded-xl border-2 border-[#e2e8f0] px-4 text-base text-navy outline-none focus:border-teal"
            />
          </div>

          {error && <p className="text-base text-red-600">{error}</p>}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={isPending}
              className={`${btnPrimary} bg-teal hover:bg-[#009e77] flex-1`}
            >
              {isPending ? 'Saving…' : 'Set new time'}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => setStep({ type: 'list' })}
              className={`${btnSecondary} flex-1`}
            >
              Go back
            </button>
          </div>
        </form>
      </div>
    )
  }

  // ── Step: success ────────────────────────────────────────────

  if (step.type === 'success') {
    return (
      <div className="rounded-2xl border-2 border-teal bg-white px-5 py-8 text-center">
        <CheckCircle className="mx-auto mb-4 size-14 text-teal" />
        <p className="text-xl font-bold text-navy mb-2">Done!</p>
        <p className="text-base text-[#374151]">{step.message}</p>
        <button
          onClick={() => setStep({ type: 'list' })}
          className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-teal px-6 text-base font-semibold text-white hover:bg-[#009e77]"
        >
          Back to appointments
        </button>
      </div>
    )
  }

  return null
}
