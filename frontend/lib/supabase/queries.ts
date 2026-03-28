import 'server-only'
import { createClient } from './server'
import type { Profile } from '@/types/database'

/**
 * Returns the profile for the given user ID.
 * If no row exists (e.g. user was created before the trigger was applied),
 * upserts one so the dashboard always has a valid profile.
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (!error) return data

  // PGRST116 = no rows — user predates the trigger; create the profile now
  if (error.code === 'PGRST116') {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const fullName =
      (user.user_metadata?.full_name as string | undefined) ??
      user.email?.split('@')[0] ??
      'Unknown'

    const { data: created } = await supabase
      .from('profiles')
      .insert({ id: userId, full_name: fullName, role: 'case_worker' })
      .select()
      .single()

    return created
  }

  console.error('[getProfile]', userId, error.code, error.message)
  return null
}
