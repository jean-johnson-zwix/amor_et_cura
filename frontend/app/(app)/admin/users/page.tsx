import { getAllProfiles } from '@/lib/supabase/queries'
import { getSession } from '@/lib/supabase/session'
import { Topbar } from '@/components/Topbar'
import { RoleForm } from './role-form'
import type { UserRole } from '@/types/database'

const ROLE_BADGE: Record<UserRole, { bg: string; text: string }> = {
  admin:       { bg: '#FFF7ED', text: '#C2400A' },  // primary orange
  case_worker: { bg: '#FFFBEB', text: '#D97706' },  // amber
  viewer:      { bg: '#F0ECE8', text: '#6B7280' },  // warm neutral
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin:       'Admin',
  case_worker: 'Case Worker',
  viewer:      'Viewer',
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

const AVATAR_COLORS = ['#F2673C']

export default async function UsersPage() {
  const [session, profiles] = await Promise.all([getSession(), getAllProfiles()])
    const adminCount  = profiles.filter((p) => p.role === 'admin').length
    const workerCount = profiles.filter((p) => p.role === 'case_worker').length
    const viewerCount = profiles.filter((p) => p.role === 'viewer').length

  return (
    <>
      <Topbar crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Users' }]} />

      <div className="p-6 flex flex-col gap-4">

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {[
            { label: 'Total users', value: profiles.length },
            { label: 'Admins', value: adminCount },
            { label: 'Case workers', value: workerCount },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl bg-white shadow-sm p-4">
              <p className="text-2xl font-semibold tabular-nums text-navy">{value}</p>
              <p className="mt-0.5 text-[12px] text-[#6b7280]">{label}</p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-[14px] border border-[#e2e8f0] bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e2e8f0]/50 bg-teal-tint text-left">
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.05em] text-[#6b7280]">Name</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.05em] text-[#6b7280]">Role</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.05em] text-[#6b7280]">Joined</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.05em] text-[#6b7280]">Change Role</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile, i) => {
                const isSelf = profile.id === session?.user.id
                const badge = ROLE_BADGE[profile.role]
                const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length]
                return (
                  <tr
                    key={profile.id}
                    className="border-b border-[#f1f5f9] last:border-0 transition-colors hover:bg-teal-tint"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                          style={{ background: avatarColor }}
                        >
                          {getInitials(profile.full_name ?? '')}
                        </div>
                        <span className="text-[13px] font-semibold text-navy">
                          {profile.full_name}
                          {isSelf && <span className="ml-1.5 text-[11px] font-normal text-[#6b7280]">(you)</span>}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{ background: badge.bg, color: badge.text }}
                      >
                        {ROLE_LABELS[profile.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#6b7280]">
                      {new Date(profile.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <RoleForm userId={profile.id} currentRole={profile.role} isSelf={isSelf} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
