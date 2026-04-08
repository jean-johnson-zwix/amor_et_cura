'use client'

import { useState, useRef, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckSquare, Square, Filter, Sparkles, CheckCircle, X, ListChecks, Pencil, Trash2, Plus, Loader2 } from 'lucide-react'
import { acceptFollowUp, dismissFollowUp } from '../dashboard/follow-up-actions'
import { completeTask, updateTask, deleteTask, createTask } from './task-actions'
import { Select } from '@/components/ui/select'

// ── Shared types ──────────────────────────────────────────────

export type TaskRow = {
  id: string
  client_id: string
  visit_id: string
  description: string
  category: 'Referral' | 'Medical' | 'Document' | 'Financial' | 'Check-in'
  urgency: 'high' | 'medium' | 'low'
  suggested_due_date: string | null   // null = case worker never set one
  created_at: string
  client_first_name: string
  client_last_name: string
  visit_date: string
}

export type PendingRow = {
  id: string
  client_id: string
  visit_id: string
  description: string
  category: 'Referral' | 'Medical' | 'Document' | 'Financial' | 'Check-in'
  urgency: 'high' | 'medium' | 'low'
  created_at: string
  client_first_name: string
  client_last_name: string
  visit_date: string
}

// ── Style maps ────────────────────────────────────────────────

const CAT_STYLE: Record<TaskRow['category'], { bg: string; color: string }> = {
  Referral:   { bg: '#FFF7ED', color: '#C2400A' },  // primary orange
  Medical:    { bg: '#FEF2F2', color: '#DC2626' },  // danger red
  Document:   { bg: '#FFFBEB', color: '#D97706' },  // amber
  Financial:  { bg: '#FFF8E7', color: '#B58000' },  // gold
  'Check-in': { bg: '#F0ECE8', color: '#6B7280' },  // warm neutral
}

const URG_STYLE: Record<TaskRow['urgency'], { bg: string; color: string; label: string }> = {
  high:   { bg: '#FEF2F2', color: '#DC2626', label: 'High' },    // danger
  medium: { bg: '#FFFBEB', color: '#D97706', label: 'Medium' },  // amber
  low:    { bg: '#F0ECE8', color: '#6B7280', label: 'Low' },     // warm neutral
}

function formatVisitDate(iso: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function dueBadge(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const diff = Math.floor((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0)   return { label: `Overdue by ${Math.abs(diff)}d`, overdue: true }
  if (diff === 0)  return { label: 'Due today',    overdue: false }
  if (diff === 1)  return { label: 'Due tomorrow', overdue: false }
  return { label: `Due ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`, overdue: false }
}

// ── AI Suggestions tab ────────────────────────────────────────

function SuggestionsTab({
  items,
  onAccepted,
  onDismissed,
}: {
  items: PendingRow[]
  onAccepted: (id: string, task: TaskRow) => void
  onDismissed: (id: string) => void
}) {
  const [urgencies, setUrgencies] = useState<Record<string, TaskRow['urgency']>>(
    () => Object.fromEntries(items.map((p) => [p.id, p.urgency]))
  )
  const [dueDates, setDueDates] = useState<Record<string, string>>(
    () => Object.fromEntries(items.map((p) => [p.id, '']))
  )
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const router = useRouter()

  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-white shadow-sm px-6 py-12 text-center">
        <Sparkles className="mx-auto mb-3 size-8 text-[#d1d5db]" />
        <p className="text-base text-[#6b7280]">No pending AI suggestions.</p>
        <p className="mt-1 text-sm text-[#9ca3af]">New suggestions appear here after saving a visit note.</p>
      </div>
    )
  }

  function handleAccept(item: PendingRow) {
    setProcessingId(item.id)
    startTransition(async () => {
      const urgency = urgencies[item.id] ?? 'medium'
      const dueDate = dueDates[item.id]?.trim() || null
      const result = await acceptFollowUp(item.id, urgency, dueDate)
      if (!result.error) {
        // Build the TaskRow optimistically so the Active Tasks tab updates immediately
        const newTask: TaskRow = {
          id: item.id,
          client_id: item.client_id,
          visit_id: item.visit_id,
          description: item.description,
          category: item.category,
          urgency,
          suggested_due_date: dueDate,
          created_at: item.created_at,
          client_first_name: item.client_first_name,
          client_last_name: item.client_last_name,
          visit_date: item.visit_date,
        }
        onAccepted(item.id, newTask)
        router.refresh()
      }
      setProcessingId(null)
    })
  }

  function handleDismiss(id: string) {
    setProcessingId(id)
    startTransition(async () => {
      const result = await dismissFollowUp(id)
      if (!result.error) {
        onDismissed(id)
        router.refresh()
      }
      setProcessingId(null)
    })
  }

  return (
    <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
      <div className="divide-y divide-[#f1f5f9]">
        {items.map((item) => {
          const isProcessing = processingId === item.id
          const catStyle = CAT_STYLE[item.category]

          return (
            <div key={item.id} className={`px-5 py-4 ${isProcessing ? 'opacity-50' : ''}`}>
              {/* Client + category + visit date */}
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Link href={`/clients/${item.client_id}`} className="text-[13px] font-bold text-navy hover:underline">
                  {item.client_first_name} {item.client_last_name}
                </Link>
                <span className="text-xs text-[#d1d5db]">·</span>
                <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: catStyle.bg, color: catStyle.color }}>
                  {item.category}
                </span>
                <span className="text-xs text-[#d1d5db]">·</span>
                <span className="text-xs text-[#6b7280]">Visit {formatVisitDate(item.visit_date)}</span>
              </div>

              {/* Description */}
              <p className="text-[13px] text-[#374151] mb-3">{item.description}</p>

              {/* Editable fields + actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <Select
                  size="sm"
                  value={urgencies[item.id]}
                  onChange={(e) => setUrgencies((p) => ({ ...p, [item.id]: e.target.value as TaskRow['urgency'] }))}
                  disabled={isProcessing}
                >
                  <option value="high">High urgency</option>
                  <option value="medium">Medium urgency</option>
                  <option value="low">Low urgency</option>
                </Select>

                <input
                  type="date"
                  value={dueDates[item.id]}
                  onChange={(e) => setDueDates((p) => ({ ...p, [item.id]: e.target.value }))}
                  disabled={isProcessing}
                  min={new Date().toISOString().split('T')[0]}
                  className="h-8 rounded-lg border border-[#e2e8f0] bg-white px-2 text-[12px] text-navy outline-none focus:border-teal disabled:opacity-50"
                />

                <button
                  disabled={isProcessing}
                  onClick={() => handleAccept(item)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-teal px-3 text-[12px] font-semibold text-white hover:bg-[#D45228] disabled:opacity-50 transition-colors"
                >
                  <CheckCircle className="size-3.5" />
                  {isProcessing ? 'Saving…' : 'Add to tasks'}
                </button>

                <button
                  disabled={isProcessing}
                  onClick={() => handleDismiss(item.id)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-3 text-[12px] font-semibold text-[#6b7280] hover:bg-[#f9fafb] disabled:opacity-50 transition-colors"
                >
                  <X className="size-3.5" />
                  Dismiss
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Shared select class ───────────────────────────────────────
const SEL = 'h-9 rounded-lg border border-[#e2e8f0] bg-white px-3 text-[13px] text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/20'

// ── Create Task modal / inline form ───────────────────────────

type CreateFormState = {
  description: string
  urgency: TaskRow['urgency']
  category: TaskRow['category']
  dueDate: string
  clientQuery: string
  clientId: string
  clientName: string
}

type ClientOption = { id: string; first_name: string; last_name: string; client_number: string }

function CreateTaskForm({ onCreated, onCancel }: { onCreated: (task: TaskRow) => void; onCancel: () => void }) {
  const [form, setForm] = useState<CreateFormState>({
    description: '', urgency: 'medium', category: 'Check-in',
    dueDate: '', clientQuery: '', clientId: '', clientName: '',
  })
  const [clientOptions, setClientOptions] = useState<ClientOption[]>([])
  const [clientOpen, setClientOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [, startTransition] = useTransition()

  function set<K extends keyof CreateFormState>(k: K, v: CreateFormState[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  function handleClientInput(val: string) {
    set('clientQuery', val)
    set('clientId', '')
    setClientOpen(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (val.trim()) {
      debounceRef.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/clients/search?q=${encodeURIComponent(val.trim())}`)
          const data = await res.json()
          setClientOptions(data.clients ?? [])
        } catch { /* ignore */ }
      }, 300)
    } else {
      setClientOptions([])
    }
  }

  function selectClient(c: ClientOption) {
    set('clientId', c.id)
    set('clientName', `${c.first_name} ${c.last_name}`)
    set('clientQuery', `${c.first_name} ${c.last_name}`)
    setClientOpen(false)
    setClientOptions([])
  }

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    if (!form.description.trim() || !form.clientId) return
    setSaving(true)
    setError(null)
    startTransition(async () => {
      const result = await createTask({
        description: form.description.trim(),
        urgency: form.urgency,
        category: form.category,
        client_id: form.clientId,
        suggested_due_date: form.dueDate || null,
      })
      if (result.error) {
        setError(result.error)
        setSaving(false)
      } else {
        const [firstName, ...rest] = form.clientName.split(' ')
        onCreated({
          id: result.id!,
          client_id: form.clientId,
          visit_id: '',
          description: form.description.trim(),
          category: form.category,
          urgency: form.urgency,
          suggested_due_date: form.dueDate || null,
          created_at: new Date().toISOString(),
          client_first_name: firstName,
          client_last_name: rest.join(' '),
          visit_date: '',
        })
      }
    })
  }

  return (
    <div className="rounded-2xl border border-teal/20 bg-white shadow-sm p-5">
      <p className="mb-4 text-[15px] font-bold text-navy">New Task</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Description */}
        <textarea
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="Task description…"
          rows={2}
          required
          autoFocus
          className="w-full resize-none rounded-lg border border-[#e2e8f0] px-3 py-2.5 text-[13px] text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
        />

        {/* Urgency + Category + Due date */}
        <div className="flex flex-wrap gap-2">
          <Select value={form.urgency} onChange={e => set('urgency', e.target.value as TaskRow['urgency'])}>
            <option value="high">High urgency</option>
            <option value="medium">Medium urgency</option>
            <option value="low">Low urgency</option>
          </Select>
          <Select value={form.category} onChange={e => set('category', e.target.value as TaskRow['category'])}>
            <option value="Check-in">Check-in</option>
            <option value="Referral">Referral</option>
            <option value="Medical">Medical</option>
            <option value="Document">Document</option>
            <option value="Financial">Financial</option>
          </Select>
          <input
            type="date"
            value={form.dueDate}
            onChange={e => set('dueDate', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className={SEL}
          />
        </div>

        {/* Client picker */}
        <div className="relative">
          <input
            value={form.clientQuery}
            onChange={e => handleClientInput(e.target.value)}
            onFocus={() => { if (clientOptions.length > 0) setClientOpen(true) }}
            placeholder="Search client…"
            autoComplete="off"
            required
            className={`w-full ${SEL}`}
          />
          {clientOpen && clientOptions.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-xl border border-[#e2e8f0] bg-white shadow-lg overflow-hidden">
              {clientOptions.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => selectClient(c)}
                  className="w-full px-4 py-2.5 text-left hover:bg-[#f8fafc] transition-colors"
                >
                  <span className="text-[13px] font-semibold text-navy">{c.first_name} {c.last_name}</span>
                  <span className="ml-2 text-[12px] text-[#9ca3af]">{c.client_number}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-[12px] text-red-600">{error}</p>}

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={saving || !form.description.trim() || !form.clientId}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-teal px-4 text-[13px] font-semibold text-white hover:bg-[#D45228] disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : 'Create Task'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="h-9 rounded-lg border border-[#e2e8f0] px-4 text-[13px] font-medium text-[#6b7280] hover:bg-[#f9fafb] transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

// ── Active tasks tab ──────────────────────────────────────────

type CategoryFilter = 'all' | TaskRow['category']
type UrgencyFilter  = 'all' | TaskRow['urgency']
type DueFilter      = 'all' | 'overdue' | 'today' | 'this-week'

function ActiveTasksTab({
  tasks,
  onCompleted,
  onUpdated,
  onDeleted,
  onCreated,
}: {
  tasks: TaskRow[]
  onCompleted: (id: string) => void
  onUpdated: (id: string, updates: Partial<TaskRow>) => void
  onDeleted: (id: string) => void
  onCreated: (task: TaskRow) => void
}) {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [urgencyFilter,  setUrgencyFilter]  = useState<UrgencyFilter>('all')
  const [dueFilter,      setDueFilter]      = useState<DueFilter>('all')
  const [completingId,   setCompletingId]   = useState<string | null>(null)
  const [deletingId,     setDeletingId]     = useState<string | null>(null)
  const [editingId,      setEditingId]      = useState<string | null>(null)
  const [editDesc,       setEditDesc]       = useState('')
  const [editUrgency,    setEditUrgency]    = useState<TaskRow['urgency']>('medium')
  const [editCategory,   setEditCategory]   = useState<TaskRow['category']>('Check-in')
  const [editDueDate,    setEditDueDate]    = useState('')
  const [savingId,       setSavingId]       = useState<string | null>(null)
  const [showCreate,     setShowCreate]     = useState(false)
  const [, startTransition] = useTransition()
  const router = useRouter()

  function matchesDue(task: TaskRow): boolean {
    if (dueFilter === 'all' || !task.suggested_due_date) return dueFilter === 'all'
    const d = new Date(task.suggested_due_date + 'T00:00:00')
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const diff = Math.floor((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (dueFilter === 'overdue')   return diff < 0
    if (dueFilter === 'today')     return diff === 0
    if (dueFilter === 'this-week') return diff >= 0 && diff <= 6
    return true
  }

  const filtered = tasks.filter((t) =>
    (categoryFilter === 'all' || t.category === categoryFilter) &&
    (urgencyFilter  === 'all' || t.urgency  === urgencyFilter)  &&
    matchesDue(t)
  )

  function handleComplete(id: string) {
    setCompletingId(id)
    startTransition(async () => {
      const result = await completeTask(id)
      if (!result.error) { onCompleted(id); router.refresh() }
      setCompletingId(null)
    })
  }

  function startEdit(task: TaskRow) {
    setEditingId(task.id)
    setEditDesc(task.description)
    setEditUrgency(task.urgency)
    setEditCategory(task.category)
    setEditDueDate(task.suggested_due_date ?? '')
  }

  function cancelEdit() { setEditingId(null) }

  function handleSave(id: string) {
    setSavingId(id)
    startTransition(async () => {
      const result = await updateTask(id, {
        description: editDesc,
        urgency: editUrgency,
        suggested_due_date: editDueDate || null,
      })
      if (!result.error) {
        onUpdated(id, { description: editDesc, urgency: editUrgency, category: editCategory, suggested_due_date: editDueDate || null })
        setEditingId(null)
        router.refresh()
      }
      setSavingId(null)
    })
  }

  function handleDelete(id: string) {
    setDeletingId(id)
    startTransition(async () => {
      const result = await deleteTask(id)
      if (!result.error) { onDeleted(id); router.refresh() }
      else setDeletingId(null)
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar: filters + New Task */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="size-4 text-[#6b7280] shrink-0" />
        <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}>
          <option value="all">All categories</option>
          <option value="Referral">Referral</option>
          <option value="Medical">Medical</option>
          <option value="Document">Document</option>
          <option value="Financial">Financial</option>
          <option value="Check-in">Check-in</option>
        </Select>
        <Select value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value as UrgencyFilter)}>
          <option value="all">All urgencies</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </Select>
        <Select value={dueFilter} onChange={(e) => setDueFilter(e.target.value as DueFilter)}>
          <option value="all">Any due date</option>
          <option value="overdue">Overdue</option>
          <option value="today">Due today</option>
          <option value="this-week">Due this week</option>
        </Select>
        {filtered.length !== tasks.length && (
          <span className="text-[13px] text-[#6b7280]">{filtered.length} of {tasks.length} shown</span>
        )}
        <div className="ml-auto">
          <button
            onClick={() => setShowCreate(v => !v)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-teal px-4 text-[13px] font-semibold text-white hover:bg-[#D45228] transition-colors"
          >
            <Plus className="size-4" />
            New Task
          </button>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <CreateTaskForm
          onCreated={(task) => { onCreated(task); setShowCreate(false) }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white shadow-sm px-6 py-12 text-center">
          <p className="text-base text-[#6b7280]">
            {tasks.length === 0
              ? 'No active tasks. Click "New Task" to create one, or go to "AI Suggestions" to review.'
              : 'No tasks match the current filters.'}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                <th className="w-10 px-4 py-3" />
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6b7280]">Task</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6b7280] hidden sm:table-cell">Client</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6b7280] hidden md:table-cell">Category</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6b7280] hidden md:table-cell">Urgency</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6b7280] hidden lg:table-cell">Due</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6b7280] hidden lg:table-cell">Date</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {filtered.map((task) => {
                const catStyle = CAT_STYLE[task.category]
                const urgStyle = URG_STYLE[task.urgency]
                const isCompleting = completingId === task.id
                const isDeleting   = deletingId   === task.id
                const isEditing    = editingId    === task.id
                const isSaving     = savingId     === task.id
                const due = task.suggested_due_date ? dueBadge(task.suggested_due_date) : null

                if (isEditing) {
                  return (
                    <tr key={task.id} className="bg-[#f8fffd]">
                      <td className="px-4 py-3" />
                      <td colSpan={6} className="px-4 py-3">
                        <div className="flex flex-col gap-2">
                          <textarea
                            value={editDesc}
                            onChange={e => setEditDesc(e.target.value)}
                            rows={2}
                            autoFocus
                            className="w-full resize-none rounded-lg border border-teal/40 px-3 py-2 text-[13px] text-navy outline-none focus:ring-2 focus:ring-teal/20"
                          />
                          <div className="flex flex-wrap items-center gap-2">
                            <Select value={editUrgency} onChange={e => setEditUrgency(e.target.value as TaskRow['urgency'])}>
                              <option value="high">High urgency</option>
                              <option value="medium">Medium urgency</option>
                              <option value="low">Low urgency</option>
                            </Select>
                            <Select value={editCategory} onChange={e => setEditCategory(e.target.value as TaskRow['category'])}>
                              <option value="Check-in">Check-in</option>
                              <option value="Referral">Referral</option>
                              <option value="Medical">Medical</option>
                              <option value="Document">Document</option>
                              <option value="Financial">Financial</option>
                            </Select>
                            <input
                              type="date"
                              value={editDueDate}
                              onChange={e => setEditDueDate(e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                              className={SEL}
                            />
                            <button
                              onClick={() => handleSave(task.id)}
                              disabled={isSaving || !editDesc.trim()}
                              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-teal px-4 text-[13px] font-semibold text-white hover:bg-[#D45228] disabled:opacity-50 transition-colors"
                            >
                              {isSaving ? <Loader2 className="size-4 animate-spin" /> : 'Save'}
                            </button>
                            <button onClick={cancelEdit} className="h-9 rounded-lg border border-[#e2e8f0] px-4 text-[13px] font-medium text-[#6b7280] hover:bg-white transition-colors">
                              Cancel
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3" />
                    </tr>
                  )
                }

                return (
                  <tr key={task.id} className={`group hover:bg-[#f8fafc] transition-colors ${(isCompleting || isDeleting) ? 'opacity-40' : ''}`}>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleComplete(task.id)}
                        disabled={isCompleting || isDeleting}
                        title="Mark as complete"
                        className="text-[#d1d5db] hover:text-teal transition-colors disabled:opacity-50"
                      >
                        {isCompleting ? <CheckSquare className="size-5 text-teal" /> : <Square className="size-5" />}
                      </button>
                    </td>

                    <td className="px-4 py-3">
                      <p className="text-[13px] font-medium text-navy leading-snug">{task.description}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 sm:hidden">
                        <Link href={`/clients/${task.client_id}`} className="text-[11px] font-semibold text-teal hover:underline">
                          {task.client_first_name} {task.client_last_name}
                        </Link>
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: catStyle.bg, color: catStyle.color }}>{task.category}</span>
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: urgStyle.bg, color: urgStyle.color }}>{urgStyle.label}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Link href={`/clients/${task.client_id}`} className="text-[13px] font-semibold text-navy hover:text-teal hover:underline whitespace-nowrap">
                        {task.client_first_name} {task.client_last_name}
                      </Link>
                    </td>

                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap" style={{ background: catStyle.bg, color: catStyle.color }}>
                        {task.category}
                      </span>
                    </td>

                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap" style={{ background: urgStyle.bg, color: urgStyle.color }}>
                        {urgStyle.label}
                      </span>
                    </td>

                    <td className="px-4 py-3 hidden lg:table-cell whitespace-nowrap">
                      {due ? (
                        <span className={`text-[12px] font-medium ${due.overdue ? 'text-red-600' : 'text-[#6b7280]'}`}>
                          {due.label}
                        </span>
                      ) : (
                        <span className="text-[12px] text-[#d1d5db]">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3 hidden lg:table-cell whitespace-nowrap">
                      <span className="text-[12px] text-[#6b7280]">{formatVisitDate(task.visit_date)}</span>
                    </td>

                    {/* Edit / Delete actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(task)}
                          title="Edit task"
                          className="p-1.5 text-[#9ca3af] hover:text-teal transition-colors rounded"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          disabled={isDeleting}
                          title="Delete task"
                          className="p-1.5 text-[#9ca3af] hover:text-red-500 transition-colors rounded disabled:opacity-40"
                        >
                          {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Root component ────────────────────────────────────────────

export default function TasksClient({
  initialTasks,
  initialPendingItems,
}: {
  initialTasks: TaskRow[]
  initialPendingItems: PendingRow[]
}) {
  const [tasks,        setTasks]        = useState<TaskRow[]>(initialTasks)
  const [pendingItems, setPendingItems] = useState<PendingRow[]>(initialPendingItems)
  const [activeTab,    setActiveTab]    = useState<'active' | 'suggestions'>('active')

  return (
    <div className="flex flex-col gap-4">
      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl bg-white shadow-sm p-1 self-start">
        <button
          onClick={() => setActiveTab('active')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors ${
            activeTab === 'active' ? 'bg-teal text-white' : 'text-[#6b7280] hover:bg-[#f1f5f9] hover:text-navy'
          }`}
        >
          <ListChecks className="size-3.5 shrink-0" />
          Active Tasks
          {tasks.length > 0 && (
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeTab === 'active' ? 'bg-white/20 text-white' : 'bg-teal-light text-teal'}`}>
              {tasks.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors ${
            activeTab === 'suggestions' ? 'bg-teal text-white' : 'text-[#6b7280] hover:bg-[#f1f5f9] hover:text-navy'
          }`}
        >
          <Sparkles className="size-3.5 shrink-0" />
          AI Suggestions
          {pendingItems.length > 0 && (
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeTab === 'suggestions' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'}`}>
              {pendingItems.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab panels */}
      {activeTab === 'active' && (
        <ActiveTasksTab
          tasks={tasks}
          onCompleted={(id) => setTasks((prev) => prev.filter((t) => t.id !== id))}
          onUpdated={(id, updates) => setTasks((prev) => prev.map((t) => t.id === id ? { ...t, ...updates } : t))}
          onDeleted={(id) => setTasks((prev) => prev.filter((t) => t.id !== id))}
          onCreated={(task) => setTasks((prev) => [task, ...prev])}
        />
      )}

      {activeTab === 'suggestions' && (
        <SuggestionsTab
          items={pendingItems}
          onAccepted={(id, newTask) => {
            setPendingItems((prev) => prev.filter((p) => p.id !== id))
            setTasks((prev) => [newTask, ...prev])   // immediately visible in Active Tasks
            setActiveTab('active')                    // switch to Active Tasks tab
          }}
          onDismissed={(id) => setPendingItems((prev) => prev.filter((p) => p.id !== id))}
        />
      )}
    </div>
  )
}
