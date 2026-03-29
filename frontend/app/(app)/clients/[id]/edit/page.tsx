import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/supabase/session'
import { can } from '@/lib/auth/permissions'
import EditClientForm from './EditClientForm'

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const session = await getSession()
  if (!can.editClient(session?.profile?.role)) notFound()

  const supabase = await createClient()
  const [{ data: client }, { data: serviceTypes }] = await Promise.all([
    supabase.from('clients').select('*').eq('id', id).single(),
    supabase.from('service_types').select('id, name').eq('is_active', true).order('name'),
  ])

  if (!client) notFound()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <nav className="text-sm text-muted-foreground mb-1">
          <Link href="/clients" className="hover:underline">Clients</Link>
          {' / '}
          <Link href={`/clients/${id}`} className="hover:underline">
            {client.first_name} {client.last_name}
          </Link>
          {' / '}
          <span>Edit</span>
        </nav>
        <h1 className="text-xl font-semibold">Edit client</h1>
      </div>
      <EditClientForm client={client} serviceTypes={serviceTypes ?? []} />
    </div>
  )
}
