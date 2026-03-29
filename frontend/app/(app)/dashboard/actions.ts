'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/supabase/session'
import { logAudit } from '@/lib/audit'

export async function cancelAppointment(id: string): Promise<{ error?: string }> {
  const session = await getSession()
  if (!session) return { error: 'You are not signed in.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: 'Something went wrong. Please try again.' }

  await logAudit({ actorId: session.user.id, action: 'UPDATE', tableName: 'appointments', recordId: id, changedFields: ['status'] })
  revalidatePath('/dashboard')
  return {}
}

export async function rescheduleAppointment(
  id: string,
  scheduledAt: string
): Promise<{ error?: string }> {
  const session = await getSession()
  if (!session) return { error: 'You are not signed in.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('appointments')
    .update({ scheduled_at: scheduledAt, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: 'Something went wrong. Please try again.' }

  await logAudit({ actorId: session.user.id, action: 'UPDATE', tableName: 'appointments', recordId: id, changedFields: ['scheduled_at'] })
  revalidatePath('/dashboard')
  return {}
}
