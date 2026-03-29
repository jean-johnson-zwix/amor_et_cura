import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import FieldManager from './FieldManager'
import ServiceTypeManager from './ServiceTypeManager'

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const [{ data: fields }, { data: serviceTypes }] = await Promise.all([
    supabase
      .from('field_definitions')
      .select('*')
      .order('applies_to')
      .order('sort_order')
      .order('created_at'),
    supabase
      .from('service_types')
      .select('*')
      .order('name'),
  ])

  return (
    <div className="flex flex-col gap-10 max-w-4xl">
      <div>
        <nav className="text-sm text-muted-foreground mb-1">
          <Link href="/admin" className="hover:underline">Admin</Link>
          {' / '}
          <span>Settings</span>
        </nav>
        <h1 className="text-xl font-semibold">Settings</h1>
      </div>

      {/* Service Types */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold">Service Types</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage the service type options available in visit logs and appointment forms.
          </p>
        </div>
        <ServiceTypeManager serviceTypes={serviceTypes ?? []} />
      </section>

      <div className="border-t" />

      {/* Custom Fields */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold">Custom Fields</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Define extra fields on the client intake form and visit log. Values are stored per record.
          </p>
        </div>
        <FieldManager fields={fields ?? []} />
      </section>
    </div>
  )
}
