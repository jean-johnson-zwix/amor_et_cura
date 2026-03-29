import Link from 'next/link'
import { getAllProfiles } from '@/lib/supabase/queries'

const ADMIN_SECTIONS = [
  {
    href: '/admin/users',
    title: 'User Management',
    description: 'View all staff accounts, promote or demote roles.',
    icon: '👥',
  },
  {
    href: '/admin/settings',
    title: 'Settings',
    description: 'Configure service types and other admin-controlled lookup values.',
    icon: '⚙️',
  },
  {
    href: '/admin/audit-log',
    title: 'Audit Log',
    description: 'Review all create, update, and delete actions across the system.',
    icon: '📋',
  },
]

export default async function AdminPage() {
  const profiles = await getAllProfiles()
  const adminCount    = profiles.filter((p) => p.role === 'admin').length
  const workerCount   = profiles.filter((p) => p.role === 'case_worker').length
  const readOnlyCount = profiles.filter((p) => p.role === 'read_only').length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {profiles.length} total users — {adminCount} admin{adminCount !== 1 ? 's' : ''},{' '}
          {workerCount} case worker{workerCount !== 1 ? 's' : ''},{' '}
          {readOnlyCount} read-only
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {ADMIN_SECTIONS.map(({ href, title, description, icon }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-3 text-2xl">{icon}</div>
            <h2 className="text-sm font-semibold group-hover:text-primary">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
