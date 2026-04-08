'use client'

import { useState, useRef } from 'react'
import { useActionState } from 'react'
import { createClient, type NewClientFormState } from './actions'
import type { FieldDefinition } from '@/types/database'
import { Camera, Globe, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

const AI_API_URL = process.env.NEXT_PUBLIC_AI_API_URL ?? 'http://localhost:8000'

const initialState: NewClientFormState = {}

const inputCls =
  'h-9 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 text-[13px] text-navy outline-none transition-all focus:border-teal focus:ring-2 focus:ring-teal/20 placeholder:text-[#9ca3af]'
const selectCls =
  'h-9 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 text-[13px] text-navy outline-none transition-all focus:border-teal focus:ring-2 focus:ring-teal/20'
const labelCls = 'mb-1 block text-[11px] font-medium text-[#6b7280]'

type BasicFields = {
  first_name: string
  last_name: string
  dob: string
  phone: string
  email: string
  address: string
}

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
          {(field.options ?? []).map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
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

export default function ClientRegistrationForm({
  serviceTypes,
  customFields,
}: {
  serviceTypes: { id: string; name: string }[]
  customFields: FieldDefinition[]
}) {
  const [state, action, isPending] = useActionState(createClient, initialState)

  const [fields, setFields] = useState<BasicFields>({
    first_name: '', last_name: '', dob: '', phone: '', email: '', address: '',
  })
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([])

  const [scanStatus, setScanStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [scanError, setScanError] = useState<string | null>(null)
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null)
  const [multilingualMode, setMultilingualMode] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function setField(key: keyof BasicFields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  async function handleScan(file: File) {
    setScanStatus('loading')
    setScanError(null)
    setDetectedLanguage(null)
    const endpoint = multilingualMode ? '/ai/multilingual-intake' : '/ai/photo-to-intake'
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch(`${AI_API_URL}${endpoint}`, { method: 'POST', body: formData })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: `Server error ${res.status}` }))
        throw new Error(err.detail ?? `Server error ${res.status}`)
      }
      const data = await res.json()
      const intake = data.intake ?? {}
      setFields({
        first_name: intake.first_name ?? '',
        last_name: intake.last_name ?? '',
        dob: intake.dob ?? '',
        phone: intake.phone ?? '',
        email: intake.email ?? '',
        address: intake.address ?? '',
      })
      if (Array.isArray(intake.programs)) {
        setSelectedPrograms(intake.programs as string[])
      }
      if (intake.detected_language) {
        setDetectedLanguage(intake.detected_language as string)
      }
      setScanStatus('done')
    } catch (err) {
      setScanError(err instanceof Error ? err.message : 'Unknown error')
      setScanStatus('error')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <form action={action} className="mx-auto max-w-2xl flex flex-col gap-4">
      {state.error && (
        <div className="rounded-lg bg-red-50 px-3 py-2.5 text-[12px] text-red-700">{state.error}</div>
      )}

      {/* AI scan card */}
      <div className="rounded-2xl bg-white shadow-sm p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-wide text-navy">Scan paper form</p>
            <p className="mt-0.5 text-[11px] text-[#6b7280]">Upload a photo of a paper intake form to pre-fill the fields below</p>
          </div>
          {scanStatus === 'done' && (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-teal/10 px-2.5 py-1 text-[11px] font-medium text-teal">
              <CheckCircle2 className="size-3.5" /> Fields pre-filled
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className={`flex cursor-pointer items-center gap-2 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 h-9 text-[13px] font-medium text-navy transition-colors ${scanStatus === 'loading' ? 'opacity-60 cursor-not-allowed' : 'hover:bg-teal-tint'}`}>
            {scanStatus === 'loading'
              ? <Loader2 className="size-4 animate-spin text-teal" />
              : <Camera className="size-4 text-teal" />}
            {scanStatus === 'loading' ? 'Scanning…' : 'Upload form photo'}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              className="sr-only"
              disabled={scanStatus === 'loading'}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleScan(file)
              }}
            />
          </label>
          <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-[#6b7280] select-none">
            <input
              type="checkbox"
              checked={multilingualMode}
              onChange={(e) => setMultilingualMode(e.target.checked)}
              className="size-4 rounded border-[#e2e8f0] accent-teal"
            />
            <Globe className="size-3.5" />
            Enable multilingual mode
          </label>
          {detectedLanguage && (
            <span className="rounded-full bg-navy/10 px-2.5 py-1 text-[11px] font-medium text-navy">
              Detected: {detectedLanguage.toUpperCase()}
            </span>
          )}
        </div>
        {scanError && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600" />
              <div className="flex-1">
                <p className="text-[12px] font-medium text-amber-800">Scan didn't complete</p>
                <p className="mt-0.5 text-[12px] text-amber-700">{scanError}</p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 rounded-md border border-amber-300 bg-white px-2.5 py-1 text-[11px] font-medium text-amber-800 hover:bg-amber-50"
              >
                Try again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Basic information */}
      <div className="rounded-2xl bg-white shadow-sm p-5">
        <div className="mb-4 border-b border-[#e2e8f0] pb-3">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-navy">Basic information</p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className={labelCls}>First name *</label>
              <input id="first_name" name="first_name" placeholder="Maria" required
                value={fields.first_name}
                onChange={(e) => setField('first_name', e.target.value)}
                aria-invalid={!!state.fieldErrors?.first_name} className={inputCls} />
              {state.fieldErrors?.first_name && (
                <p className="mt-0.5 text-[11px] text-red-600">{state.fieldErrors.first_name}</p>
              )}
            </div>
            <div>
              <label htmlFor="last_name" className={labelCls}>Last name *</label>
              <input id="last_name" name="last_name" placeholder="Garcia" required
                value={fields.last_name}
                onChange={(e) => setField('last_name', e.target.value)}
                aria-invalid={!!state.fieldErrors?.last_name} className={inputCls} />
              {state.fieldErrors?.last_name && (
                <p className="mt-0.5 text-[11px] text-red-600">{state.fieldErrors.last_name}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="dob" className={labelCls}>Date of birth</label>
              <input id="dob" name="dob" type="date"
                value={fields.dob}
                onChange={(e) => setField('dob', e.target.value)}
                className={inputCls} />
            </div>
            <div>
              <label htmlFor="language" className={labelCls}>Preferred language</label>
              <input id="language" name="language" type="text" placeholder="English" className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className={labelCls}>Phone</label>
              <input id="phone" name="phone" type="tel" placeholder="(602) 555-0100"
                value={fields.phone}
                onChange={(e) => setField('phone', e.target.value)}
                className={inputCls} />
            </div>
            <div>
              <label htmlFor="email" className={labelCls}>Email</label>
              <input id="email" name="email" type="email" placeholder="client@example.com"
                value={fields.email}
                onChange={(e) => setField('email', e.target.value)}
                className={inputCls} />
            </div>
          </div>
          <div>
            <label htmlFor="address" className={labelCls}>Address</label>
            <input id="address" name="address" placeholder="123 Main St, City, State"
              value={fields.address}
              onChange={(e) => setField('address', e.target.value)}
              className={inputCls} />
          </div>
        </div>
      </div>

      {/* Programs */}
      <div className="rounded-2xl bg-white shadow-sm p-5">
        <div className="mb-4 border-b border-[#e2e8f0] pb-3">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-navy">Programs</p>
        </div>
        <div className="flex flex-col divide-y divide-[#f1f5f9]">
          {serviceTypes.map((s) => (
            <label key={s.id}
              className="flex h-9 cursor-pointer items-center gap-2.5 transition-colors hover:bg-teal-tint px-1 rounded"
            >
              <input type="checkbox" name="programs" value={s.name}
                checked={selectedPrograms.includes(s.name)}
                onChange={(e) => {
                  setSelectedPrograms((prev) =>
                    e.target.checked ? [...prev, s.name] : prev.filter((p) => p !== s.name)
                  )
                }}
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
        <div className="rounded-2xl bg-white shadow-sm p-5">
          <div className="mb-4 border-b border-[#e2e8f0] pb-3">
            <p className="text-[13px] font-semibold uppercase tracking-wide text-navy">Additional information</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {customFields.map((field) => (
              <CustomFieldInput key={field.id} field={field} />
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
          {isPending ? 'Saving…' : 'Register client'}
        </button>
      </div>
    </form>
  )
}
