'use client'

import { useActionState } from 'react'
import { updateClient, type EditClientFormState } from '../actions'
import type { Client, FieldDefinition } from '@/types/database'

const initialState: EditClientFormState = {}

const inputCls =
  'h-9 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 text-[13px] text-navy outline-none transition-all focus:border-teal focus:ring-2 focus:ring-teal/20 placeholder:text-[#9ca3af]'
const selectCls =
  'h-9 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 text-[13px] text-navy outline-none transition-all focus:border-teal focus:ring-2 focus:ring-teal/20'
const labelCls = 'mb-1 block text-[11px] font-medium text-[#6b7280]'

function CustomFieldInput({ field, existing }: { field: FieldDefinition; existing: unknown }) {
  const inputName = `cf_${field.name}`
  const labelText = field.label + (field.required ? ' *' : '')

  if (field.field_type === 'boolean') {
    return (
      <div className="flex items-center gap-2">
        <input type="checkbox" id={inputName} name={inputName} defaultChecked={!!existing}
          className="size-4 rounded border-[#e2e8f0] accent-teal" />
        <label htmlFor={inputName} className="text-[13px] text-navy">{labelText}</label>
      </div>
    )
  }

  if (field.field_type === 'select') {
    return (
      <div>
        <label htmlFor={inputName} className={labelCls}>{labelText}</label>
        <select id={inputName} name={inputName} required={field.required}
          defaultValue={typeof existing === 'string' ? existing : ''} className={selectCls}>
          <option value="">Select…</option>
          {(field.options ?? []).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
    )
  }

  if (field.field_type === 'multiselect') {
    const selected = Array.isArray(existing) ? (existing as string[]) : []
    return (
      <div>
        <p className={labelCls}>{labelText}</p>
        <div className="flex flex-wrap gap-3 pt-1">
          {(field.options ?? []).map((opt) => (
            <label key={opt} className="flex items-center gap-1.5 text-[13px] text-navy">
              <input type="checkbox" name={inputName} value={opt} defaultChecked={selected.includes(opt)}
                className="size-4 rounded border-[#e2e8f0] accent-teal" />
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
      <input id={inputName} name={inputName} type={inputType} required={field.required}
        defaultValue={existing != null ? String(existing) : ''} className={inputCls} />
    </div>
  )
}

export default function EditClientForm({
  client,
  serviceTypes,
  customFields,
}: {
  client: Client
  serviceTypes: { id: string; name: string }[]
  customFields: FieldDefinition[]
}) {
  const [state, action, isPending] = useActionState(updateClient, initialState)
  const cf = (client.custom_fields ?? {}) as Record<string, unknown>

  return (
    <form action={action} className="mx-auto max-w-2xl flex flex-col gap-4">
      <input type="hidden" name="client_id" value={client.id} />

      {state.error && (
        <div className="rounded-lg bg-red-50 px-3 py-2.5 text-[12px] text-red-700">{state.error}</div>
      )}

      {/* Basic information */}
      <div className="rounded-[14px] border border-[#e2e8f0] bg-white p-5">
        <div className="mb-4 border-b border-[#e2e8f0] pb-3">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-navy">Basic information</p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className={labelCls}>First name *</label>
              <input id="first_name" name="first_name" defaultValue={client.first_name} required
                aria-invalid={!!state.fieldErrors?.first_name} className={inputCls} />
              {state.fieldErrors?.first_name && (
                <p className="mt-0.5 text-[11px] text-red-600">{state.fieldErrors.first_name}</p>
              )}
            </div>
            <div>
              <label htmlFor="last_name" className={labelCls}>Last name *</label>
              <input id="last_name" name="last_name" defaultValue={client.last_name} required
                aria-invalid={!!state.fieldErrors?.last_name} className={inputCls} />
              {state.fieldErrors?.last_name && (
                <p className="mt-0.5 text-[11px] text-red-600">{state.fieldErrors.last_name}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="dob" className={labelCls}>Date of birth</label>
              <input id="dob" name="dob" type="date" defaultValue={client.dob ?? ''} className={inputCls} />
            </div>
            <div>
              <label htmlFor="language" className={labelCls}>Preferred language</label>
              <input id="language" name="language" type="text"
                defaultValue={(client as any).language}
                placeholder="English" className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className={labelCls}>Phone</label>
              <input id="phone" name="phone" type="tel" defaultValue={client.phone ?? ''} className={inputCls} />
            </div>
            <div>
              <label htmlFor="email" className={labelCls}>Email</label>
              <input id="email" name="email" type="email" defaultValue={client.email ?? ''} className={inputCls} />
            </div>
          </div>
          <div>
            <label htmlFor="address" className={labelCls}>Address</label>
            <input id="address" name="address" defaultValue={client.address ?? ''} className={inputCls} />
          </div>
        </div>
      </div>

      {/* Programs */}
      <div className="rounded-[14px] border border-[#e2e8f0] bg-white p-5">
        <div className="mb-4 border-b border-[#e2e8f0] pb-3">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-navy">Programs</p>
        </div>
        <div className="flex flex-col divide-y divide-[#f1f5f9]">
          {serviceTypes.map((s) => (
            <label key={s.id}
              className="flex h-9 cursor-pointer items-center gap-2.5 px-1 rounded transition-colors hover:bg-teal-tint">
              <input type="checkbox" name="programs" value={s.name}
                defaultChecked={(client.programs ?? []).includes(s.name)}
                className="size-4 rounded border-[#e2e8f0] accent-teal" />
              <span className="text-[13px] text-navy">{s.name}</span>
            </label>
          ))}
          {serviceTypes.length === 0 && (
            <p className="text-[12px] text-[#6b7280]">No programs configured yet.</p>
          )}
        </div>
      </div>

      {/* Custom fields */}
      {customFields.length > 0 && (
        <div className="rounded-[14px] border border-[#e2e8f0] bg-white p-5">
          <div className="mb-4 border-b border-[#e2e8f0] pb-3">
            <p className="text-[13px] font-semibold uppercase tracking-wide text-navy">Additional information</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {customFields.map((field) => (
              <CustomFieldInput key={field.id} field={field} existing={cf[field.name]} />
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => window.history.back()}
          className="inline-flex h-9 items-center rounded-lg border border-[#e2e8f0] bg-white px-4 text-[13px] font-medium text-[#1f2937] hover:bg-teal-tint">
          Cancel
        </button>
        <button type="submit" disabled={isPending}
          className="inline-flex h-9 items-center rounded-lg bg-teal px-5 text-[13px] font-medium text-white transition-colors hover:bg-[#D45228] disabled:opacity-60">
          {isPending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}
