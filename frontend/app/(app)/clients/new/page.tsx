import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
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
    <div className="flex flex-col gap-6">
      <div>
        <nav className="text-sm text-muted-foreground mb-1">
          <Link href="/clients" className="hover:underline">Clients</Link>
          {' / '}
          <span>New</span>
        </nav>
        <h1 className="text-xl font-semibold">Register new client</h1>
      </div>
      <ClientRegistrationForm serviceTypes={serviceTypes ?? []} customFields={customFields ?? []} />
    </div>
  )
}
