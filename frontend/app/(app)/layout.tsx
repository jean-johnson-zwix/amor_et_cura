import AppNav from '@/components/AppNav'
import { NavBar } from '@/components/nav-bar'
import { getSession } from '@/lib/supabase/session'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <NavBar profile={session?.profile ?? null} />
      <div className="flex flex-1 overflow-hidden">
        <AppNav />
        <main className="flex-1 overflow-y-auto bg-muted/20 p-6">{children}</main>
      </div>
    </div>
  )
}
