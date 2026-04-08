'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/supabase/session'

// ── Helpers ───────────────────────────────────────────────────

async function requireAdmin() {
  const session = await getSession()
  if (session?.profile?.role !== 'admin') {
    throw new Error('Not authorized')
  }
  return session
}

/** Get the single org_settings row, or null if not yet created. */
async function getOrgRow(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data } = await supabase.from('org_settings').select('id').single()
  return data as { id: string } | null
}

async function upsertOrgSettings(
  supabase: Awaited<ReturnType<typeof createClient>>,
  fields: Record<string, unknown>
) {
  const existing = await getOrgRow(supabase)
  if (existing) {
    const { error } = await supabase
      .from('org_settings')
      .update(fields)
      .eq('id', existing.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase.from('org_settings').insert(fields)
    if (error) return { error: error.message }
  }
  return {}
}

// ── Step 1: Identity ─────────────────────────────────────────

export type SetupFormState = { error?: string }

export async function saveIdentity(
  _prev: SetupFormState,
  formData: FormData
): Promise<SetupFormState> {
  await requireAdmin()
  const supabase = await createClient()

  const orgName   = (formData.get('org_name') as string).trim()
  const mission   = (formData.get('org_mission') as string).trim()
  const email     = (formData.get('contact_email') as string).trim()
  const logoUrl   = (formData.get('org_logo_url') as string | null)?.trim() || null

  if (!orgName) return { error: 'Organization name is required.' }

  const result = await upsertOrgSettings(supabase, { org_name: orgName, org_mission: mission, contact_email: email, org_logo_url: logoUrl })
  return result
}

// ── Step 2: Branding ─────────────────────────────────────────

export async function saveBranding(
  _prev: SetupFormState,
  formData: FormData
): Promise<SetupFormState> {
  await requireAdmin()
  const supabase = await createClient()

  const primary   = (formData.get('primary_color') as string).trim()
  const secondary = (formData.get('secondary_color') as string).trim()

  const hexPattern = /^#[0-9A-Fa-f]{6}$/
  if (!hexPattern.test(primary))   return { error: 'Primary color must be a valid hex color (e.g. #F2673C).' }
  if (!hexPattern.test(secondary)) return { error: 'Secondary color must be a valid hex color (e.g. #8B5CF6).' }

  const result = await upsertOrgSettings(supabase, { primary_color: primary, secondary_color: secondary })
  return result
}

// ── Step 3: Programs (service types) ─────────────────────────
// Admin enters program names from scratch. We disable all existing
// seeded types and insert the ones they defined.

export async function savePrograms(programNames: string[]): Promise<{ error?: string }> {
  await requireAdmin()
  const supabase = await createClient()

  // Disable all existing service types (start clean)
  await supabase.from('service_types').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000')

  if (programNames.length === 0) return {}

  // Upsert by name — re-enable if it existed before, insert if new
  const { error } = await supabase
    .from('service_types')
    .upsert(
      programNames.map(name => ({ name, is_active: true })),
      { onConflict: 'name' }
    )

  if (error) return { error: error.message }
  return {}
}

// ── Step 4: Custom Field Templates ───────────────────────────

const HMIS_FIELDS = [
  { label: 'Veteran Status',              name: 'veteran_status',                field_type: 'boolean',  applies_to: 'client', sort_order: 100 },
  { label: 'Disability Status',           name: 'disability_status',             field_type: 'boolean',  applies_to: 'client', sort_order: 101 },
  { label: 'Household Size',              name: 'household_size',                field_type: 'number',   applies_to: 'client', sort_order: 102 },
  { label: 'Monthly Household Income ($)',name: 'monthly_household_income',      field_type: 'number',   applies_to: 'client', sort_order: 103 },
  { label: 'Last Permanent Address',      name: 'last_permanent_address',        field_type: 'text',     applies_to: 'client', sort_order: 104 },
  { label: 'Days Homeless (Approximate)', name: 'length_of_time_homeless_days',  field_type: 'number',   applies_to: 'client', sort_order: 105 },
]

export async function applyFieldTemplate(template: 'basic' | 'hmis' | 'custom'): Promise<{ error?: string }> {
  await requireAdmin()

  if (template !== 'hmis') return {}  // basic & custom: no fields to insert

  const supabase = await createClient()
  const { error } = await supabase.from('field_definitions').upsert(
    HMIS_FIELDS.map(f => ({ ...f, required: false, is_active: true })),
    { onConflict: 'name' }
  )
  if (error) return { error: error.message }
  return {}
}

// ── Step 5: AI Feature Flags ──────────────────────────────────

export async function saveAiFlags(enabledSlugs: string[]): Promise<{ error?: string }> {
  await requireAdmin()
  const supabase = await createClient()

  const { data: allTasks } = await supabase.from('ai_tasks').select('slug')
  if (!allTasks) return { error: 'Could not load AI tasks.' }

  const allSlugs     = allTasks.map((t: { slug: string }) => t.slug)
  const disabledSlugs = allSlugs.filter((s: string) => !enabledSlugs.includes(s))

  if (enabledSlugs.length > 0) {
    await supabase.from('ai_task_configs').update({ is_active: true }).in('task_slug', enabledSlugs).eq('priority', 1)
  }
  if (disabledSlugs.length > 0) {
    await supabase.from('ai_task_configs').update({ is_active: false }).in('task_slug', disabledSlugs).eq('priority', 1)
  }

  return {}
}

// ── Complete Setup ────────────────────────────────────────────

export async function completeSetup(): Promise<void> {
  await requireAdmin()
  const supabase = await createClient()
  await upsertOrgSettings(supabase, { setup_complete: true })
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
