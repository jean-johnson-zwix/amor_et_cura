'use server'

import { redirect } from 'next/navigation'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/supabase/session'
import { can } from '@/lib/auth/permissions'
import { logAudit } from '@/lib/audit'

export type NewClientFormState = {
  error?: string
  fieldErrors?: Partial<Record<string, string>>
}

export async function createClient(
  _prev: NewClientFormState,
  formData: FormData
): Promise<NewClientFormState> {
  const firstName = (formData.get('first_name') as string | null)?.trim()
  const lastName = (formData.get('last_name') as string | null)?.trim()
  const dob = formData.get('dob') as string | null
  const phone = (formData.get('phone') as string | null)?.trim() || null
  const email = (formData.get('email') as string | null)?.trim() || null
  const address = (formData.get('address') as string | null)?.trim() || null
  const programs = formData.getAll('programs').map((v) => String(v).trim()).filter(Boolean)

  // Collect custom fields (multiselect values come as arrays via getAll)
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

  // Basic validation
  const fieldErrors: Record<string, string> = {}
  if (!firstName) fieldErrors.first_name = 'First name is required.'
  if (!lastName) fieldErrors.last_name = 'Last name is required.'
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors }

  const session = await getSession()
  if (!can.createClient(session?.profile?.role)) return { error: 'Not authorized.' }

  const supabase = await createSupabaseClient()
  const { data, error } = await supabase.from('clients').insert({
    first_name: firstName,
    last_name: lastName,
    dob: dob || null,
    phone,
    email,
    address,
    programs,
    custom_fields: customFields,
    created_by: session!.user.id,
  }).select('id').single()

  if (error) return { error: error.message }

  if (data?.id) {
    await logAudit({ actorId: session!.user.id, action: 'CREATE', tableName: 'clients', recordId: data.id })
  }

  redirect('/clients')
}
