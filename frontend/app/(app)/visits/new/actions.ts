'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/supabase/session'

export type NewVisitFormState = {
  error?: string
  fieldErrors?: Partial<Record<string, string>>
  success?: boolean
}

export async function createVisit(
  _prev: NewVisitFormState,
  formData: FormData
): Promise<NewVisitFormState> {
  const clientId = (formData.get('client_id') as string | null)?.trim()
  const visitDate = (formData.get('visit_date') as string | null)?.trim()
  const serviceTypeId = (formData.get('service_type_id') as string | null)?.trim() || null
  const durationMinutes = formData.get('duration_minutes')
  const notes = (formData.get('notes') as string | null)?.trim() || null

  const fieldErrors: Record<string, string> = {}
  if (!clientId) fieldErrors.client_id = 'Client is required.'
  if (!visitDate) fieldErrors.visit_date = 'Visit date is required.'
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors }

  const duration = durationMinutes ? parseInt(durationMinutes as string, 10) : null

  const session = await getSession()
  if (!session) return { error: 'Not authenticated.' }

  const supabase = await createClient()
  const { error } = await supabase.from('visits').insert({
    client_id: clientId,
    case_worker_id: session.user.id,
    service_type_id: serviceTypeId,
    visit_date: visitDate,
    duration_minutes: duration,
    notes,
  })

  if (error) return { error: error.message }

  redirect(`/clients/${clientId}`)
}
