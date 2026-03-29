'use client'

import { useState } from 'react'
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
  ChevronDown,
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
]

const SERVICES_NAV = [
  { href: '/services/schedule', label: 'Upcoming Appointments', icon: CalendarDays },
  { href: '/services/visits',   label: 'Past Visits',           icon: ClipboardList },
]

const ADMIN_NAV = [
  { href: '/admin',             label: 'Overview',  icon: ShieldCheck },
  { href: '/admin/users',       label: 'Users',     icon: UserCog },
  { href: '/admin/settings',    label: 'Settings',  icon: Settings },
  { href: '/admin/audit-log',   label: 'Audit Log', icon: FileText },
]

export function NavBar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const isAdmin = profile?.role === 'admin'
  const inServices = pathname.startsWith('/services')
  const inAdmin = pathname.startsWith('/admin')

  const [adminOpen, setAdminOpen] = useState(inAdmin)

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
        <div className="flex flex-col gap-1">
          {MAIN_NAV.map(({ href, label, icon: Icon }) => {
            const active =
              href === '/clients'
                ? pathname.startsWith('/clients')
                : pathname === '/dashboard' || pathname === '/'
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition-colors min-h-[44px]',
                  active
                    ? 'bg-[#00bd8e] text-white'
                    : 'text-[#c5d0e4] hover:bg-[#1f3e80] hover:text-white'
                )}
              >
                <Icon className="size-5 shrink-0" />
                {label}
              </Link>
            )
          })}
        </div>

        {/* Clinical / Services section */}
        <div className="mb-1 mt-5 px-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#4a62a0]">Clinical / Service</span>
        </div>
        <div className="flex flex-col gap-1">
          {SERVICES_NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition-colors min-h-[44px]',
                  active
                    ? 'bg-[#00bd8e] text-white'
                    : 'text-[#c5d0e4] hover:bg-[#1f3e80] hover:text-white'
                )}
              >
                <Icon className="size-5 shrink-0" />
                {label}
              </Link>
            )
          })}
        </div>

        {/* Admin panel — collapsible, admin only */}
        {isAdmin && (
          <div className="mt-4">
            <button
              onClick={() => setAdminOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-[15px] font-semibold text-[#c5d0e4] transition-colors hover:bg-[#1f3e80] hover:text-white min-h-[44px]"
              aria-expanded={adminOpen}
            >
              <span className="flex items-center gap-2.5">
                <ShieldCheck className="size-4 shrink-0" />
                Admin Panel
              </span>
              <ChevronDown
                className={cn(
                  'size-3.5 transition-transform duration-200',
                  adminOpen && 'rotate-180'
                )}
              />
            </button>

            {adminOpen && (
              <div className="mt-0.5 ml-4 flex flex-col gap-0.5 border-l border-[#1f3e80] pl-2">
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
                        'flex items-center gap-2.5 rounded-xl px-3 py-2 text-[14px] font-semibold transition-colors min-h-[40px]',
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
          </div>
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
