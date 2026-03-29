import Link from 'next/link'
import { getAllProfiles } from '@/lib/supabase/queries'
import { getSession } from '@/lib/supabase/session'
import { RoleForm } from './role-form'
import type { UserRole } from '@/types/database'

const ROLE_BADGE: Record<UserRole, string> = {
  admin:       'bg-purple-100 text-purple-800',
  case_worker: 'bg-green-100 text-green-800',
  read_only:   'bg-gray-100 text-gray-700',
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin:       'Admin',
  case_worker: 'Case Worker',
  read_only:   'Read Only',
}

export default async function UsersPage() {
  const [session, profiles] = await Promise.all([getSession(), getAllProfiles()])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <nav className="text-sm text-muted-foreground mb-1">
          <Link href="/admin" className="hover:underline">Admin</Link>
          {' / '}
          <span>User Management</span>
        </nav>
        <h1 className="text-xl font-semibold">User Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {profiles.length} {profiles.length === 1 ? 'user' : 'users'} · Admins can promote or
          demote any account. You cannot change your own role.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Current Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Change Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {profiles.map((profile) => {
              const isSelf = profile.id === session?.user.id
              return (
                <tr key={profile.id} className={isSelf ? 'bg-primary/5' : undefined}>
                  <td className="px-6 py-4 text-sm font-medium">
                    {profile.full_name}
                    {isSelf && <span className="ml-2 text-xs font-normal text-muted-foreground">(you)</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_BADGE[profile.role]}`}>
                      {ROLE_LABELS[profile.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(profile.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <RoleForm userId={profile.id} currentRole={profile.role} isSelf={isSelf} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
