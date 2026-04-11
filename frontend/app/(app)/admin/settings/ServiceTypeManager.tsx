'use client'

import { useActionState, useTransition, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { addServiceType, toggleServiceTypeActive, type ServiceTypeFormState } from './actions'
import type { ServiceType } from '@/types/database'

const ADD_NEW = '__add_new__'

function ServiceTypeChip({ st }: { st: ServiceType }) {
  const [isPending, startTransition] = useTransition()

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 transition-opacity ${isPending ? 'opacity-50' : ''}`}>
      {st.name}
      <button
        onClick={() => startTransition(() => toggleServiceTypeActive(st.id, false))}
        disabled={isPending}
        aria-label={`Disable ${st.name}`}
        className="rounded-full hover:bg-green-200 p-0.5 leading-none disabled:cursor-not-allowed"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-3.5">
          <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
        </svg>
      </button>
    </span>
  )
}

const initialState: ServiceTypeFormState = {}

export default function ServiceTypeManager({ serviceTypes }: { serviceTypes: ServiceType[] }) {
  const [state, action, isAdding] = useActionState(addServiceType, initialState)
  const [reenablePending, startReenableTransition] = useTransition()
  const [mode, setMode] = useState<'idle' | 'new'>('idle')

  const activeTypes = serviceTypes.filter((st) => st.is_active)
  const inactiveTypes = serviceTypes.filter((st) => !st.is_active)

  function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.currentTarget.value
    if (!value) return

    if (value === ADD_NEW) {
      setMode('new')
      e.currentTarget.value = ''
      return
    }

    e.currentTarget.value = ''
    startReenableTransition(() => toggleServiceTypeActive(value, true))
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Add / re-enable control */}
      <div className="flex flex-col gap-2 max-w-sm">
        <Label className="text-sm font-semibold">Add new service</Label>

        {mode === 'new' ? (
          <>
            {state.error && (
              <div className="rounded-lg border border-destructive/50 px-3 py-2 text-sm text-destructive">
                {state.error}
              </div>
            )}
            {state.success && (
              <div className="rounded-lg border border-green-500/50 bg-green-50 px-3 py-2 text-sm text-green-800">
                Service type added.
              </div>
            )}
            <form action={action} className="flex gap-2">
              <Input id="st_name" name="name" placeholder="e.g. Financial Coaching" required autoFocus />
              <Button type="submit" disabled={isAdding}>
                {isAdding ? 'Adding…' : 'Add'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setMode('idle')}>
                Cancel
              </Button>
            </form>
          </>
        ) : (
          <Select
            defaultValue=""
            disabled={reenablePending}
            onChange={handleSelectChange}
          >
            <option value="" disabled>Select service type to add...</option>
            {inactiveTypes.map((st) => (
              <option key={st.id} value={st.id}>{st.name}</option>
            ))}
            <option value={ADD_NEW}>+ Create new…</option>
          </Select>
        )}
      </div>

      {/* Active chips */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2 min-h-10 rounded-lg p-3">
          {activeTypes.length === 0 ? (
            <span className="text-sm text-muted-foreground self-center">No active service types.</span>
          ) : (
            activeTypes.map((st) => <ServiceTypeChip key={st.id} st={st} />)
          )}
        </div>
      </div>
    </div>
  )
}
