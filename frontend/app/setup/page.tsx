import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/supabase/session'
import SetupWizard from './SetupWizard'
import type { ServiceType } from '@/types/database'
import type { AiTask } from '@/types/database'

export default async function SetupPage() {
  const session = await getSession()

  if (!session) redirect('/login')
  if (session.profile?.role !== 'admin') redirect('/dashboard')

  const supabase = await createClient()

  const [
    { data: orgSettings },
    { data: serviceTypes },
    { data: aiTasks },
  ] = await Promise.all([
    supabase.from('org_settings').select('*').single(),
    supabase.from('service_types').select('*').order('name'),
    supabase.from('ai_tasks').select('slug, display_name, description, task_type').order('slug'),
  ])

  // Already set up — go to dashboard
  if (orgSettings?.setup_complete) redirect('/dashboard')

  return (
    <SetupWizard
      initialSettings={orgSettings ?? null}
      serviceTypes={(serviceTypes ?? []) as ServiceType[]}
      aiTasks={(aiTasks ?? []) as AiTask[]}
    />
  )
}
