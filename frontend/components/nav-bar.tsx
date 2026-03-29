'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import type { Profile } from '@/types/database'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  case_worker: 'Case Worker',
  read_only: 'Read Only',
}

const BASE_NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/clients', label: 'Clients' },
]

const ADMIN_NAV_LINKS = [
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/settings', label: 'Settings' },
  { href: '/admin/audit-log', label: 'Audit Log' },
]

export function NavBar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const isAdmin = profile?.role === 'admin'
  const navLinks = isAdmin ? [...BASE_NAV_LINKS, ...ADMIN_NAV_LINKS] : BASE_NAV_LINKS

  return (
    <nav className="border-b bg-background shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-8">
          <span className="text-base font-semibold">Amor et Cura</span>
          <div className="hidden items-center gap-1 sm:flex">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === href || pathname.startsWith(href + '/')
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium">{profile?.full_name ?? '—'}</p>
            <p className="text-xs text-muted-foreground">
              {profile ? (ROLE_LABELS[profile.role] ?? profile.role) : ''}
            </p>
          </div>
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">Sign out</Button>
          </form>
        </div>
      </div>
    </nav>
  )
}
