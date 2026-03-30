import { Topbar } from '@/components/Topbar'
import { createClient } from '@/lib/supabase/server'
import { ReportsHub } from './ReportsHub'

export const metadata = { title: 'Impact Reports' }

export default async function ReportsPage() {
  const supabase = await createClient()

  // Fetch active service types to populate the program filter dropdown
  const { data: serviceTypeRows } = await supabase
    .from('service_types')
    .select('name')
    .eq('is_active', true)
    .order('name')

  const serviceTypes = (serviceTypeRows ?? []).map((r) => r.name as string)

  return (
    <>
      <Topbar
        crumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Impact Reports' },
        ]}
      />
      <ReportsHub serviceTypes={serviceTypes} />
    </>
  )
}
