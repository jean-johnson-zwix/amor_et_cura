import { notFound } from 'next/navigation'
import { Topbar } from '@/components/Topbar'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/supabase/session'
import { can } from '@/lib/auth/permissions'
import ClientActions from './ClientActions'
import ClientProfileTabs from './ClientProfileTabs'
import { ClientSummaryButton } from './ClientSummary'
import { PrintProfileButton } from './PrintProfile'
import type { TaskRow } from '../../../tasks/TasksClient'

function getInitials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatDob(dob: string | null) {
  if (!dob) return null
  const date = new Date(dob + 'T00:00:00')
  const age = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
  return `${formatDate(dob)} (age ${age})`
}

export default async function ClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [session, supabase] = await Promise.all([getSession(), createClient()])

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (!client) notFound()

  const role = session?.profile?.role

  // Parallel fetch of all profile data
  const [
    { data: rawVisits },
    { data: fieldDefs },
    { data: rawAppointments },
    { data: rawDocuments },
    { data: allActiveClients },
    { data: rawTasks },
  ] = await Promise.all([
    supabase
      .from('visits')
      .select('*, service_types(name), profiles(full_name)')
      .eq('client_id', id)
      .order('visit_date', { ascending: false }),
    supabase
      .from('field_definitions')
      .select('*')
      .eq('applies_to', 'client')
      .eq('is_active', true)
      .order('sort_order')
      .order('created_at'),
    supabase
      .from('appointments')
      .select('*, service_types(name), profiles(full_name)')
      .eq('client_id', id)
      .order('scheduled_at', { ascending: false }),
    supabase
      .from('documents')
      .select('*')
      .eq('client_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('clients')
      .select('id, first_name, last_name, client_number, household_id')
      .eq('is_active', true)
      .order('last_name'),
    supabase
      .from('follow_ups')
      .select('id, client_id, visit_id, description, category, urgency, suggested_due_date, created_at, visits(visit_date)')
      .eq('client_id', id)
      .eq('status', 'active')
      .order('suggested_due_date', { ascending: true, nullsFirst: false }),
  ])

  // Isolated — table may not exist yet if migration hasn't been run
  let existingSummary: {
    id: string
    summary_text: string
    generated_at: string
    confirmed_at: string | null
    visit_count_at_generation: number
  } | null = null
  try {
    const { data } = await supabase
      .from('client_summaries' as string)
      .select('id, summary_text, generated_at, confirmed_at, visit_count_at_generation')
      .eq('client_id', id)
      .maybeSingle()
    existingSummary = data as typeof existingSummary
  } catch {
    // Table doesn't exist yet — run the migration to enable this feature
  }

  // Household members — other clients sharing the same household_id
  const householdMembers =
    client.household_id
      ? (allActiveClients ?? []).filter(
          (c) => c.household_id === client.household_id && c.id !== id
        )
      : []

  const activeCustomFields = (fieldDefs ?? []).filter(
    (f) => client.custom_fields && f.name in client.custom_fields
  )

  const visits = (rawVisits ?? []).map((v) => ({
    id: v.id,
    visit_date: v.visit_date,
    duration_minutes: v.duration_minutes,
    notes: v.notes,
    case_notes: (v as Record<string, unknown>).case_notes as string | null ?? null,
    referral_to: (v as Record<string, unknown>).referral_to as string | null ?? null,
    service_type_name: (v.service_types as { name: string } | null)?.name ?? '—',
    case_worker_name: (v.profiles as { full_name: string } | null)?.full_name ?? '—',
  }))

  const appointments = (rawAppointments ?? []).map((a) => ({
    id: a.id,
    scheduled_at: a.scheduled_at,
    duration_minutes: a.duration_minutes,
    notes: a.notes,
    status: a.status as 'scheduled' | 'completed' | 'cancelled',
    service_type_name: (a.service_types as { name: string } | null)?.name ?? '—',
    case_worker_name: (a.profiles as { full_name: string } | null)?.full_name ?? '—',
  }))

  const activeTasks: TaskRow[] = (rawTasks ?? []).map((t) => {
    const visit = t.visits as unknown as { visit_date: string } | null
    return {
      id: t.id,
      client_id: t.client_id,
      visit_id: t.visit_id,
      description: t.description,
      category: t.category as TaskRow['category'],
      urgency: (t.urgency ?? 'medium') as TaskRow['urgency'],
      suggested_due_date: t.suggested_due_date,
      created_at: t.created_at,
      client_first_name: client.first_name,
      client_last_name: client.last_name,
      visit_date: visit?.visit_date ?? '',
    }
  })

  const clientName = `${client.first_name} ${client.last_name}`

  return (
    <>
      <Topbar
        crumbs={[{ label: 'Clients', href: '/clients' }, { label: clientName }]}
        actions={
          <>
            <PrintProfileButton
              client={client}
              customFields={activeCustomFields}
              visits={visits}
              summary={existingSummary}
            />
            <ClientActions
              clientId={client.id}
              isActive={client.is_active}
              canEdit={can.editClient(role)}
              canDeactivate={can.deactivateClient(role)}
            />
          </>
        }
      />

      <div className="p-6 flex flex-col gap-4">
        {/* Profile header card */}
        <div className="rounded-[14px] border border-[#e2e8f0] bg-white p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-teal text-[18px] font-semibold text-white">
                {getInitials(client.first_name, client.last_name)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-[20px] font-semibold text-navy">{clientName}</h1>
                  {client.is_active ? (
                    <span className="rounded-full bg-teal-light px-2 py-0.5 text-[10px] font-medium text-[#007b58]">Active</span>
                  ) : (
                    <span className="rounded-full bg-[#f3f4f6] px-2 py-0.5 text-[10px] font-medium text-[#6b7280]">Inactive</span>
                  )}
                </div>
                {client.dob && (
                  <p className="mt-0.5 text-[12px] text-[#6b7280]">{formatDob(client.dob)}</p>
                )}
                {(client.programs ?? []).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(client.programs ?? []).map((p: string) => (
                      <span key={p} className="rounded bg-teal-light px-1.5 py-0.5 text-[10px] font-medium text-[#007b58]" style={{ borderRadius: 4 }}>
                        {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <ClientSummaryButton
              clientId={client.id}
              visitCount={visits.length}
              initialSummary={existingSummary ?? null}
            />
          </div>
        </div>

        {/* Tabbed sections */}
        <ClientProfileTabs
          client={client}
          customFields={activeCustomFields}
          visits={visits}
          appointments={appointments}
          documents={rawDocuments ?? []}
          householdMembers={householdMembers}
          allActiveClients={(allActiveClients ?? []).map((c) => ({
            id: c.id,
            first_name: c.first_name,
            last_name: c.last_name,
            client_number: c.client_number,
          }))}
          existingSummary={existingSummary ?? null}
          activeTasks={activeTasks}
          canLogVisit={can.logVisit(role)}
          canUploadDocuments={can.editClient(role)}
          canDeleteDocuments={can.deleteClient(role)}
          canLinkFamily={can.editClient(role)}
        />
      </div>
    </>
  )
}
