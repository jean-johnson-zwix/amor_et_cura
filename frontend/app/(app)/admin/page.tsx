import Link from 'next/link'
import { Users, Settings, FileText } from 'lucide-react'
import { getAllProfiles } from '@/lib/supabase/queries'
import type React from 'react'

const ADMIN_SECTIONS: {
  href: string
  title: string
  description: string
  Icon: React.ComponentType<{ className?: string }>
}[] = [
  {
    href: '/admin/users',
    title: 'User Management',
    description: 'View all staff accounts, promote or demote roles.',
    Icon: Users,
  },
  {
    href: '/admin/settings',
    title: 'Settings',
    description: 'Configure service types and custom intake fields.',
    Icon: Settings,
  },
  {
    href: '/admin/audit-log',
    title: 'Audit Log',
    description: 'Review all create, update, and delete actions across the system.',
    Icon: FileText,
  },
]

export default async function AdminPage() {
  const profiles = await getAllProfiles()
  const adminCount  = profiles.filter((p) => p.role === 'admin').length
  const workerCount = profiles.filter((p) => p.role === 'case_worker').length
  const viewerCount = profiles.filter((p) => p.role === 'viewer').length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {profiles.length} total users — {adminCount} admin{adminCount !== 1 ? 's' : ''},{' '}
          {workerCount} case worker{workerCount !== 1 ? 's' : ''},{' '}
          {viewerCount} viewer{viewerCount !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {ADMIN_SECTIONS.map(({ href, title, description, Icon }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <Icon className="mb-3 size-6 text-muted-foreground group-hover:text-primary transition-colors" />
            <h2 className="text-sm font-semibold group-hover:text-primary">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
