import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/Topbar'
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
    <>
      <Topbar crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Settings' }]} />

      <div className="p-6 flex flex-col gap-6 max-w-4xl">
        {/* Service Types */}
        <div className="rounded-[14px] border border-[#e2e8f0] bg-white p-5">
          <div className="mb-4 border-b border-[#e2e8f0] pb-3">
            <h2 className="text-[13px] font-semibold uppercase tracking-wide text-navy">Service Types</h2>
            <p className="mt-0.5 text-[12px] text-[#6b7280]">
              Manage the service type options available in visit logs and appointment forms.
            </p>
          </div>
          <ServiceTypeManager serviceTypes={serviceTypes ?? []} />
        </div>

        {/* Custom Fields */}
        <div className="rounded-[14px] border border-[#e2e8f0] bg-white p-5">
          <div className="mb-4 border-b border-[#e2e8f0] pb-3">
            <h2 className="text-[13px] font-semibold uppercase tracking-wide text-navy">Custom Fields</h2>
            <p className="mt-0.5 text-[12px] text-[#6b7280]">
              Define extra fields on the client intake form and visit log. Values are stored per record.
            </p>
          </div>
          <FieldManager fields={fields ?? []} />
        </div>
      </div>
    </>
  )
}
