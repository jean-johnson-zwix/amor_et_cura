'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { createVisit, type NewVisitFormState } from './actions'
import type { FieldDefinition } from '@/types/database'
import { ChevronLeft } from 'lucide-react'

const initialState: NewVisitFormState = {}

const inputCls =
  'h-9 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 text-[13px] text-navy outline-none transition-all focus:border-teal focus:ring-2 focus:ring-teal/20 placeholder:text-[#9ca3af]'
const selectCls =
  'h-9 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 text-[13px] text-navy outline-none transition-all focus:border-teal focus:ring-2 focus:ring-teal/20'
const textareaCls =
  'w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-[13px] text-navy outline-none transition-all placeholder:text-[#9ca3af] focus:border-teal focus:ring-2 focus:ring-teal/20 resize-y'
const labelCls = 'mb-1 block text-[11px] font-medium text-[#6b7280]'

function CustomFieldInput({ field }: { field: FieldDefinition }) {
  const inputName = `cf_${field.name}`
  const labelText = field.label + (field.required ? ' *' : '')

  if (field.field_type === 'boolean') {
    return (
      <div className="flex items-center gap-2">
        <input type="checkbox" id={inputName} name={inputName} className="size-4 rounded border-[#e2e8f0] accent-teal" />
        <label htmlFor={inputName} className="text-[13px] text-navy">{labelText}</label>
      </div>
    )
  }
  if (field.field_type === 'select') {
    return (
      <div>
        <label htmlFor={inputName} className={labelCls}>{labelText}</label>
        <select id={inputName} name={inputName} required={field.required} className={selectCls}>
          <option value="">Select…</option>
          {(field.options ?? []).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
    )
  }
  if (field.field_type === 'multiselect') {
    return (
      <div>
        <p className={labelCls}>{labelText}</p>
        <div className="flex flex-wrap gap-3 pt-1">
          {(field.options ?? []).map((opt) => (
            <label key={opt} className="flex items-center gap-1.5 text-[13px] text-navy">
              <input type="checkbox" name={inputName} value={opt} className="size-4 rounded border-[#e2e8f0] accent-teal" />
              {opt}
            </label>
          ))}
        </div>
      </div>
    )
  }
  const inputType = field.field_type === 'number' ? 'number' : field.field_type === 'date' ? 'date' : 'text'
  return (
    <div>
      <label htmlFor={inputName} className={labelCls}>{labelText}</label>
      <input id={inputName} name={inputName} type={inputType} required={field.required} className={inputCls} />
    </div>
  )
}

export default function VisitLogForm({
  clientId,
  clientName,
  allClients,
  serviceTypes,
  customFields,
}: {
  clientId: string | null
  clientName: string | null
  allClients: { id: string; name: string }[]
  serviceTypes: { id: string; name: string }[]
  customFields: FieldDefinition[]
}) {
  const [state, action, isPending] = useActionState(createVisit, initialState)
  const [referralMade, setReferralMade] = useState(false)

  if (state.success) {
    return (
      <div className="mx-auto max-w-2xl rounded-[14px] border-2 border-teal bg-white p-10 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-teal mx-auto mb-5">
          <svg className="size-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-3xl font-bold text-navy mb-2">Visit recorded!</p>
        <p className="text-lg text-[#6b7280] mb-8">The visit has been saved successfully.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {clientId && (
            <a href={`/clients/${clientId}`}
              className="inline-flex h-12 items-center justify-center gap-1.5 rounded-xl bg-teal px-6 text-base font-semibold text-white hover:bg-[#009e77]">
              <ChevronLeft className="size-4" /> Back to {clientName}
            </a>
          )}
          <button onClick={() => window.location.reload()}
            className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-[#e2e8f0] bg-white px-6 text-base font-semibold text-navy hover:bg-teal-tint">
            Record another visit
          </button>
        </div>
      </div>
    )
  }

  return (
    <form action={action} className="mx-auto max-w-2xl flex flex-col gap-4">
      {clientId && <input type="hidden" name="client_id" value={clientId} />}

      {state.error && (
        <div className="rounded-lg bg-red-50 px-3 py-2.5 text-[12px] text-red-700">{state.error}</div>
      )}

      {/* ── Visit basics ─────────────────────────────────────── */}
      <div className="rounded-[14px] border border-[#e2e8f0] bg-white p-5">
        <div className="mb-4 border-b border-[#e2e8f0] pb-3">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-navy">
            {clientName ? `Visit for ${clientName}` : 'Log a visit'}
          </p>
        </div>
        <div className="flex flex-col gap-4">
          {!clientId && (
            <div>
              <label htmlFor="client_id" className={labelCls}>Client *</label>
              <select id="client_id" name="client_id" required className={selectCls}>
                <option value="">Select a client…</option>
                {allClients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="visit_date" className={labelCls}>Visit date *</label>
              <input id="visit_date" name="visit_date" type="date" required
                defaultValue={new Date().toISOString().split('T')[0]}
                aria-invalid={!!state.fieldErrors?.visit_date} className={inputCls} />
              {state.fieldErrors?.visit_date && (
                <p className="mt-0.5 text-[11px] text-red-600">{state.fieldErrors.visit_date}</p>
              )}
            </div>
            <div>
              <label htmlFor="duration_minutes" className={labelCls}>Duration (minutes)</label>
              <input id="duration_minutes" name="duration_minutes" type="number"
                min="1" max="480" placeholder="30" className={inputCls} />
            </div>
          </div>

          <div>
            <label htmlFor="service_type_id" className={labelCls}>Service type</label>
            <select id="service_type_id" name="service_type_id" className={selectCls}>
              <option value="">Select a service type…</option>
              {serviceTypes.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Case narrative ───────────────────────────────────── */}
      <div className="rounded-[14px] border border-[#e2e8f0] bg-white p-5">
        <div className="mb-4 border-b border-[#e2e8f0] pb-3">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-navy">Case Narrative</p>
          <p className="mt-0.5 text-[11px] text-[#6b7280]">Detailed observations, interventions, and client progress</p>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="case_notes" className={labelCls}>Case narrative / Observations</label>
            <textarea
              id="case_notes"
              name="case_notes"
              rows={6}
              placeholder="Describe the client's status, services provided, notable observations, barriers encountered, and next steps…"
              className={textareaCls}
            />
          </div>

          <div>
            <label htmlFor="notes" className={labelCls}>Brief summary / internal notes</label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              placeholder="Short summary visible in visit lists…"
              className={textareaCls}
            />
          </div>

          {/* Referral section */}
          <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="referral_made"
                checked={referralMade}
                onChange={(e) => setReferralMade(e.target.checked)}
                className="size-4 rounded border-[#e2e8f0] accent-teal"
              />
              <label htmlFor="referral_made" className="text-[13px] font-medium text-navy">
                Referral made during this visit
              </label>
            </div>
            {referralMade && (
              <div className="mt-3">
                <label htmlFor="referral_to" className={labelCls}>Referred to *</label>
                <input
                  id="referral_to"
                  name="referral_to"
                  type="text"
                  required
                  placeholder="e.g. Mental Health Services, Housing Authority…"
                  className={inputCls}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Custom fields ────────────────────────────────────── */}
      {customFields.length > 0 && (
        <div className="rounded-[14px] border border-[#e2e8f0] bg-white p-5">
          <div className="mb-4 border-b border-[#e2e8f0] pb-3">
            <p className="text-[13px] font-semibold uppercase tracking-wide text-navy">Additional Information</p>
          </div>
          <div className="flex flex-col gap-4">
            {customFields.map((field) => <CustomFieldInput key={field.id} field={field} />)}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button type="button" onClick={() => window.history.back()}
          className="inline-flex h-9 items-center rounded-lg border border-[#e2e8f0] bg-white px-4 text-[13px] font-medium text-[#1f2937] hover:bg-teal-tint">
          Cancel
        </button>
        <button type="submit" disabled={isPending}
          className="inline-flex h-9 items-center rounded-lg bg-teal px-5 text-[13px] font-medium text-white transition-colors hover:bg-[#009e77] disabled:opacity-60">
          {isPending ? 'Saving…' : 'Save visit'}
        </button>
      </div>
    </form>
  )
}
