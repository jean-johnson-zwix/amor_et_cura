'use client'

import { useActionState } from 'react'
import { updateUserRole } from './actions'
import { Button } from '@/components/ui/button'
import type { UserRole } from '@/types/database'

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'admin',       label: 'Admin' },
  { value: 'case_worker', label: 'Case Worker' },
  { value: 'read_only',   label: 'Read Only' },
]

export function RoleForm({
  userId,
  currentRole,
  isSelf,
}: {
  userId: string
  currentRole: UserRole
  isSelf: boolean
}) {
  const [state, action, pending] = useActionState(updateUserRole, null)

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="userId" value={userId} />
      <select
        name="role"
        defaultValue={currentRole}
        disabled={isSelf || pending}
        className="rounded-md border border-input bg-background px-2 py-1 text-sm focus:border-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        {ROLES.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      <Button type="submit" size="sm" variant="outline" disabled={isSelf || pending}>
        {pending ? 'Saving…' : 'Save'}
      </Button>
      {state && 'error' in state && <span className="text-xs text-destructive">{state.error}</span>}
      {state && 'success' in state && <span className="text-xs text-green-600">Saved</span>}
    </form>
  )
}
