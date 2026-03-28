'use server'

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

  // TODO(#3): replace with Supabase insert once auth (#1) is wired up
  // const supabase = await createClient()
  // const { data: { user } } = await supabase.auth.getUser()
  // const { error } = await supabase.from('visits').insert({
  //   client_id: clientId,
  //   case_worker_id: user.id,
  //   service_type_id: serviceTypeId,
  //   visit_date: visitDate,
  //   duration_minutes: duration,
  //   notes,
  // })
  // if (error) return { error: error.message }
  // redirect(`/clients/${clientId}`)

  console.log('createVisit stub called', { clientId, visitDate, serviceTypeId, duration, notes })
  return { success: true }
}
