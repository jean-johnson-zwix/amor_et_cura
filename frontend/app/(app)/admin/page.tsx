import Link from 'next/link'
import { Users, Settings, FileText, BarChart3, ArrowRight, Brain } from 'lucide-react'
import { Topbar } from '@/components/Topbar'
import { getAllProfiles } from '@/lib/supabase/queries'
import type React from 'react'

const ADMIN_SECTIONS: {
  href: string
  title: string
  description: string
  Icon: React.ComponentType<{ className?: string }>
}[] = [
  { href: '/admin/users',        title: 'User Management',   description: 'View/Manage all user accounts.',              Icon: Users },
  { href: '/admin/settings',     title: 'Manage Forms & Services',          description: 'Configure service types and forms.',              Icon: Settings },
  { href: '/admin/settings/ai',  title: 'AI Configuration',  description: 'Swap models, edit prompts, and enable/disable AI features.', Icon: Brain },
  { href: '/admin/audit-log',    title: 'Audit Log',         description: 'Review all create, update, and delete actions.',                Icon: FileText },
  { href: '/admin/reports',      title: 'Impact Reports',    description: 'Generate reports for funder reporting.',     Icon: BarChart3 },
]

export default async function AdminPage() {
  return (
    <>
      <Topbar crumbs={[{ label: 'Admin' }, { label: 'Settings' }]} />

      <div className="p-6 flex flex-col gap-5">
        {/* Section link cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {ADMIN_SECTIONS.map(({ href, title, description, Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-start justify-between gap-3 rounded-2xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex flex-col gap-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-light">
                  <Icon className="size-4 text-teal" />
                </div>
                <h2 className="mt-2 text-[13px] font-semibold text-navy">{title}</h2>
                <p className="text-[12px] text-[#6b7280]">{description}</p>
              </div>
              <ArrowRight className="mt-1 size-4 shrink-0 text-teal opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
