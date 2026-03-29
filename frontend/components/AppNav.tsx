'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Users, LayoutDashboard, ClipboardList, CalendarDays, ShieldCheck } from 'lucide-react'
import type { Profile } from '@/types/database'

const NAV_ITEMS = [
  { href: '/clients',   label: 'Clients',   icon: Users },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/visits',    label: 'Visits',    icon: ClipboardList },
  { href: '/schedule',  label: 'Schedule',  icon: CalendarDays },
]

export default function AppNav({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const isAdmin = profile?.role === 'admin'

  const linkClass = (href: string) =>
    cn(
      'flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors',
      pathname === href || pathname.startsWith(href + '/')
        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
    )

  return (
    <aside className="flex h-full w-56 flex-col border-r bg-sidebar px-3 py-4">
      <div className="mb-6 px-2">
        <span className="text-base font-semibold tracking-tight">Amor et Cura</span>
      </div>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={linkClass(href)}>
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        ))}

        {isAdmin && (
          <>
            <div className="mt-4 mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
              Admin
            </div>
            <Link href="/admin" className={linkClass('/admin')}>
              <ShieldCheck className="size-4 shrink-0" />
              Admin
            </Link>
          </>
        )}
      </nav>
    </aside>
  )
}
