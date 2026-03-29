import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import FieldManager from './FieldManager'

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const { data: fields } = await supabase
    .from('field_definitions')
    .select('*')
    .order('applies_to')
    .order('sort_order')
    .order('created_at')

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <nav className="text-sm text-muted-foreground mb-1">
          <Link href="/admin" className="hover:underline">Admin</Link>
          {' / '}
          <span>Settings</span>
        </nav>
        <h1 className="text-xl font-semibold">Configurable Fields</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Define custom fields that appear on client intake and visit log forms. Values are stored per client record.
        </p>
      </div>

      <FieldManager fields={fields ?? []} />
    </div>
  )
}
