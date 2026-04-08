'use server'

import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/supabase/session'

/** Accept an AI suggestion: promotes it to an active task with case-worker-chosen urgency & due date. */
export async function acceptFollowUp(
  id: string,
  urgency: 'high' | 'medium' | 'low',
  dueDate: string | null     // YYYY-MM-DD set by caseworker, or null
): Promise<{ error?: string; success?: boolean }> {
  const session = await getSession()
  if (!session) return { error: 'Not authenticated.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('follow_ups')
    .update({ status: 'active', urgency, suggested_due_date: dueDate })
    .eq('id', id)

  if (error) return { error: error.message }
  return { success: true }
}

/** Dismiss an AI suggestion: hides it permanently. */
export async function dismissFollowUp(
  id: string
): Promise<{ error?: string; success?: boolean }> {
  const session = await getSession()
  if (!session) return { error: 'Not authenticated.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('follow_ups')
    .update({ status: 'dismissed' })
    .eq('id', id)

  if (error) return { error: error.message }
  return { success: true }
}
