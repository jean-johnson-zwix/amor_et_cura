'use server'

import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/supabase/session'

export async function completeTask(
  id: string
): Promise<{ error?: string; success?: boolean }> {
  const session = await getSession()
  if (!session) return { error: 'Not authenticated.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('follow_ups')
    .update({ status: 'completed' })
    .eq('id', id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function updateTask(
  id: string,
  updates: { description?: string; urgency?: 'high' | 'medium' | 'low'; suggested_due_date?: string | null }
): Promise<{ error?: string; success?: boolean }> {
  const session = await getSession()
  if (!session) return { error: 'Not authenticated.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('follow_ups')
    .update(updates)
    .eq('id', id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteTask(
  id: string
): Promise<{ error?: string; success?: boolean }> {
  const session = await getSession()
  if (!session) return { error: 'Not authenticated.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('follow_ups')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function createTask(task: {
  description: string
  urgency: 'high' | 'medium' | 'low'
  category: 'Referral' | 'Medical' | 'Document' | 'Financial' | 'Check-in'
  client_id: string
  suggested_due_date?: string | null
}): Promise<{ error?: string; success?: boolean; id?: string }> {
  const session = await getSession()
  if (!session) return { error: 'Not authenticated.' }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('follow_ups')
    .insert({
      description: task.description,
      urgency: task.urgency,
      category: task.category,
      client_id: task.client_id,
      suggested_due_date: task.suggested_due_date ?? null,
      status: 'active',
    })
    .select('id')
    .single()

  if (error) return { error: error.message }
  return { success: true, id: data?.id }
}
