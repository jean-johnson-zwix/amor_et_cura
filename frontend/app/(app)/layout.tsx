import { redirect } from 'next/navigation'
import { NavBar } from '@/components/nav-bar'
import { getSession } from '@/lib/supabase/session'
import { createClient } from '@/lib/supabase/server'
import type { OrgSettings } from '@/types/database'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  // Fetch org settings for branding + setup guard (single query, cached per request)
  const supabase = await createClient()
  const { data: orgSettings } = await supabase
    .from('org_settings')
    .select('primary_color, secondary_color, setup_complete')
    .single() as { data: Pick<OrgSettings, 'primary_color' | 'secondary_color' | 'setup_complete'> | null }

  // Redirect admin to setup wizard if setup hasn't been completed
  if (session?.profile?.role === 'admin' && (!orgSettings || !orgSettings.setup_complete)) {
    redirect('/setup')
  }

  const primaryColor   = orgSettings?.primary_color   ?? '#F2673C'
  const secondaryColor = orgSettings?.secondary_color ?? '#8B5CF6'

  return (
    <>
      {/* Inject org brand colors — overrides the defaults in globals.css */}
      <style>{`:root { --org-primary: ${primaryColor}; --org-secondary: ${secondaryColor}; }`}</style>
      <div className="flex h-screen overflow-hidden">
        <NavBar profile={session?.profile ?? null} />
        <main className="flex-1 flex flex-col overflow-y-auto bg-teal-tint">
          {children}
        </main>
      </div>
    </>
  )
}
