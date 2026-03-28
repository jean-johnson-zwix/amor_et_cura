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
  const adminCount     = profiles.filter(p => p.role === 'admin').length
  const workerCount    = profiles.filter(p => p.role === 'case_worker').length
  const readOnlyCount  = profiles.filter(p => p.role === 'read_only').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
        <p className="mt-1 text-sm text-gray-500">
          {profiles.length} total users — {adminCount} admin
          {adminCount !== 1 ? 's' : ''}, {workerCount} case worker
          {workerCount !== 1 ? 's' : ''}, {readOnlyCount} read-only
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {ADMIN_SECTIONS.map(({ href, title, description, icon }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-3 text-2xl">{icon}</div>
            <h2 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600">
              {title}
            </h2>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
