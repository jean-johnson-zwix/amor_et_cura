'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/supabase/session'
import { can } from '@/lib/auth/permissions'

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
  const program = (formData.get('program') as string | null)?.trim() || null

  // Basic validation
  const fieldErrors: Record<string, string> = {}
  if (!firstName) fieldErrors.first_name = 'First name is required.'
  if (!lastName) fieldErrors.last_name = 'Last name is required.'
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors }

  const session = await getSession()
  if (!can.createClient(session?.profile?.role)) return { error: 'Not authorized.' }

  const supabase = await createClient()
  const { error } = await supabase.from('clients').insert({
    first_name: firstName,
    last_name: lastName,
    dob: dob || null,
    phone,
    email,
    address,
    program,
    created_by: session!.user.id,
  })

  if (error) return { error: error.message }

  redirect('/clients')
}
