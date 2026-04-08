import Link from 'next/link'
import ClientsTable from './ClientsTable'
import { Topbar } from '@/components/Topbar'
import { createClient } from '@/lib/supabase/server'

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('is_active', true)
    .order('last_name')

  return (
    <>
      <Topbar
        crumbs={[{ label: 'Clients', href: '/clients' }, { label: 'All clients' }]}
        actions={
          <>
            <Link
              href="/clients/import"
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-[#D1CCC8] bg-white px-3 text-[13px] font-medium text-navy transition-colors hover:bg-[#F0ECE8]"
            >
              + Import CSV
            </Link>
            <Link
              href="/clients/new"
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-teal px-3 text-[13px] font-medium text-white transition-colors hover:bg-[#D45228]"
            >
              + New Client
            </Link>
          </>
        }
      />

      <div className="p-6">
        <ClientsTable clients={clients ?? []} />
      </div>
    </>
  )
}
