'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Users, LayoutDashboard, ClipboardList, Settings } from 'lucide-react'

const navItems = [
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/visits', label: 'Visits', icon: ClipboardList },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function AppNav() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-56 flex-col border-r bg-sidebar px-3 py-4">
      <div className="mb-6 px-2">
        <span className="text-base font-semibold tracking-tight">Amor et Cura</span>
      </div>
      <nav className="flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
