'use server'

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

  // TODO(#2): replace with Supabase insert once auth (#1) is wired up
  // const supabase = await createClient()
  // const { error } = await supabase.from('clients').insert({ first_name, last_name, dob, phone, email, address, program, created_by: user.id })
  // if (error) return { error: error.message }

  // Stub: log and return success for now
  console.log('createClient stub called', { firstName, lastName, dob, phone, email, address, program })

  // redirect('/clients') — uncomment when Supabase is wired
  return {}
}
