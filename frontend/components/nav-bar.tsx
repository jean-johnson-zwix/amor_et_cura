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

const NAV_LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/clients', label: 'Clients' },
]

export function NavBar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <span className="text-lg font-semibold text-gray-900">Amor et Cura</span>
          <div className="hidden items-center gap-1 sm:flex">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === href
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-gray-900">{profile?.full_name ?? '—'}</p>
            <p className="text-xs text-gray-500">{profile ? (ROLE_LABELS[profile.role] ?? profile.role) : ''}</p>
          </div>
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </nav>
  )
}
