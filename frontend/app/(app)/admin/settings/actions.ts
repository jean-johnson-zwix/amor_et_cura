'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { can } from '@/lib/auth/permissions'
import { getSession } from '@/lib/supabase/session'
import type { FieldType, FieldAppliesTo } from '@/types/database'

const VALID_FIELD_TYPES: FieldType[] = ['text', 'number', 'date', 'boolean', 'select', 'multiselect']
const VALID_APPLIES_TO: FieldAppliesTo[] = ['client', 'visit']

export type FieldFormState = { error?: string; success?: boolean }

export async function addFieldDefinition(
  _prev: FieldFormState,
  formData: FormData
): Promise<FieldFormState> {
  const session = await getSession()
  if (!can.manageUsers(session?.profile?.role)) return { error: 'Not authorized.' }

  const label = (formData.get('label') as string | null)?.trim()
  const fieldType = (formData.get('field_type') as string | null)?.trim()
  const appliesTo = (formData.get('applies_to') as string | null)?.trim() || 'client'
  const required = formData.get('required') === 'on'
  const rawOptions = (formData.get('options') as string | null)?.trim()

  if (!label) return { error: 'Label is required.' }
  if (!fieldType || !VALID_FIELD_TYPES.includes(fieldType as FieldType)) return { error: 'Invalid field type.' }
  if (!VALID_APPLIES_TO.includes(appliesTo as FieldAppliesTo)) return { error: 'Invalid applies_to.' }

  // Derive slug from label
  const name = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')

  const options = rawOptions
    ? rawOptions.split(',').map((s) => s.trim()).filter(Boolean)
    : null

  const supabase = await createClient()
  const { error } = await supabase.from('field_definitions').insert({
    name,
    label,
    field_type: fieldType as FieldType,
    applies_to: appliesTo as FieldAppliesTo,
    required,
    options,
  })

  if (error) return { error: error.message }

  revalidatePath('/admin/settings')
  return { success: true }
}

export async function toggleFieldActive(id: string, isActive: boolean): Promise<void> {
  const session = await getSession()
  if (!can.manageUsers(session?.profile?.role)) return

  const supabase = await createClient()
  await supabase.from('field_definitions').update({ is_active: isActive }).eq('id', id)
  revalidatePath('/admin/settings')
}

export async function deleteFieldDefinition(id: string): Promise<void> {
  const session = await getSession()
  if (!can.manageUsers(session?.profile?.role)) return

  const supabase = await createClient()
  await supabase.from('field_definitions').delete().eq('id', id)
  revalidatePath('/admin/settings')
}

// ── Service Types ─────────────────────────────────────────────

export type ServiceTypeFormState = { error?: string; success?: boolean }

export async function addServiceType(
  _prev: ServiceTypeFormState,
  formData: FormData
): Promise<ServiceTypeFormState> {
  const session = await getSession()
  if (!can.configureSettings(session?.profile?.role)) return { error: 'Not authorized.' }

  const name = (formData.get('name') as string | null)?.trim()
  if (!name) return { error: 'Name is required.' }

  const supabase = await createClient()
  const { error } = await supabase.from('service_types').insert({ name })

  if (error) return { error: error.code === '23505' ? 'A service type with that name already exists.' : error.message }

  revalidatePath('/admin/settings')
  return { success: true }
}

export async function toggleServiceTypeActive(id: string, isActive: boolean): Promise<void> {
  const session = await getSession()
  if (!can.configureSettings(session?.profile?.role)) return

  const supabase = await createClient()
  await supabase.from('service_types').update({ is_active: isActive }).eq('id', id)
  revalidatePath('/admin/settings')
}
