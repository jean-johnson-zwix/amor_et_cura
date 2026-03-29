import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HandoffView from './HandoffView'

// Stub fallback if Supabase has no data
const STUB_CLIENT = {
  id: '1', client_number: 'CLT-00001', first_name: 'Maria', last_name: 'Garcia',
  dob: '1985-04-12', phone: '(602) 555-0101', email: 'mgarcia@example.com',
  address: '123 Main St, Chandler, AZ', program: 'Family Services',
}
const STUB_VISITS = [
  { visit_date: '2026-03-20', notes: 'Initial intake completed. Client is seeking housing assistance for a family of 3. Referred to housing coordinator.', duration_minutes: 45, service_types: { name: 'Case Management' }, profiles: { full_name: 'Alex Rivera' } },
  { visit_date: '2026-03-14', notes: 'Provided 2-week emergency food assistance. Client scheduled for follow-up pantry visit next week.', duration_minutes: 30, service_types: { name: 'Food Assistance' }, profiles: { full_name: 'Jordan Kim' } },
  { visit_date: '2026-02-28', notes: 'Counseling session focused on stress management. Client reported feeling overwhelmed with recent job loss. Follow-up scheduled.', duration_minutes: 60, service_types: { name: 'Mental Health Services' }, profiles: { full_name: 'Alex Rivera' } },
]

export default async function HandoffPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()

  const { data: client } = await supabase
    .from('clients')
    .select('id, client_number, first_name, last_name, dob, phone, email, address, program')
    .eq('id', id)
    .single()

  const { data: visits } = await supabase
    .from('visits')
    .select('visit_date, notes, duration_minutes, service_types(name), profiles(full_name)')
    .eq('client_id', id)
    .order('visit_date', { ascending: false })
    .limit(10)

  const resolvedClient = client ?? (id === '1' ? STUB_CLIENT : null)
  if (!resolvedClient) notFound()

  const resolvedVisits = (visits && visits.length > 0) ? visits : (id === '1' ? STUB_VISITS : [])

  const handoffData = {
    clientName: `${resolvedClient.first_name} ${resolvedClient.last_name}`,
    clientNumber: resolvedClient.client_number,
    program: resolvedClient.program,
    phone: resolvedClient.phone,
    email: resolvedClient.email,
    address: resolvedClient.address,
    dob: resolvedClient.dob,
    recentVisits: resolvedVisits.map((v: any) => ({
      date: v.visit_date,
      serviceType: v.service_types?.name ?? '—',
      caseWorker: v.profiles?.full_name ?? '—',
      duration: v.duration_minutes,
      notes: v.notes,
    })),
    generatedAt: new Date().toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    }),
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <nav className="text-sm text-muted-foreground mb-1">
          <Link href="/clients" className="hover:underline">Clients</Link>
          {' / '}
          <Link href={`/clients/${id}`} className="hover:underline">{handoffData.clientName}</Link>
          {' / '}
          <span>Handoff Summary</span>
        </nav>
        <h1 className="text-xl font-semibold">Client Handoff Summary</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Structured summary for transferring {handoffData.clientName} to a new case worker.
        </p>
      </div>
      <HandoffView data={handoffData} />
    </div>
  )
}
