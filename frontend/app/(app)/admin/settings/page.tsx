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
        {/* AI Configuration shortcut */}
        <Link
          href="/admin/settings/ai"
          className="group flex items-center justify-between rounded-2xl bg-white shadow-sm border border-gray-100 px-5 py-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-light">
              <Brain className="size-4 text-teal" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-navy">AI Configuration</p>
              <p className="text-[12px] text-[#6b7280]">Swap models, edit system prompts, and enable or disable AI features.</p>
            </div>
          </div>
          <ArrowRight className="size-4 text-teal opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </Link>
        {/* Service Types */}
        <div className="rounded-2xl bg-white shadow-sm p-5">
          <div className="mb-4 border-b border-[#e2e8f0] pb-3">
            <h2 className="text-[13px] font-semibold uppercase tracking-wide text-navy">Service Types</h2>
            <p className="mt-0.5 text-[12px] text-[#6b7280]">
              Manage the service type options available in visit logs and appointment forms.
            </p>
          </div>
          <ServiceTypeManager serviceTypes={serviceTypes ?? []} />
        </div>

        {/* Custom Fields */}
        <div className="rounded-2xl bg-white shadow-sm p-5">
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
