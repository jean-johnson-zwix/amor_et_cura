import { getSession } from '@/lib/supabase/session'
import { NavBar } from '@/components/nav-bar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // proxy.ts guarantees user is authenticated before this layout runs
  const session = await getSession()

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar profile={session?.profile ?? null} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}
