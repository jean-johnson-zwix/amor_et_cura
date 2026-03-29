import Link from 'next/link'
import { Users, Settings, FileText, ArrowRight } from 'lucide-react'
import { Topbar } from '@/components/Topbar'
import { getAllProfiles } from '@/lib/supabase/queries'
import type React from 'react'

const ADMIN_SECTIONS: {
  href: string
  title: string
  description: string
  Icon: React.ComponentType<{ className?: string }>
}[] = [
  { href: '/admin/users',     title: 'User Management', description: 'View all staff accounts, promote or demote roles.', Icon: Users },
  { href: '/admin/settings',  title: 'Settings',        description: 'Configure service types and custom intake fields.', Icon: Settings },
  { href: '/admin/audit-log', title: 'Audit Log',       description: 'Review all create, update, and delete actions.', Icon: FileText },
]

export default async function AdminPage() {
  const profiles = await getAllProfiles()
  const adminCount  = profiles.filter((p) => p.role === 'admin').length
  const workerCount = profiles.filter((p) => p.role === 'case_worker').length
  const viewerCount = profiles.filter((p) => p.role === 'viewer').length

  return (
    <>
      <Topbar crumbs={[{ label: 'Admin' }, { label: 'Overview' }]} />

      <div className="p-6 flex flex-col gap-5">
        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {[
            { label: 'Total users', value: profiles.length },
            { label: 'Admins', value: adminCount },
            { label: 'Case workers', value: workerCount },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-[14px] border border-[#e2e8f0] bg-white p-4">
              <p className="text-2xl font-semibold tabular-nums text-navy">{value}</p>
              <p className="mt-0.5 text-[12px] text-[#6b7280]">{label}</p>
            </div>
          ))}
        </div>

        <p className="text-[12px] text-[#6b7280]">
          {profiles.length} total users — {adminCount} admin{adminCount !== 1 ? 's' : ''},{' '}
          {workerCount} case worker{workerCount !== 1 ? 's' : ''},{' '}
          {viewerCount} viewer{viewerCount !== 1 ? 's' : ''}
        </p>

        {/* Section link cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {ADMIN_SECTIONS.map(({ href, title, description, Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-start justify-between gap-3 rounded-[14px] border border-[#e2e8f0] bg-white p-5 transition-shadow hover:shadow-sm"
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
