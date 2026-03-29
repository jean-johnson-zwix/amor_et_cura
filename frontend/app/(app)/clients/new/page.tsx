import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/Topbar'
import ClientRegistrationForm from './ClientRegistrationForm'

export default async function NewClientPage() {
  const supabase = await createClient()
  const [{ data: serviceTypes }, { data: customFields }] = await Promise.all([
    supabase.from('service_types').select('id, name').order('name'),
    supabase
      .from('field_definitions')
      .select('*')
      .eq('applies_to', 'client')
      .eq('is_active', true)
      .order('sort_order')
      .order('created_at'),
  ])

  return (
    <>
      <Topbar crumbs={[{ label: 'Clients', href: '/clients' }, { label: 'New client' }]} />
      <div className="p-6">
        <ClientRegistrationForm serviceTypes={serviceTypes ?? []} customFields={customFields ?? []} />
      </div>
    </>
  )
}
