import 'server-only'
import type { User } from '@supabase/supabase-js'
import { createClient } from './server'
import { getProfile } from './queries'
import type { Profile } from '@/types/database'

export interface Session {
  user: User
  profile: Profile | null
}

/**
 * Returns the authenticated user and their profile in one call.
 * Use this in layouts and pages instead of calling getUser() + getProfile() separately.
 * Returns null if unauthenticated (proxy.ts redirects before this is reached in protected routes).
 */
export async function getSession(): Promise<Session | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const profile = await getProfile(user.id)
  return { user, profile }
}
