'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createAppointment, type NewAppointmentFormState } from './actions'

const initialState: NewAppointmentFormState = {}

const inputCls =
  'h-9 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 text-[13px] text-navy outline-none transition-all focus:border-teal focus:ring-2 focus:ring-teal/20 placeholder:text-[#9ca3af]'
const selectCls =
  'h-9 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 text-[13px] text-navy outline-none transition-all focus:border-teal focus:ring-2 focus:ring-teal/20'
const labelCls = 'mb-1 block text-[11px] font-medium text-[#6b7280]'

export default function AppointmentForm({
  defaultClientId,
  clients,
  serviceTypes,
}: {
  defaultClientId?: string
  clients: { id: string; name: string; number: string }[]
  serviceTypes: { id: string; name: string }[]
}) {
  const [state, action, isPending] = useActionState(createAppointment, initialState)

  if (state.success) {
    return (
      <div className="mx-auto max-w-lg rounded-[14px] border border-[#e2e8f0] bg-white p-8 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-light mx-auto mb-3">
          <svg className="size-5 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-[15px] font-semibold text-navy">Appointment scheduled!</p>
        <div className="mt-4 flex justify-center gap-3">
          <Link href="/services/schedule"
            className="inline-flex h-9 items-center rounded-lg bg-teal px-4 text-[13px] font-medium text-white hover:bg-[#009e77]">
            View calendar
          </Link>
          <button onClick={() => window.location.reload()}
            className="inline-flex h-9 items-center rounded-lg border border-[#e2e8f0] bg-white px-4 text-[13px] font-medium text-navy hover:bg-teal-tint">
            Schedule another
          </button>
        </div>
      </div>
    )
  }

  return (
    <form action={action} className="mx-auto max-w-lg flex flex-col gap-4">
      {state.error && (
        <div className="rounded-lg bg-red-50 px-3 py-2.5 text-[12px] text-red-700">{state.error}</div>
      )}

      <div className="rounded-[14px] border border-[#e2e8f0] bg-white p-5">
        <div className="mb-4 border-b border-[#e2e8f0] pb-3">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-navy">Appointment details</p>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="client_id" className={labelCls}>Client *</label>
            <select id="client_id" name="client_id" defaultValue={defaultClientId ?? ''}
              aria-invalid={!!state.fieldErrors?.client_id} required className={selectCls}>
              <option value="">Select a client…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {state.fieldErrors?.client_id && (
              <p className="mt-0.5 text-[11px] text-red-600">{state.fieldErrors.client_id}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="service_type_id" className={labelCls}>Service type</label>
              <select id="service_type_id" name="service_type_id" className={selectCls}>
                <option value="">Select a service type…</option>
                {serviceTypes.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="duration_minutes" className={labelCls}>Duration (minutes)</label>
              <input id="duration_minutes" name="duration_minutes" type="number"
                min="15" max="480" step="15" placeholder="30" className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="scheduled_date" className={labelCls}>Date *</label>
              <input id="scheduled_date" name="scheduled_date" type="date" required
                aria-invalid={!!state.fieldErrors?.scheduled_date} className={inputCls} />
              {state.fieldErrors?.scheduled_date && (
                <p className="mt-0.5 text-[11px] text-red-600">{state.fieldErrors.scheduled_date}</p>
              )}
            </div>
            <div>
              <label htmlFor="scheduled_time" className={labelCls}>Time *</label>
              <input id="scheduled_time" name="scheduled_time" type="time" required
                aria-invalid={!!state.fieldErrors?.scheduled_time} className={inputCls} />
              {state.fieldErrors?.scheduled_time && (
                <p className="mt-0.5 text-[11px] text-red-600">{state.fieldErrors.scheduled_time}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="notes" className={labelCls}>Notes</label>
            <textarea id="notes" name="notes" rows={3}
              placeholder="Any preparation notes or reminders…"
              className="w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-[13px] text-navy outline-none transition-all placeholder:text-[#9ca3af] focus:border-teal focus:ring-2 focus:ring-teal/20 resize-y"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button type="button" onClick={() => window.history.back()}
          className="inline-flex h-9 items-center rounded-lg border border-[#e2e8f0] bg-white px-4 text-[13px] font-medium text-[#1f2937] hover:bg-teal-tint">
          Cancel
        </button>
        <button type="submit" disabled={isPending}
          className="inline-flex h-9 items-center rounded-lg bg-teal px-5 text-[13px] font-medium text-white transition-colors hover:bg-[#009e77] disabled:opacity-60">
          {isPending ? 'Scheduling…' : 'Book appointment'}
        </button>
      </div>
    </form>
  )
}
