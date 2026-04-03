import type { ReactNode } from 'react'
import Link from 'next/link'
import { GlobalSearchBar } from '@/components/GlobalSearchBar'

export type Crumb = { label: string; href?: string }

export function Topbar({ crumbs, actions }: { crumbs: Crumb[]; actions?: ReactNode }) {
  return (
    <div className="sticky top-0 z-10 flex h-12 shrink-0 items-center justify-between border-b border-[#E5E7EB] bg-white px-6">
      <nav className="flex items-center gap-1 text-[12px]">
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-[#D1D5DB] mx-0.5">/</span>}
            {crumb.href ? (
              <Link href={crumb.href} className="text-[#6B7280] hover:text-navy transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="font-semibold text-navy">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <GlobalSearchBar />
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}
