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
  BarChart3,
  CalendarDays,
  ClipboardList,
  ShieldCheck,
  UserCog,
  Settings,
  FileText,
  LogOut,
  ChevronDown,
  CheckSquare,
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
  { href: '/tasks',     label: 'My Tasks',  icon: CheckSquare },
  { href: '/clients',   label: 'Clients',   icon: Users },
]

const APPOINTMENTS_NAV = [
  { href: '/services/schedule', label: 'Upcoming', icon: CalendarDays },
  { href: '/services/visits',   label: 'Past', icon: ClipboardList },
]

const ADMIN_NAV = [
  { href: '/admin', label: 'Settings', icon: ShieldCheck }
]

export function NavBar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const isAdmin = profile?.role === 'admin'
  const inServices = pathname.startsWith('/services')
  const inAdmin = pathname.startsWith('/admin')

  const [adminOpen, setAdminOpen] = useState(inAdmin)

  return (
    <aside className="flex h-screen w-52 shrink-0 flex-col bg-navy overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 shrink-0">
        <div className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded bg-teal">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M8 13.5C8 13.5 1.5 9.5 1.5 5.5C1.5 3.567 3.067 2 5 2C6.15 2 7.17 2.57 7.83 3.44L8 3.67L8.17 3.44C8.83 2.57 9.85 2 11 2C12.933 2 14.5 3.567 14.5 5.5C14.5 9.5 8 13.5 8 13.5Z"
              fill="white"
            />
          </svg>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[12px] font-semibold text-white">Amor Et Cura</span>
          <span className="text-[9px] text-[#6B7280]">Case Management</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-2">
        {/* Main section */}
        <div className="mb-1 px-2 pt-2">
          <span className="text-[9px] font-semibold uppercase tracking-widest text-[#6B7280]">Main</span>
        </div>
        <div className="flex flex-col gap-0.5">
          {MAIN_NAV.map(({ href, label, icon: Icon }) => {
            const active =
              href === '/clients'
                ? pathname.startsWith('/clients')
                : href === '/tasks'
                ? pathname.startsWith('/tasks')
                : pathname === '/dashboard' || pathname === '/'
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded px-3 py-2.5 text-[13px] font-medium transition-colors min-h-10',
                  active
                    ? 'bg-teal text-white'
                    : 'text-[#9CA3AF] hover:bg-[#1F2937] hover:text-white'
                )}
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </div>

        {/* Appointments section */}
        <div className="mb-1 mt-5 px-2">
          <span className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280]">Appointments</span>
        </div>
        <div className="flex flex-col gap-0.5">
          {APPOINTMENTS_NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded px-3 py-2.5 text-[13px] font-medium transition-colors min-h-10',
                  active
                    ? 'bg-teal text-white'
                    : 'text-[#9CA3AF] hover:bg-[#1F2937] hover:text-white'
                )}
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </div>

        {/* Admin panel — collapsible, admin only */}
        {isAdmin && (
          <div className="mt-4">
            <div className="mb-1 mt-5 px-2">
          <span className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280]">Admin</span>
        </div>
        <div className="flex flex-col gap-0.5">
          {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded px-3 py-2.5 text-[13px] font-medium transition-colors min-h-10',
                  active
                    ? 'bg-teal text-white'
                    : 'text-[#9CA3AF] hover:bg-[#1F2937] hover:text-white'
                )}
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </div>
            </div>
        )}
      </nav>

      {/* Bottom user info */}
      <div className="shrink-0 border-t border-[#374151] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-teal text-[11px] font-semibold text-white">
            {getInitials(profile?.full_name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-medium text-[#D1D5DB]">{profile?.full_name ?? '—'}</p>
            <p className="text-[9px] text-[#6B7280]">
              {profile ? (ROLE_LABELS[profile.role] ?? profile.role) : ''}
            </p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              title="Sign out"
              className="text-[#6B7280] transition-colors hover:text-[#D1D5DB]"
            >
              <LogOut className="size-3.5" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
