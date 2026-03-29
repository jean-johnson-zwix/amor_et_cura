'use client'

import { useActionState } from 'react'
import { createClient, type NewClientFormState } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const initialState: NewClientFormState = {}

export default function ClientRegistrationForm({
  serviceTypes,
}: {
  serviceTypes: { id: string; name: string }[]
}) {
  const [state, action, isPending] = useActionState(createClient, initialState)

  return (
    <form action={action}>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>New Client</CardTitle>
          <CardDescription>Complete the intake form to register a new client.</CardDescription>
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
                placeholder="Maria"
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
                placeholder="Garcia"
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
            <Input id="dob" name="dob" type="date" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" placeholder="(602) 555-0100" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="client@example.com" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" placeholder="123 Main St, Chandler, AZ" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="program">Program</Label>
            <select
              id="program"
              name="program"
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
              {isPending ? 'Saving…' : 'Register client'}
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
