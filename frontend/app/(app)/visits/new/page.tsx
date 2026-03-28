import Link from 'next/link'
import { notFound } from 'next/navigation'
import VisitLogForm from './VisitLogForm'

// Stub client lookup — replace with Supabase query after #1 Auth lands
const STUB_CLIENTS: Record<string, { name: string }> = {
  '1': { name: 'Maria Garcia' },
  '2': { name: 'James Thompson' },
  '3': { name: 'Aisha Patel' },
  '4': { name: 'Carlos Rivera' },
  '5': { name: 'Linda Nguyen' },
}

export default async function NewVisitPage({
  searchParams,
}: {
  searchParams: Promise<{ client_id?: string }>
}) {
  const { client_id } = await searchParams

  if (!client_id) notFound()

  const client = STUB_CLIENTS[client_id]
  if (!client) notFound()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <nav className="text-sm text-muted-foreground mb-1">
          <Link href="/clients" className="hover:underline">Clients</Link>
          {' / '}
          <Link href={`/clients/${client_id}`} className="hover:underline">{client.name}</Link>
          {' / '}
          <span>Log Visit</span>
        </nav>
        <h1 className="text-xl font-semibold">Log a visit</h1>
      </div>
      <VisitLogForm clientId={client_id} clientName={client.name} />
    </div>
  )
}
