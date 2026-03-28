import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/supabase/queries'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const profile = user ? await getProfile(user.id) : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile?.full_name ?? '—'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here&apos;s an overview of your caseload.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Active Clients', value: '—' },
          { label: 'Visits This Month', value: '—' },
          { label: 'Upcoming Appointments', value: '—' },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">
          Client list, visit logging, and reporting coming soon. Start by adding your first client.
        </p>
      </div>
    </div>
  )
}
