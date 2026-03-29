'use client'

import { useActionState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addServiceType, toggleServiceTypeActive, type ServiceTypeFormState } from './actions'
import type { ServiceType } from '@/types/database'

function ServiceTypeRow({ st }: { st: ServiceType }) {
  const [isPending, startTransition] = useTransition()

  return (
    <tr className={`border-t text-sm ${!st.is_active ? 'opacity-50' : ''}`}>
      <td className="px-4 py-3 font-medium">{st.name}</td>
      <td className="px-4 py-3">
        {st.is_active ? (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Active</span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">Inactive</span>
        )}
      </td>
      <td className="px-4 py-3">
        <button
          onClick={() => startTransition(() => toggleServiceTypeActive(st.id, !st.is_active))}
          disabled={isPending}
          className="text-xs text-muted-foreground underline hover:text-foreground disabled:opacity-50"
        >
          {st.is_active ? 'Disable' : 'Enable'}
        </button>
      </td>
    </tr>
  )
}

const initialState: ServiceTypeFormState = {}

export default function ServiceTypeManager({ serviceTypes }: { serviceTypes: ServiceType[] }) {
  const [state, action, isPending] = useActionState(addServiceType, initialState)

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium">Name</th>
              <th className="px-4 py-2.5 text-left font-medium">Status</th>
              <th className="px-4 py-2.5 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {serviceTypes.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  No service types defined.
                </td>
              </tr>
            ) : (
              serviceTypes.map((st) => <ServiceTypeRow key={st.id} st={st} />)
            )}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border p-4 flex flex-col gap-4 max-w-sm">
        <h3 className="text-sm font-semibold">Add service type</h3>

        {state.error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </div>
        )}
        {state.success && (
          <div className="rounded-lg border border-green-500/50 bg-green-50 px-3 py-2 text-sm text-green-800">
            Service type added.
          </div>
        )}

        <form action={action} className="flex gap-2">
          <div className="flex-1 flex flex-col gap-1.5">
            <Label htmlFor="st_name" className="sr-only">Service type name</Label>
            <Input id="st_name" name="name" placeholder="e.g. Financial Coaching" required />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Adding…' : 'Add'}
          </Button>
        </form>
      </div>
    </div>
  )
}
