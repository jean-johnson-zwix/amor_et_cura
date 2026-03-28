import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/supabase/queries'
import { NavBar } from '@/components/nav-bar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // proxy.ts guarantees user is authenticated before this layout runs
  const profile = user ? await getProfile(user.id) : null

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar profile={profile} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}
