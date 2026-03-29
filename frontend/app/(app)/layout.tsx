import { NavBar } from '@/components/nav-bar'
import { getSession } from '@/lib/supabase/session'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  return (
    <div className="flex h-screen overflow-hidden">
      <NavBar profile={session?.profile ?? null} />
      <main className="flex-1 flex flex-col overflow-y-auto bg-teal-tint">
        {children}
      </main>
    </div>
  )
}
