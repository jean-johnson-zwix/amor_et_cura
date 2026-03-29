'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/supabase/session'

export type NewAppointmentFormState = {
  error?: string
  fieldErrors?: Partial<Record<string, string>>
  success?: boolean
}

export async function createAppointment(
  _prev: NewAppointmentFormState,
  formData: FormData
): Promise<NewAppointmentFormState> {
  const clientId      = (formData.get('client_id') as string | null)?.trim()
  const scheduledDate = (formData.get('scheduled_date') as string | null)?.trim()
  const scheduledTime = (formData.get('scheduled_time') as string | null)?.trim()
  const serviceTypeId = (formData.get('service_type_id') as string | null)?.trim() || null
  const durationRaw   = formData.get('duration_minutes')
  const notes         = (formData.get('notes') as string | null)?.trim() || null

  const fieldErrors: Record<string, string> = {}
  if (!clientId)      fieldErrors.client_id     = 'Client is required.'
  if (!scheduledDate) fieldErrors.scheduled_date = 'Date is required.'
  if (!scheduledTime) fieldErrors.scheduled_time = 'Time is required.'
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors }

  const scheduledAt = `${scheduledDate}T${scheduledTime}:00`
  const duration = durationRaw ? parseInt(durationRaw as string, 10) : null

  const session = await getSession()
  if (!session) return { error: 'Not authenticated.' }

  const supabase = await createClient()
  const { error } = await supabase.from('appointments').insert({
    client_id: clientId,
    case_worker_id: session.user.id,
    service_type_id: serviceTypeId,
    scheduled_at: scheduledAt,
    duration_minutes: duration,
    notes,
    status: 'scheduled',
  })

  if (error) return { error: error.message }

  redirect('/schedule')
}
