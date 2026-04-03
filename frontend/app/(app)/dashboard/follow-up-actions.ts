'use server'

import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/supabase/session'

export async function updateFollowUpStatus(
  id: string,
  status: 'accepted' | 'dismissed'
): Promise<{ error?: string; success?: boolean }> {
  const session = await getSession()
  if (!session) return { error: 'Not authenticated.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('follow_ups')
    .update({ status })
    .eq('id', id)

  if (error) return { error: error.message }
  return { success: true }
}
