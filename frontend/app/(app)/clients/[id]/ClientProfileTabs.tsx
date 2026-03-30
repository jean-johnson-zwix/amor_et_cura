'use client'

import { useState, useRef, useTransition } from 'react'
import ReactMarkdown from 'react-markdown'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { linkFamilyMember } from './actions'
import type { Client, FieldDefinition, Document } from '@/types/database'
import {
  FileText,
  Upload,
  Users,
  CalendarDays,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Download,
  Paperclip,
  UserPlus,
  ArrowRight,
  X,
} from 'lucide-react'
import { ClientSummaryPanel } from './ClientSummary'

// ── Local types ──────────────────────────────────────────────

type VisitRow = {
  id: string
  visit_date: string
  duration_minutes: number | null
  notes: string | null
  case_notes: string | null
  referral_to: string | null
  service_type_name: string
  case_worker_name: string
}

type AppointmentRow = {
  id: string
  scheduled_at: string
  duration_minutes: number | null
  notes: string | null
  status: 'scheduled' | 'completed' | 'cancelled'
  service_type_name: string
  case_worker_name: string
}

type HouseholdMember = {
  id: string
  first_name: string
  last_name: string
  client_number: string
}

// ── Helpers ──────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

function formatDob(dob: string | null) {
  if (!dob) return '—'
  const date = new Date(dob + 'T00:00:00')
  const age = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
  return `${formatDate(dob)} (age ${age})`
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

// ── Subcomponents ─────────────────────────────────────────────

function LabelValue({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-3 border-b border-[#f1f5f9] last:border-0">
      <dt className="text-[12px] text-[#6b7280]">{label}</dt>
      <dd className="text-[13px] font-semibold text-navy">{value}</dd>
    </div>
  )
}

function ExpandableText({ text, limit = 220 }: { text: string; limit?: number }) {
  const [expanded, setExpanded] = useState(false)
  const needsTruncation = text.length > limit
  const displayText = needsTruncation && !expanded ? text.slice(0, limit) + '…' : text

  return (
    <div>
      <div className="prose prose-sm max-w-none text-[13px] text-[#374151] leading-relaxed
        [&_h3]:text-[12px] [&_h3]:font-semibold [&_h3]:uppercase [&_h3]:tracking-wide [&_h3]:text-navy [&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:first:mt-0
        [&_p]:mb-1.5 [&_p]:last:mb-0
        [&_ul]:pl-4 [&_ul]:mb-1.5 [&_li]:mb-0.5
        [&_strong]:font-semibold [&_strong]:text-navy">
        <ReactMarkdown>{displayText}</ReactMarkdown>
      </div>
      {needsTruncation && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 flex items-center gap-0.5 text-[11px] font-medium text-teal hover:underline"
        >
          {expanded ? (
            <><ChevronUp className="size-3" /> Show less</>
          ) : (
            <><ChevronDown className="size-3" /> Show more</>
          )}
        </button>
      )}
    </div>
  )
}

// ── Link Family Member modal ──────────────────────────────────

function LinkFamilyMemberModal({
  clientId,
  allClients,
  onClose,
}: {
  clientId: string
  allClients: HouseholdMember[]
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const [linking, setLinking] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const filtered = allClients.filter((c) => {
    const name = `${c.first_name} ${c.last_name}`.toLowerCase()
    return name.includes(query.toLowerCase()) || c.client_number.toLowerCase().includes(query.toLowerCase())
  })

  async function handleLink(memberId: string) {
    setLinking(memberId)
    setError(null)
    try {
      const result = await linkFamilyMember(clientId, memberId)
      if (result?.error) {
        setError(result.error)
      } else {
        router.refresh()
        onClose()
      }
    } catch {
      setError('Failed to link family member.')
    } finally {
      setLinking(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-[14px] border border-[#e2e8f0] bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#e2e8f0] px-4 py-3">
          <p className="text-[13px] font-semibold text-navy">Link Family Member</p>
          <button onClick={onClose} className="text-[#6b7280] hover:text-navy">
            <X className="size-4" />
          </button>
        </div>
        <div className="p-4">
          <input
            autoFocus
            type="text"
            placeholder="Search by name or ID…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 text-[13px] text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 placeholder:text-[#9ca3af]"
          />
          {error && <p className="mt-2 text-[11px] text-red-600">{error}</p>}
          <div className="mt-2 max-h-52 overflow-y-auto">
            {query.length < 1 ? (
              <p className="py-4 text-center text-[12px] text-[#6b7280]">Type to search clients…</p>
            ) : filtered.length === 0 ? (
              <p className="py-4 text-center text-[12px] text-[#6b7280]">No clients found.</p>
            ) : (
              filtered.slice(0, 20).map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-[#f1f5f9] last:border-0">
                  <div>
                    <p className="text-[13px] font-medium text-navy">{c.first_name} {c.last_name}</p>
                    <p className="text-[11px] text-[#6b7280]">{c.client_number}</p>
                  </div>
                  <button
                    onClick={() => handleLink(c.id)}
                    disabled={linking === c.id}
                    className="inline-flex h-7 items-center rounded-lg bg-teal px-3 text-[11px] font-medium text-white hover:bg-[#009e77] disabled:opacity-50"
                  >
                    {linking === c.id ? 'Linking…' : 'Link'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Tab helpers ───────────────────────────────────────────────

const TABS = [
  { id: 'overview',     label: 'Overview',        icon: Users },
  { id: 'case-notes',   label: 'Case Notes',       icon: ClipboardList },
  { id: 'documents',    label: 'Documents',        icon: FileText },
  { id: 'appointments', label: 'Appointments',     icon: CalendarDays },
] as const

type TabId = (typeof TABS)[number]['id']

// ── Main component ────────────────────────────────────────────

type SummaryRow = {
  id: string
  summary_text: string
  generated_at: string
  confirmed_at: string | null
  visit_count_at_generation: number
}

export default function ClientProfileTabs({
  client,
  customFields,
  visits,
  appointments,
  documents: initialDocuments,
  householdMembers,
  allActiveClients,
  existingSummary,
  canLogVisit,
  canUploadDocuments,
  canDeleteDocuments,
  canLinkFamily,
}: {
  client: Client
  customFields: FieldDefinition[]
  visits: VisitRow[]
  appointments: AppointmentRow[]
  documents: Document[]
  householdMembers: HouseholdMember[]
  allActiveClients: HouseholdMember[]
  existingSummary: SummaryRow | null
  canLogVisit: boolean
  canUploadDocuments: boolean
  canDeleteDocuments: boolean
  canLinkFamily: boolean
}) {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [documents, setDocuments] = useState<Document[]>(initialDocuments)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [deletingId, startDeleteTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const clientName = `${client.first_name} ${client.last_name}`

  // ── Document upload ─────────────────────────────────────────

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError(null)

    try {
      const supabase = createClient()
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const filePath = `${client.id}/${Date.now()}_${safeName}`

      const { error: storageError } = await supabase.storage
        .from('client-documents')
        .upload(filePath, file)

      if (storageError) throw new Error(storageError.message)

      const { data: doc, error: dbError } = await supabase
        .from('documents')
        .insert({
          client_id: client.id,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type || null,
        })
        .select()
        .single()

      if (dbError) throw new Error(dbError.message)
      if (doc) setDocuments((prev) => [doc as Document, ...prev])
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleDownload(doc: Document) {
    const supabase = createClient()
    const { data } = await supabase.storage
      .from('client-documents')
      .createSignedUrl(doc.file_path, 60)
    if (data?.signedUrl) {
      const a = document.createElement('a')
      a.href = data.signedUrl
      a.download = doc.file_name
      a.click()
    }
  }

  async function handleDeleteDocument(docId: string, filePath: string) {
    if (!confirm('Delete this document? This cannot be undone.')) return
    startDeleteTransition(async () => {
      const supabase = createClient()
      await supabase.storage.from('client-documents').remove([filePath])
      await supabase.from('documents').delete().eq('id', docId)
      setDocuments((prev) => prev.filter((d) => d.id !== docId))
    })
  }

  // ── Render ──────────────────────────────────────────────────

  return (
    <>
      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="Client profile sections"
        className="flex gap-1 rounded-[10px] border border-[#e2e8f0] bg-white p-1"
      >
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={activeTab === id}
            aria-controls={`tabpanel-${id}`}
            id={`tab-${id}`}
            onClick={() => setActiveTab(id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[12px] font-medium transition-colors ${
              activeTab === id
                ? 'bg-[#00bd8e] text-white'
                : 'text-[#6b7280] hover:bg-teal-tint hover:text-navy'
            }`}
          >
            <Icon className="size-3.5 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB 1: Overview ─────────────────────────────────── */}
      <div
        role="tabpanel"
        id="tabpanel-overview"
        aria-labelledby="tab-overview"
        hidden={activeTab !== 'overview'}
      >
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Demographics */}
            <div className="rounded-[14px] border border-[#e2e8f0] bg-white px-5 pt-4 pb-1 h-full">
              <p className="mb-1 text-[13px] font-semibold text-navy">Demographics</p>
              <dl>
                <LabelValue label="Date of birth" value={formatDob(client.dob)} />
                <LabelValue label="Phone" value={client.phone ?? '—'} />
                <LabelValue label="Email" value={client.email ?? '—'} />
                <LabelValue label="Address" value={client.address ?? '—'} />
                <LabelValue label="Client #" value={client.client_number} />
                <LabelValue label="Registered" value={formatDate(client.created_at)} />
              </dl>
            </div>

            {/* Client Summary — right column, same row as Demographics */}
            <ClientSummaryPanel summary={existingSummary} />

            {/* Custom fields — full width if present */}
            {customFields.length > 0 && (
              <div className="rounded-[14px] border border-[#e2e8f0] bg-white px-5 pt-4 pb-1 lg:col-span-2">
                <p className="mb-1 text-[13px] font-semibold text-navy">Additional information</p>
                <dl className="grid grid-cols-2 gap-x-8">
                  {customFields.map((field) => {
                    const raw = (client.custom_fields as Record<string, unknown>)[field.name]
                    const display = Array.isArray(raw) ? raw.join(', ') : String(raw ?? '—')
                    return <LabelValue key={field.id} label={field.label} value={display || '—'} />
                  })}
                </dl>
              </div>
            )}

            {/* Household / Family members — only shown when there are members or the user can add them */}
            {(householdMembers.length > 0 || canLinkFamily) && (
            <div className="rounded-[14px] border border-[#e2e8f0] bg-white lg:col-span-2">
              <div className="flex items-center justify-between border-b border-[#e2e8f0] px-4 py-3">
                <p className="text-[13px] font-semibold text-navy">Household / Family</p>
                {canLinkFamily && (
                  <button
                    onClick={() => setShowLinkModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-[11px] font-medium text-navy hover:bg-teal-tint"
                  >
                    <UserPlus className="size-3.5" />
                    Link Family Member
                  </button>
                )}
              </div>
              {householdMembers.length === 0 ? (
                <p className="px-4 py-5 text-center text-[12px] text-[#6b7280]">
                  No family members linked yet.
                </p>
              ) : (
                <div className="divide-y divide-[#f1f5f9] px-4">
                  {householdMembers.map((m) => (
                    <div key={m.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-[13px] font-medium text-navy">{m.first_name} {m.last_name}</p>
                        <p className="text-[11px] text-[#6b7280]">{m.client_number}</p>
                      </div>
                      <a
                        href={`/clients/${m.id}`}
                        className="inline-flex items-center gap-0.5 text-[11px] text-teal hover:underline"
                      >
                        View <ChevronRight className="size-3" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
            )}
          </div>
        )}
      </div>

      {/* ── TAB 2: Case Notes / History ─────────────────────── */}
      <div
        role="tabpanel"
        id="tabpanel-case-notes"
        aria-labelledby="tab-case-notes"
        hidden={activeTab !== 'case-notes'}
      >
        {activeTab === 'case-notes' && (
          <div className="rounded-[14px] border border-[#e2e8f0] bg-white">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] px-4 py-3">
              <p className="text-[13px] font-semibold text-navy">Visit history ({visits.length})</p>
              {canLogVisit && (
                <a
                  href={`/services/visits/new?client_id=${client.id}`}
                  className="inline-flex items-center gap-1 text-[11px] text-teal hover:underline"
                >
                  + Log visit
                </a>
              )}
            </div>

            {visits.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="text-[13px] text-[#6b7280]">No visits recorded yet.</p>
                {canLogVisit && (
                  <a
                    href={`/services/visits/new?client_id=${client.id}`}
                    className="mt-2 inline-flex h-8 items-center rounded-lg bg-teal px-4 text-[12px] font-medium text-white hover:bg-[#009e77]"
                  >
                    Log first visit
                  </a>
                )}
              </div>
            ) : (
              <div className="relative px-4 py-2">
                {/* Timeline line */}
                <div className="absolute left-[27px] top-4 bottom-4 w-px bg-[#e2e8f0]" aria-hidden="true" />

                <ol className="flex flex-col gap-0">
                  {visits.map((visit) => (
                    <li key={visit.id} className="flex gap-4 py-4">
                      {/* Timeline dot */}
                      <div className="relative z-10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-teal bg-white">
                        <div className="h-2 w-2 rounded-full bg-teal" />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                          <span className="text-[13px] font-semibold text-navy">{visit.service_type_name}</span>
                          <span className="text-[11px] text-[#6b7280] tabular-nums">{formatDate(visit.visit_date)}</span>
                          {visit.duration_minutes && (
                            <span className="text-[11px] text-[#9ca3af]">{visit.duration_minutes} min</span>
                          )}
                        </div>

                        <p className="mt-0.5 text-[11px] text-[#6b7280]">
                          by {visit.case_worker_name}
                        </p>

                        {/* Referral badge */}
                        {visit.referral_to && (
                          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 border border-amber-200">
                            Referred <ArrowRight className="size-3" /> {visit.referral_to}
                          </span>
                        )}

                        {/* Case narrative */}
                        {visit.case_notes && (
                          <div className="mt-2 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] px-3 py-2.5">
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[#6b7280]">Case Narrative</p>
                            <ExpandableText text={visit.case_notes} />
                          </div>
                        )}

                        {/* Brief notes */}
                        {visit.notes && visit.notes !== visit.case_notes && (
                          <p className="mt-1.5 text-[12px] text-[#6b7280] italic">{visit.notes}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── TAB 3: Documents ────────────────────────────────── */}
      <div
        role="tabpanel"
        id="tabpanel-documents"
        aria-labelledby="tab-documents"
        hidden={activeTab !== 'documents'}
      >
        {activeTab === 'documents' && (
          <div className="rounded-[14px] border border-[#e2e8f0] bg-white">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] px-4 py-3">
              <p className="text-[13px] font-semibold text-navy">Documents ({documents.length})</p>
              {canUploadDocuments && (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-teal px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[#009e77] disabled:opacity-60"
                  >
                    <Upload className="size-3.5" />
                    {uploading ? 'Uploading…' : 'Upload'}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    aria-label="Upload document"
                  />
                </>
              )}
            </div>

            {uploadError && (
              <div className="mx-4 mt-3 rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-700">
                {uploadError}
              </div>
            )}

            {documents.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Paperclip className="mx-auto mb-2 size-8 text-[#d1d5db]" />
                <p className="text-[13px] text-[#6b7280]">No documents uploaded yet.</p>
                {canUploadDocuments && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 text-[12px] text-teal hover:underline"
                  >
                    Upload the first document
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-[#f1f5f9]">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 px-4 py-3">
                    <FileText className="size-4 shrink-0 text-[#6b7280]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-navy">{doc.file_name}</p>
                      <p className="text-[11px] text-[#6b7280]">
                        {formatDate(doc.created_at)}
                        {doc.file_size ? ` · ${formatFileSize(doc.file_size)}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleDownload(doc)}
                        title="Download"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e2e8f0] text-[#6b7280] hover:bg-teal-tint hover:text-navy"
                      >
                        <Download className="size-3.5" />
                      </button>
                      {canDeleteDocuments && (
                        <button
                          onClick={() => handleDeleteDocument(doc.id, doc.file_path)}
                          title="Delete"
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e2e8f0] text-[#6b7280] hover:bg-red-50 hover:text-red-600"
                        >
                          <X className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── TAB 4: Appointments ──────────────────────────────── */}
      <div
        role="tabpanel"
        id="tabpanel-appointments"
        aria-labelledby="tab-appointments"
        hidden={activeTab !== 'appointments'}
      >
        {activeTab === 'appointments' && (
          <div className="rounded-[14px] border border-[#e2e8f0] bg-white">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] px-4 py-3">
              <p className="text-[13px] font-semibold text-navy">Appointments ({appointments.length})</p>
              <a
                href={`/services/schedule/new?client_id=${client.id}`}
                className="text-[11px] text-teal hover:underline"
              >
                + Schedule
              </a>
            </div>
            {appointments.length === 0 ? (
              <p className="px-4 py-10 text-center text-[13px] text-[#6b7280]">
                No appointments scheduled.
              </p>
            ) : (
              <div className="divide-y divide-[#f1f5f9]">
                {appointments.map((appt) => (
                  <div key={appt.id} className="flex items-start gap-3 px-4 py-3">
                    <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                      appt.status === 'scheduled' ? 'bg-teal' :
                      appt.status === 'completed' ? 'bg-[#6b7280]' : 'bg-red-400'
                    }`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-navy">{appt.service_type_name}</p>
                      <p className="text-[12px] text-[#6b7280]">{formatDateTime(appt.scheduled_at)}</p>
                      {appt.duration_minutes && (
                        <p className="text-[11px] text-[#9ca3af]">{appt.duration_minutes} min · {appt.case_worker_name}</p>
                      )}
                      {appt.notes && (
                        <p className="mt-1 text-[12px] text-[#6b7280] italic">{appt.notes}</p>
                      )}
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${
                      appt.status === 'scheduled' ? 'bg-teal-light text-[#007b58]' :
                      appt.status === 'completed' ? 'bg-[#f3f4f6] text-[#6b7280]' : 'bg-red-50 text-red-600'
                    }`}>
                      {appt.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Link family member modal */}
      {showLinkModal && (
        <LinkFamilyMemberModal
          clientId={client.id}
          allClients={allActiveClients.filter(
            (c) => c.id !== client.id && !householdMembers.some((m) => m.id === c.id)
          )}
          onClose={() => setShowLinkModal(false)}
        />
      )}
    </>
  )
}
