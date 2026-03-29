'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/login/actions'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types/database'
import {
  LayoutDashboard,
  Users,
  Activity,
  CalendarDays,
  ClipboardList,
  ShieldCheck,
  UserCog,
  Settings,
  FileText,
  LogOut,
} from 'lucide-react'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  case_worker: 'Case Worker',
  viewer: 'Viewer',
}

function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const MAIN_NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients',   label: 'Clients',   icon: Users },
  { href: '/services',  label: 'Services',  icon: Activity },
]

const SERVICES_SUB_NAV = [
  { href: '/services/schedule', label: 'Calendar',   icon: CalendarDays },
  { href: '/services/visits',   label: 'All Visits', icon: ClipboardList },
]

const ADMIN_NAV = [
  { href: '/admin',             label: 'Overview',    icon: ShieldCheck },
  { href: '/admin/users',       label: 'Users',       icon: UserCog },
  { href: '/admin/settings',    label: 'Settings',    icon: Settings },
  { href: '/admin/audit-log',   label: 'Audit Log',   icon: FileText },
]

export function NavBar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const isAdmin = profile?.role === 'admin'
  const inServices = pathname.startsWith('/services')

  return (
    <aside className="flex h-screen w-52 shrink-0 flex-col bg-[#0a1e52] overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 shrink-0">
        <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-[#00bd8e]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M8 13.5C8 13.5 1.5 9.5 1.5 5.5C1.5 3.567 3.067 2 5 2C6.15 2 7.17 2.57 7.83 3.44L8 3.67L8.17 3.44C8.83 2.57 9.85 2 11 2C12.933 2 14.5 3.567 14.5 5.5C14.5 9.5 8 13.5 8 13.5Z"
              fill="white"
            />
          </svg>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[12px] font-semibold text-white">Amor Et Cura</span>
          <span className="text-[9px] text-[#7890c4]">Case Management</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-2">
        {/* Main section */}
        <div className="mb-1 px-2 pt-2">
          <span className="text-[9px] font-semibold uppercase tracking-widest text-[#4a62a0]">Main</span>
        </div>
        <div className="flex flex-col gap-0.5">
          {MAIN_NAV.map(({ href, label, icon: Icon }) => {
            const active =
              href === '/services'
                ? pathname.startsWith('/services')
                : href === '/clients'
                ? pathname.startsWith('/clients')
                : pathname === '/dashboard' || pathname === '/'
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] font-medium transition-colors',
                  active
                    ? 'bg-[#00bd8e] text-white'
                    : 'text-[#c5d0e4] hover:bg-[#1f3e80] hover:text-white'
                )}
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </div>

        {/* Services sub-nav */}
        {inServices && (
          <div className="mt-1 ml-4 flex flex-col gap-0.5 border-l border-[#1f3e80] pl-2">
            {SERVICES_SUB_NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] font-medium transition-colors',
                    active
                      ? 'bg-[#00bd8e] text-white'
                      : 'text-[#c5d0e4] hover:bg-[#1f3e80] hover:text-white'
                  )}
                >
                  <Icon className="size-3.5 shrink-0" />
                  {label}
                </Link>
              )
            })}
          </div>
        )}

        {/* Admin section */}
        {isAdmin && (
          <>
            <div className="mb-1 mt-4 px-2">
              <span className="text-[9px] font-semibold uppercase tracking-widest text-[#4a62a0]">Admin</span>
            </div>
            <div className="flex flex-col gap-0.5">
              {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
                const active =
                  href === '/admin'
                    ? pathname === '/admin'
                    : pathname.startsWith(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] font-medium transition-colors',
                      active
                        ? 'bg-[#00bd8e] text-white'
                        : 'text-[#c5d0e4] hover:bg-[#1f3e80] hover:text-white'
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    {label}
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </nav>

      {/* Bottom user info */}
      <div className="shrink-0 border-t border-[#1f3e80] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#00bd8e] text-[11px] font-semibold text-white">
            {getInitials(profile?.full_name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-medium text-[#c5d0e4]">{profile?.full_name ?? '—'}</p>
            <p className="text-[9px] text-[#4a62a0]">
              {profile ? (ROLE_LABELS[profile.role] ?? profile.role) : ''}
            </p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              title="Sign out"
              className="text-[#4a62a0] transition-colors hover:text-[#c5d0e4]"
            >
              <LogOut className="size-3.5" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
