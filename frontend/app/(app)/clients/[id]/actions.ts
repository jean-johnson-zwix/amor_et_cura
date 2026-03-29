'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/supabase/session'
import { can } from '@/lib/auth/permissions'
import { logAudit } from '@/lib/audit'
import { randomUUID } from 'crypto'

// ── Deactivate / Reactivate ───────────────────────────────────

export async function setClientActive(clientId: string, isActive: boolean): Promise<void> {
  const session = await getSession()
  if (!can.deactivateClient(session?.profile?.role)) return

  const supabase = await createClient()
  await supabase
    .from('clients')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', clientId)

  await logAudit({
    actorId: session!.user.id,
    action: 'UPDATE',
    tableName: 'clients',
    recordId: clientId,
    changedFields: ['is_active'],
  })

  revalidatePath(`/clients/${clientId}`)
  revalidatePath('/clients')
}

// ── Edit demographics ─────────────────────────────────────────

export type EditClientFormState = { error?: string; fieldErrors?: Partial<Record<string, string>> }

export async function updateClient(
  _prev: EditClientFormState,
  formData: FormData
): Promise<EditClientFormState> {
  const clientId = formData.get('client_id') as string
  const firstName = (formData.get('first_name') as string | null)?.trim()
  const lastName  = (formData.get('last_name')  as string | null)?.trim()
  const dob       = (formData.get('dob')        as string | null) || null
  const phone     = (formData.get('phone')      as string | null)?.trim() || null
  const email     = (formData.get('email')      as string | null)?.trim() || null
  const address   = (formData.get('address')    as string | null)?.trim() || null
  const programs  = formData.getAll('programs').map((v) => String(v).trim()).filter(Boolean)

  const customFields: Record<string, unknown> = {}
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('cf_')) {
      const fieldName = key.slice(3)
      const existing = customFields[fieldName]
      if (existing !== undefined) {
        customFields[fieldName] = Array.isArray(existing) ? [...existing, value] : [existing, value]
      } else {
        customFields[fieldName] = value
      }
    }
  }

  const fieldErrors: Record<string, string> = {}
  if (!firstName) fieldErrors.first_name = 'First name is required.'
  if (!lastName)  fieldErrors.last_name  = 'Last name is required.'
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors }

  const session = await getSession()
  if (!can.editClient(session?.profile?.role)) return { error: 'Not authorized.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('clients')
    .update({
      first_name: firstName,
      last_name: lastName,
      dob,
      phone,
      email,
      address,
      programs,
      custom_fields: customFields,
      updated_at: new Date().toISOString(),
    })
    .eq('id', clientId)

  if (error) return { error: error.message }

  await logAudit({
    actorId: session!.user.id,
    action: 'UPDATE',
    tableName: 'clients',
    recordId: clientId,
    changedFields: ['first_name', 'last_name', 'dob', 'phone', 'email', 'address', 'program'],
  })

  redirect(`/clients/${clientId}`)
}

// ── Household / Family linking ────────────────────────────────

export async function linkFamilyMember(
  clientId: string,
  memberId: string
): Promise<{ error?: string }> {
  const session = await getSession()
  if (!can.editClient(session?.profile?.role)) return { error: 'Not authorized.' }

  const supabase = await createClient()

  // Fetch both clients' current household_id
  const { data: clients, error: fetchError } = await supabase
    .from('clients')
    .select('id, household_id')
    .in('id', [clientId, memberId])

  if (fetchError || !clients || clients.length < 2) {
    return { error: 'Could not find both clients.' }
  }

  const current = clients.find((c) => c.id === clientId)
  const member = clients.find((c) => c.id === memberId)

  if (!current || !member) return { error: 'Could not find both clients.' }

  // Use existing household_id if either client already belongs to one,
  // otherwise create a new shared UUID.
  const householdId = current.household_id ?? member.household_id ?? randomUUID()

  const { error: updateError } = await supabase
    .from('clients')
    .update({ household_id: householdId, updated_at: new Date().toISOString() })
    .in('id', [clientId, memberId])

  if (updateError) return { error: updateError.message }

  revalidatePath(`/clients/${clientId}`)
  revalidatePath(`/clients/${memberId}`)
  return {}
}
