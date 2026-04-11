import Link from 'next/link'
import { Brain, ArrowRight } from 'lucide-react'
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
        {/* Custom Fields */}
        <div className="rounded-2xl bg-white shadow-sm p-5">
          <div className="mb-4 border-b border-[#e2e8f0] pb-3">
            <h2 className="text-[13px] font-semibold uppercase tracking-wide text-navy">FORMS FIELDS</h2>
            <p className="mt-0.5 text-[12px] text-[#6b7280]">
              Define extra fields on the client intake form and visit log form.
            </p>
          </div>
          <FieldManager fields={fields ?? []} />
        </div>

        {/* Service Types */}
        <div className="rounded-2xl bg-white shadow-sm p-5">
          <div className="mb-4 border-b border-[#e2e8f0] pb-3">
            <h2 className="text-[13px] font-semibold uppercase tracking-wide text-navy">SERVICES TYPES</h2>
            <p className="mt-0.5 text-[12px] text-[#6b7280]">
              Manage the service types for visit logs and appointment forms.
            </p>
          </div>
          <ServiceTypeManager serviceTypes={serviceTypes ?? []} />
        </div>
</div >
        
    </>
  )
}
