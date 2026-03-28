import { redirect } from 'next/navigation'
import { getSession } from '@/lib/supabase/session'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (session?.profile?.role !== 'admin') {
    redirect('/')
  }

  return <>{children}</>
}
