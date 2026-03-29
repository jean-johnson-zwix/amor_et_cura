'use client'

import { useActionState } from 'react'
import { updateClient, type EditClientFormState } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Client } from '@/types/database'

const initialState: EditClientFormState = {}

export default function EditClientForm({
  client,
  serviceTypes,
}: {
  client: Client
  serviceTypes: { id: string; name: string }[]
}) {
  const [state, action, isPending] = useActionState(updateClient, initialState)

  return (
    <form action={action}>
      <input type="hidden" name="client_id" value={client.id} />
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Demographics</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {state.error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="first_name">First name *</Label>
              <Input
                id="first_name"
                name="first_name"
                defaultValue={client.first_name}
                aria-invalid={!!state.fieldErrors?.first_name}
                required
              />
              {state.fieldErrors?.first_name && (
                <p className="text-xs text-destructive">{state.fieldErrors.first_name}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="last_name">Last name *</Label>
              <Input
                id="last_name"
                name="last_name"
                defaultValue={client.last_name}
                aria-invalid={!!state.fieldErrors?.last_name}
                required
              />
              {state.fieldErrors?.last_name && (
                <p className="text-xs text-destructive">{state.fieldErrors.last_name}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dob">Date of birth</Label>
            <Input id="dob" name="dob" type="date" defaultValue={client.dob ?? ''} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" defaultValue={client.phone ?? ''} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={client.email ?? ''} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" defaultValue={client.address ?? ''} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="program">Program</Label>
            <select
              id="program"
              name="program"
              defaultValue={client.program ?? ''}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">Select a program…</option>
              {serviceTypes.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : 'Save changes'}
            </Button>
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
