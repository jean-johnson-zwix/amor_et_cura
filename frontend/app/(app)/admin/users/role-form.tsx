'use client'

import { useActionState } from 'react'
import { updateUserRole } from './actions'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import type { UserRole } from '@/types/database'

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'admin',       label: 'Admin' },
  { value: 'case_worker', label: 'Case Worker' },
  { value: 'viewer',      label: 'Viewer' },
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
      <Select
        name="role"
        defaultValue={currentRole}
        disabled={isSelf || pending}
      >
        {ROLES.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </Select>
      <Button type="submit" size="sm" variant="outline" disabled={isSelf || pending}>
        {pending ? 'Saving…' : 'Save'}
      </Button>
      {state && 'error' in state && <span className="text-xs text-destructive">{state.error}</span>}
      {state && 'success' in state && <span className="text-xs text-green-600">Saved</span>}
    </form>
  )
}
