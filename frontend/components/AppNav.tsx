'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { CalendarDays, ClipboardList, ShieldCheck, Users, Settings, FileText } from 'lucide-react'
import type { Profile } from '@/types/database'

type SubNavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> }

const SERVICES_NAV: SubNavItem[] = [
  { href: '/services/schedule', label: 'Calendar',   icon: CalendarDays },
  { href: '/services/visits',   label: 'All Visits', icon: ClipboardList },
]

const ADMIN_NAV: SubNavItem[] = [
  { href: '/admin',             label: 'Overview',        icon: ShieldCheck },
  { href: '/admin/users',       label: 'User Management', icon: Users },
  { href: '/admin/settings',    label: 'Settings',        icon: Settings },
  { href: '/admin/audit-log',   label: 'Audit Log',       icon: FileText },
]

function isActive(itemHref: string, pathname: string, allItems: SubNavItem[]): boolean {
  if (pathname === itemHref) return true
  if (pathname.startsWith(itemHref + '/')) {
    const betterMatch = allItems.some(
      (other) => other.href !== itemHref && pathname.startsWith(other.href)
    )
    return !betterMatch
  }
  return false
}

export default function AppNav({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()

  const inServices = pathname.startsWith('/services')
  const inAdmin = pathname.startsWith('/admin') && profile?.role === 'admin'

  if (!inServices && !inAdmin) return null

  const items = inAdmin ? ADMIN_NAV : SERVICES_NAV
  const sectionLabel = inAdmin ? 'Admin' : 'Services'

  return (
    <aside className="flex h-full w-52 flex-col border-r bg-sidebar px-3 py-4 shrink-0">
      <div className="mb-4 px-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
          {sectionLabel}
        </span>
      </div>
      <nav className="flex flex-col gap-1">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors',
              isActive(href, pathname, items)
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
