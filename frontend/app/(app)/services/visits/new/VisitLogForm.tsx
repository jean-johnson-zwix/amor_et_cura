'use client'

import { useState, useRef } from 'react'
import { useActionState } from 'react'
import { createVisit, type NewVisitFormState } from './actions'
import type { FieldDefinition } from '@/types/database'
import { ChevronLeft, Mic, Square, Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

const AI_API_URL = process.env.NEXT_PUBLIC_AI_API_URL ?? 'http://localhost:8000'

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
  const [caseNotes, setCaseNotes] = useState('')

  const [transcribeStatus, setTranscribeStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [transcribeError, setTranscribeError] = useState<string | null>(null)
  const [recordingState, setRecordingState] = useState<'idle' | 'recording'>('idle')
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function formatTime(s: number) {
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
  }

  async function startRecording() {
    setTranscribeError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const file = new File([blob], 'recording.webm', { type: 'audio/webm' })
        handleTranscribe(file)
      }
      mr.start()
      mediaRecorderRef.current = mr
      setRecordingState('recording')
      setRecordingSeconds(0)
      timerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000)
    } catch {
      setTranscribeError('Microphone access denied. Check browser permissions.')
    }
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current)
    mediaRecorderRef.current?.stop()
    setRecordingState('idle')
  }

  async function handleTranscribe(file: File) {
    setTranscribeStatus('loading')
    setTranscribeError(null)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch(`${AI_API_URL}/ai/voice-to-note`, { method: 'POST', body: formData })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: `Server error ${res.status}` }))
        throw new Error(err.detail ?? `Server error ${res.status}`)
      }
      const data = await res.json()
      const note: string = data.structured_note ?? ''
      setCaseNotes(note)
      setTranscribeStatus('done')
    } catch (err) {
      setTranscribeError(err instanceof Error ? err.message : 'Unknown error')
      setTranscribeStatus('error')
    } finally {
      if (audioInputRef.current) audioInputRef.current.value = ''
    }
  }

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
              className="inline-flex h-12 items-center justify-center gap-1.5 rounded-xl bg-teal px-6 text-base font-semibold text-white hover:bg-[#D45228]">
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
        <div className="mb-4 border-b border-[#e2e8f0] pb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-wide text-navy">Case Narrative</p>
            <p className="mt-0.5 text-[11px] text-[#6b7280]">Detailed observations, interventions, and client progress</p>
          </div>
          {transcribeStatus === 'done' && (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-teal/10 px-2.5 py-1 text-[11px] font-medium text-teal">
              <CheckCircle2 className="size-3.5" /> Note transcribed
            </span>
          )}
        </div>

        {/* Voice note */}
        <div className="mb-4 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3">
          <p className="mb-2 text-[12px] font-medium text-navy">Transcribe voice note</p>
          <p className="mb-2.5 text-[11px] text-[#6b7280]">Record live or upload an audio file — it will be transcribed and structured into a case note automatically.</p>
          <div className="flex flex-wrap items-center gap-2">
            {/* Live record button */}
            {recordingState === 'idle' ? (
              <button
                type="button"
                disabled={transcribeStatus === 'loading'}
                onClick={startRecording}
                className="flex items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-3 h-9 text-[13px] font-medium text-navy transition-colors hover:bg-teal-tint disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Mic className="size-4 text-teal" /> Record
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 h-9 text-[13px] font-medium text-red-700 transition-colors hover:bg-red-100"
              >
                <span className="size-2 rounded-full bg-red-500 animate-pulse" />
                <Square className="size-3.5 fill-red-600 text-red-600" />
                Stop — {formatTime(recordingSeconds)}
              </button>
            )}

            {/* Upload button */}
            <label className={`flex cursor-pointer items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-3 h-9 text-[13px] font-medium text-navy transition-colors ${transcribeStatus === 'loading' || recordingState === 'recording' ? 'opacity-60 cursor-not-allowed' : 'hover:bg-teal-tint'}`}>
              {transcribeStatus === 'loading'
                ? <Loader2 className="size-4 animate-spin text-teal" />
                : <Upload className="size-4 text-teal" />}
              {transcribeStatus === 'loading' ? 'Transcribing…' : 'Upload file'}
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/webm,audio/mp4"
                className="sr-only"
                disabled={transcribeStatus === 'loading' || recordingState === 'recording'}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleTranscribe(file)
                }}
              />
            </label>

            {transcribeError && (
              <div className="mt-2 w-full rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600" />
                  <div className="flex-1">
                    <p className="text-[12px] font-medium text-amber-800">Transcription didn't complete</p>
                    <p className="mt-0.5 text-[12px] text-amber-700">{transcribeError}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => audioInputRef.current?.click()}
                    className="shrink-0 rounded-md border border-amber-300 bg-white px-2.5 py-1 text-[11px] font-medium text-amber-800 hover:bg-amber-50"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="case_notes" className={labelCls}>Case narrative / Observations</label>
            <textarea
              id="case_notes"
              name="case_notes"
              rows={6}
              placeholder="Describe the client's status, services provided, notable observations, barriers encountered, and next steps…"
              value={caseNotes}
              onChange={(e) => setCaseNotes(e.target.value)}
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
          className="inline-flex h-9 items-center rounded-lg bg-teal px-5 text-[13px] font-medium text-white transition-colors hover:bg-[#D45228] disabled:opacity-60">
          {isPending ? 'Saving…' : 'Save visit'}
        </button>
      </div>
    </form>
  )
}
