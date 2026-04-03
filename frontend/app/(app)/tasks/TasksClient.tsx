'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckSquare, Square, Filter, Sparkles, CheckCircle, X, ListChecks } from 'lucide-react'
import { acceptFollowUp, dismissFollowUp } from '../dashboard/follow-up-actions'
import { completeTask } from './task-actions'

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
  Referral:   { bg: '#e0edff', color: '#1d4ed8' },
  Medical:    { bg: '#fce4f0', color: '#be185d' },
  Document:   { bg: '#fef9c3', color: '#92400e' },
  Financial:  { bg: '#dcfce7', color: '#15803d' },
  'Check-in': { bg: '#f3f4f6', color: '#374151' },
}

const URG_STYLE: Record<TaskRow['urgency'], { bg: string; color: string; label: string }> = {
  high:   { bg: '#fee2e2', color: '#b91c1c', label: 'High' },
  medium: { bg: '#fef3c7', color: '#92400e', label: 'Medium' },
  low:    { bg: '#f3f4f6', color: '#6b7280', label: 'Low' },
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
      <div className="rounded-2xl border border-[#e2e8f0] bg-white px-6 py-12 text-center">
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

  const selClass = 'h-8 rounded-lg border border-[#e2e8f0] bg-white px-2 text-[12px] text-navy outline-none focus:border-teal'

  return (
    <div className="rounded-2xl border border-[#e2e8f0] bg-white overflow-hidden">
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
                <select
                  value={urgencies[item.id]}
                  onChange={(e) => setUrgencies((p) => ({ ...p, [item.id]: e.target.value as TaskRow['urgency'] }))}
                  disabled={isProcessing}
                  className={selClass}
                >
                  <option value="high">High urgency</option>
                  <option value="medium">Medium urgency</option>
                  <option value="low">Low urgency</option>
                </select>

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
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-teal px-3 text-[12px] font-semibold text-white hover:bg-[#009e77] disabled:opacity-50 transition-colors"
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

// ── Active tasks tab ──────────────────────────────────────────

type CategoryFilter = 'all' | TaskRow['category']
type UrgencyFilter  = 'all' | TaskRow['urgency']
type DueFilter      = 'all' | 'overdue' | 'today' | 'this-week'

function ActiveTasksTab({ tasks, onCompleted }: { tasks: TaskRow[]; onCompleted: (id: string) => void }) {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [urgencyFilter,  setUrgencyFilter]  = useState<UrgencyFilter>('all')
  const [dueFilter,      setDueFilter]      = useState<DueFilter>('all')
  const [completingId,   setCompletingId]   = useState<string | null>(null)
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
      if (!result.error) {
        onCompleted(id)
        router.refresh()
      }
      setCompletingId(null)
    })
  }

  const selClass = 'h-9 rounded-lg border border-[#e2e8f0] bg-white px-3 text-[13px] text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/20'

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="size-4 text-[#6b7280] shrink-0" />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)} className={selClass}>
          <option value="all">All categories</option>
          <option value="Referral">Referral</option>
          <option value="Medical">Medical</option>
          <option value="Document">Document</option>
          <option value="Financial">Financial</option>
          <option value="Check-in">Check-in</option>
        </select>
        <select value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value as UrgencyFilter)} className={selClass}>
          <option value="all">All urgencies</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={dueFilter} onChange={(e) => setDueFilter(e.target.value as DueFilter)} className={selClass}>
          <option value="all">Any due date</option>
          <option value="overdue">Overdue</option>
          <option value="today">Due today</option>
          <option value="this-week">Due this week</option>
        </select>
        {filtered.length !== tasks.length && (
          <span className="text-[13px] text-[#6b7280]">{filtered.length} of {tasks.length} shown</span>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#e2e8f0] bg-white px-6 py-12 text-center">
          <p className="text-base text-[#6b7280]">
            {tasks.length === 0
              ? 'No active tasks. Go to "AI Suggestions" to review and add tasks.'
              : 'No tasks match the current filters.'}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#e2e8f0] bg-white overflow-hidden">
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
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {filtered.map((task) => {
                const catStyle = CAT_STYLE[task.category]
                const urgStyle = URG_STYLE[task.urgency]
                const isCompleting = completingId === task.id
                const due = task.suggested_due_date ? dueBadge(task.suggested_due_date) : null

                return (
                  <tr key={task.id} className={`group hover:bg-[#f8fafc] transition-colors ${isCompleting ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleComplete(task.id)}
                        disabled={isCompleting}
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
      <div className="flex gap-1 rounded-[10px] border border-[#e2e8f0] bg-white p-1 self-start">
        <button
          onClick={() => setActiveTab('active')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors ${
            activeTab === 'active' ? 'bg-teal text-white' : 'text-[#6b7280] hover:bg-[#f1f5f9] hover:text-navy'
          }`}
        >
          <ListChecks className="size-3.5 shrink-0" />
          Active Tasks
          {tasks.length > 0 && (
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeTab === 'active' ? 'bg-white/20 text-white' : 'bg-[#e0f7f4] text-[#007b58]'}`}>
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
