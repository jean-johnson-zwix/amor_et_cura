'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { can } from '@/lib/auth/permissions'
import { getProfile } from '@/lib/supabase/queries'
import type { UserRole } from '@/types/database'
import { logAudit } from '@/lib/audit'

const VALID_ROLES: UserRole[] = ['admin', 'case_worker', 'viewer']

export async function updateUserRole(
  _prevState: { error: string } | { success: true } | null,
  formData: FormData
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const profile = await getProfile(user.id)
  if (!can.manageUsers(profile?.role)) {
    return { error: 'Not authorized.' }
  }

  const targetId = formData.get('userId') as string
  const newRole = formData.get('role') as string

  if (!targetId || !VALID_ROLES.includes(newRole as UserRole)) {
    return { error: 'Invalid request.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole as UserRole, updated_at: new Date().toISOString() })
    .eq('id', targetId)

  if (error) {
    console.error('[updateUserRole]', error.code, error.message)
    return { error: 'Failed to update role. Check database permissions.' }
  }

  await logAudit({
    actorId: user.id,
    action: 'UPDATE',
    tableName: 'profiles',
    recordId: targetId,
    changedFields: ['role'],
  })

  revalidatePath('/admin/users')
  return { success: true }
}
