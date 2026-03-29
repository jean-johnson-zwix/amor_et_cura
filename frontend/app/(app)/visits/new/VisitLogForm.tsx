'use client'

import { useActionState } from 'react'
import { createVisit, type NewVisitFormState } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const initialState: NewVisitFormState = {}

export default function VisitLogForm({
  clientId,
  clientName,
  serviceTypes,
}: {
  clientId: string
  clientName: string
  serviceTypes: { id: string; name: string }[]
}) {
  const [state, action, isPending] = useActionState(createVisit, initialState)

  if (state.success) {
    return (
      <Card className="max-w-2xl">
        <CardContent className="py-8 text-center flex flex-col items-center gap-4">
          <p className="text-sm font-medium text-green-700">
            Visit logged successfully!
          </p>
          <div className="flex gap-3">
            <a
              href={`/clients/${clientId}`}
              className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
            >
              Back to {clientName}
            </a>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex h-8 items-center justify-center rounded-lg border border-input bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              Log another
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <form action={action}>
      <input type="hidden" name="client_id" value={clientId} />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Log Visit</CardTitle>
          <CardDescription>
            Recording a service entry for <span className="font-medium text-foreground">{clientName}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {state.error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="visit_date">Visit date *</Label>
              <Input
                id="visit_date"
                name="visit_date"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                aria-invalid={!!state.fieldErrors?.visit_date}
                required
              />
              {state.fieldErrors?.visit_date && (
                <p className="text-xs text-destructive">{state.fieldErrors.visit_date}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="duration_minutes">Duration (minutes)</Label>
              <Input
                id="duration_minutes"
                name="duration_minutes"
                type="number"
                min="1"
                max="480"
                placeholder="30"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="service_type_id">Service type</Label>
            <select
              id="service_type_id"
              name="service_type_id"
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">Select a service type…</option>
              {serviceTypes.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              placeholder="Describe the services provided, client status, follow-up actions…"
              className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-y"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : 'Log visit'}
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
