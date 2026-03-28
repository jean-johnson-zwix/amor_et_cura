import Link from 'next/link'
import ClientsTable from './ClientsTable'
import { createClient } from '@/lib/supabase/server'

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('is_active', true)
    .order('last_name')


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Clients</h1>
        <div className="flex gap-2">
          <Link
            href="/clients/import"
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-input bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            Import CSV
          </Link>
          <Link
            href="/clients/new"
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          >
            + New Client
          </Link>
        </div>
      </div>

      <ClientsTable clients={clients ?? []} />
    </div>
  )
}
