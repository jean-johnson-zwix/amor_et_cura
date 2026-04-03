'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckSquare, Square, ExternalLink, Filter } from 'lucide-react'
import { completeTask } from './task-actions'

export type TaskRow = {
  id: string
  client_id: string
  visit_id: string
  description: string
  category: 'Referral' | 'Medical' | 'Document' | 'Financial' | 'Check-in'
  urgency: 'high' | 'medium' | 'low'
  suggested_due_date: string | null
  created_at: string
  client_first_name: string
  client_last_name: string
  visit_date: string
}

const CATEGORY_STYLES: Record<TaskRow['category'], { bg: string; color: string }> = {
  Referral:   { bg: '#e0edff', color: '#1d4ed8' },
  Medical:    { bg: '#fce4f0', color: '#be185d' },
  Document:   { bg: '#fef9c3', color: '#92400e' },
  Financial:  { bg: '#dcfce7', color: '#15803d' },
  'Check-in': { bg: '#f3f4f6', color: '#374151' },
}

const URGENCY_STYLES: Record<TaskRow['urgency'], { bg: string; color: string; label: string }> = {
  high:   { bg: '#fee2e2', color: '#b91c1c', label: 'High' },
  medium: { bg: '#fef3c7', color: '#92400e', label: 'Medium' },
  low:    { bg: '#f3f4f6', color: '#6b7280', label: 'Low' },
}

function formatDate(iso: string | null) {
  if (!iso) return null
  const d = new Date(iso + 'T00:00:00')
  const today = new Date(); today.setHours(0,0,0,0)
  const diff = Math.floor((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return { label: `Overdue by ${Math.abs(diff)}d`, overdue: true }
  if (diff === 0) return { label: 'Due today', overdue: false }
  if (diff === 1) return { label: 'Due tomorrow', overdue: false }
  return { label: `Due ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`, overdue: false }
}

function formatVisitDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

type CategoryFilter = 'all' | TaskRow['category']
type UrgencyFilter  = 'all' | TaskRow['urgency']
type DueFilter      = 'all' | 'overdue' | 'today' | 'this-week'

export default function TasksClient({ initialTasks }: { initialTasks: TaskRow[] }) {
  const [tasks, setTasks] = useState<TaskRow[]>(initialTasks)
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilter>('all')
  const [dueFilter, setDueFilter] = useState<DueFilter>('all')
  const [completingId, setCompletingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const router = useRouter()

  function matchesDue(task: TaskRow): boolean {
    if (dueFilter === 'all') return true
    if (!task.suggested_due_date) return dueFilter === 'all'
    const d = new Date(task.suggested_due_date + 'T00:00:00')
    const today = new Date(); today.setHours(0,0,0,0)
    const diff = Math.floor((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (dueFilter === 'overdue') return diff < 0
    if (dueFilter === 'today')   return diff === 0
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
        setTasks((prev) => prev.filter((t) => t.id !== id))
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

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#e2e8f0] bg-white px-6 py-12 text-center">
          <p className="text-base text-[#6b7280]">
            {tasks.length === 0
              ? 'No active tasks. Accept an AI suggestion from the dashboard to create one.'
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
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6b7280] hidden lg:table-cell">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {filtered.map((task) => {
                const catStyle = CATEGORY_STYLES[task.category]
                const urgStyle = URGENCY_STYLES[task.urgency]
                const due = task.suggested_due_date ? formatDate(task.suggested_due_date) : null
                const isCompleting = completingId === task.id

                return (
                  <tr key={task.id} className={`group hover:bg-[#f8fafc] transition-colors ${isCompleting ? 'opacity-50' : ''}`}>
                    {/* Checkbox */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleComplete(task.id)}
                        disabled={isCompleting}
                        title="Mark as complete"
                        className="text-[#d1d5db] hover:text-teal transition-colors disabled:opacity-50"
                      >
                        {isCompleting ? (
                          <CheckSquare className="size-5 text-teal" />
                        ) : (
                          <Square className="size-5" />
                        )}
                      </button>
                    </td>

                    {/* Description */}
                    <td className="px-4 py-3">
                      <p className="text-[13px] font-medium text-navy leading-snug">{task.description}</p>
                      {/* Mobile: show client + badges inline */}
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 sm:hidden">
                        <Link href={`/clients/${task.client_id}`} className="text-[11px] font-semibold text-teal hover:underline">
                          {task.client_first_name} {task.client_last_name}
                        </Link>
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: catStyle.bg, color: catStyle.color }}>{task.category}</span>
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: urgStyle.bg, color: urgStyle.color }}>{urgStyle.label}</span>
                      </div>
                    </td>

                    {/* Client */}
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Link href={`/clients/${task.client_id}`} className="text-[13px] font-semibold text-navy hover:text-teal hover:underline whitespace-nowrap">
                        {task.client_first_name} {task.client_last_name}
                      </Link>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap" style={{ background: catStyle.bg, color: catStyle.color }}>
                        {task.category}
                      </span>
                    </td>

                    {/* Urgency */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap" style={{ background: urgStyle.bg, color: urgStyle.color }}>
                        {urgStyle.label}
                      </span>
                    </td>

                    {/* Due date */}
                    <td className="px-4 py-3 hidden lg:table-cell whitespace-nowrap">
                      {due ? (
                        <span className={`text-[12px] font-medium ${due.overdue ? 'text-red-600' : 'text-[#6b7280]'}`}>
                          {due.label}
                        </span>
                      ) : (
                        <span className="text-[12px] text-[#9ca3af]">—</span>
                      )}
                    </td>

                    {/* Source visit */}
                    <td className="px-4 py-3 hidden lg:table-cell whitespace-nowrap">
                      <Link
                        href={`/clients/${task.client_id}`}
                        className="inline-flex items-center gap-1 text-[12px] text-teal hover:underline"
                        title="View client profile (Case Notes tab)"
                      >
                        <ExternalLink className="size-3" />
                        {formatVisitDate(task.visit_date)}
                      </Link>
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
