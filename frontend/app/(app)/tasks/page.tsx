import { CheckSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/Topbar'
import TasksClient, { type TaskRow, type PendingRow } from './TasksClient'

export default async function TasksPage() {
  const supabase = await createClient()

  const [{ data: rawActive }, { data: rawPending }] = await Promise.all([
    supabase
      .from('follow_ups')
      .select('id, client_id, visit_id, description, category, urgency, suggested_due_date, created_at, clients(first_name, last_name), visits(visit_date)')
      .eq('status', 'active')
      .order('suggested_due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false }),
    supabase
      .from('follow_ups')
      .select('id, client_id, visit_id, description, category, urgency, created_at, clients(first_name, last_name), visits(visit_date)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false }),
  ])

  const tasks: TaskRow[] = (rawActive ?? []).map((t) => {
    const client = t.clients as unknown as { first_name: string; last_name: string } | null
    const visit  = t.visits  as unknown as { visit_date: string } | null
    return {
      id: t.id,
      client_id: t.client_id,
      visit_id: t.visit_id,
      description: t.description,
      category: t.category as TaskRow['category'],
      urgency: (t.urgency ?? 'medium') as TaskRow['urgency'],
      suggested_due_date: t.suggested_due_date,
      created_at: t.created_at,
      client_first_name: client?.first_name ?? '—',
      client_last_name: client?.last_name ?? '',
      visit_date: visit?.visit_date ?? '',
    }
  })

  const pendingItems: PendingRow[] = (rawPending ?? []).map((p) => {
    const client = p.clients as unknown as { first_name: string; last_name: string } | null
    const visit  = p.visits  as unknown as { visit_date: string } | null
    return {
      id: p.id,
      client_id: p.client_id,
      visit_id: p.visit_id,
      description: p.description,
      category: p.category as PendingRow['category'],
      urgency: (p.urgency ?? 'medium') as PendingRow['urgency'],
      created_at: p.created_at,
      client_first_name: client?.first_name ?? '—',
      client_last_name: client?.last_name ?? '',
      visit_date: visit?.visit_date ?? '',
    }
  })

  const overdue = tasks.filter((t) => {
    if (!t.suggested_due_date) return false
    return new Date(t.suggested_due_date + 'T00:00:00') < new Date(new Date().setHours(0, 0, 0, 0))
  }).length

  return (
    <>
      <Topbar crumbs={[{ label: 'My Tasks' }]} />
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-navy">
            <CheckSquare className="size-6 text-teal shrink-0" />
            My Tasks
          </h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            {tasks.length} active task{tasks.length !== 1 ? 's' : ''}
            {overdue > 0 && (
              <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                {overdue} overdue
              </span>
            )}
            {pendingItems.length > 0 && (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                {pendingItems.length} AI suggestion{pendingItems.length !== 1 ? 's' : ''} to review
              </span>
            )}
          </p>
        </div>

        <TasksClient initialTasks={tasks} initialPendingItems={pendingItems} />
      </div>
    </>
  )
}
