'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createAppointment, type NewAppointmentFormState } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const SERVICE_TYPES = [
  'Case Management', 'Food Assistance', 'Housing Support', 'Medical Referral',
  'Mental Health Services', 'Employment Support', 'Child & Family Services',
  'Legal Aid Referral', 'Transportation Assistance', 'Education Support',
]

// Stub clients — replace with Supabase query after #1 Auth lands
const STUB_CLIENTS = [
  { id: '1',  name: 'Maria Garcia',     number: 'CLT-00001' },
  { id: '2',  name: 'James Thompson',   number: 'CLT-00002' },
  { id: '3',  name: 'Aisha Patel',      number: 'CLT-00003' },
  { id: '4',  name: 'Carlos Rivera',    number: 'CLT-00004' },
  { id: '5',  name: 'Linda Nguyen',     number: 'CLT-00005' },
  { id: '6',  name: 'David Okonkwo',    number: 'CLT-00006' },
  { id: '7',  name: 'Rosa Mendez',      number: 'CLT-00007' },
  { id: '8',  name: 'Kevin Johnson',    number: 'CLT-00008' },
  { id: '9',  name: 'Fatima Al-Hassan', number: 'CLT-00009' },
  { id: '10', name: 'Marcus Williams',  number: 'CLT-00010' },
  { id: '11', name: 'Priya Sharma',     number: 'CLT-00011' },
  { id: '12', name: 'Darius Mitchell',  number: 'CLT-00012' },
]

const initialState: NewAppointmentFormState = {}

export default function AppointmentForm({ defaultClientId }: { defaultClientId?: string }) {
  const [state, action, isPending] = useActionState(createAppointment, initialState)

  if (state.success) {
    return (
      <Card className="max-w-2xl">
        <CardContent className="py-8 text-center flex flex-col items-center gap-4">
          <p className="text-sm font-medium text-green-700">
            Appointment scheduled! (stub — not saved until #1 Auth lands)
          </p>
          <div className="flex gap-3">
            <Link
              href="/schedule"
              className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
            >
              View calendar
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex h-8 items-center justify-center rounded-lg border border-input bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              Schedule another
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <form action={action}>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Schedule Appointment</CardTitle>
          <CardDescription>Book a future appointment for a client.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {state.error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="client_id">Client *</Label>
            <select
              id="client_id"
              name="client_id"
              defaultValue={defaultClientId ?? ''}
              aria-invalid={!!state.fieldErrors?.client_id}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              required
            >
              <option value="">Select a client…</option>
              {STUB_CLIENTS.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.number})</option>
              ))}
            </select>
            {state.fieldErrors?.client_id && (
              <p className="text-xs text-destructive">{state.fieldErrors.client_id}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="scheduled_date">Date *</Label>
              <Input
                id="scheduled_date"
                name="scheduled_date"
                type="date"
                aria-invalid={!!state.fieldErrors?.scheduled_date}
                required
              />
              {state.fieldErrors?.scheduled_date && (
                <p className="text-xs text-destructive">{state.fieldErrors.scheduled_date}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="scheduled_time">Time *</Label>
              <Input
                id="scheduled_time"
                name="scheduled_time"
                type="time"
                aria-invalid={!!state.fieldErrors?.scheduled_time}
                required
              />
              {state.fieldErrors?.scheduled_time && (
                <p className="text-xs text-destructive">{state.fieldErrors.scheduled_time}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="service_type_id">Service type</Label>
              <select
                id="service_type_id"
                name="service_type_id"
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Select a service type…</option>
                {SERVICE_TYPES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="duration_minutes">Duration (minutes)</Label>
              <Input
                id="duration_minutes"
                name="duration_minutes"
                type="number"
                min="15"
                max="480"
                step="15"
                placeholder="30"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Any preparation notes or reminders…"
              className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-y"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Scheduling…' : 'Schedule appointment'}
            </Button>
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              Cancel
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Note: stubbed — data will not be saved until issue #1 (Auth) is complete.
          </p>
        </CardContent>
      </Card>
    </form>
  )
}
