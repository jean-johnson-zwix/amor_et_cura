'use client'

import { useActionState } from 'react'
import { updateClient, type EditClientFormState } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Client, FieldDefinition } from '@/types/database'

const initialState: EditClientFormState = {}

function CustomFieldInput({ field, existing }: { field: FieldDefinition; existing: unknown }) {
  const inputName = `cf_${field.name}`
  const labelText = field.label + (field.required ? ' *' : '')

  if (field.field_type === 'boolean') {
    return (
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={inputName}
          name={inputName}
          defaultChecked={!!existing}
          className="size-4 rounded border"
        />
        <Label htmlFor={inputName}>{labelText}</Label>
      </div>
    )
  }

  if (field.field_type === 'select') {
    return (
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={inputName}>{labelText}</Label>
        <select
          id={inputName}
          name={inputName}
          defaultValue={typeof existing === 'string' ? existing : ''}
          required={field.required}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">Select…</option>
          {(field.options ?? []).map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    )
  }

  if (field.field_type === 'multiselect') {
    const selected = Array.isArray(existing) ? (existing as string[]) : []
    return (
      <div className="flex flex-col gap-1.5">
        <Label>{labelText}</Label>
        <div className="flex flex-wrap gap-3">
          {(field.options ?? []).map((opt) => (
            <label key={opt} className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                name={inputName}
                value={opt}
                defaultChecked={selected.includes(opt)}
                className="size-4 rounded border"
              />
              {opt}
            </label>
          ))}
        </div>
      </div>
    )
  }

  const inputType = field.field_type === 'number' ? 'number'
    : field.field_type === 'date' ? 'date'
    : 'text'

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={inputName}>{labelText}</Label>
      <Input
        id={inputName}
        name={inputName}
        type={inputType}
        defaultValue={existing != null ? String(existing) : ''}
        required={field.required}
      />
    </div>
  )
}

export default function EditClientForm({
  client,
  serviceTypes,
  customFields,
}: {
  client: Client
  serviceTypes: { id: string; name: string }[]
  customFields: FieldDefinition[]
}) {
  const [state, action, isPending] = useActionState(updateClient, initialState)
  const cf = (client.custom_fields ?? {}) as Record<string, unknown>

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
            <Label>Programs</Label>
            <div className="flex flex-wrap gap-3">
              {serviceTypes.map((s) => (
                <label key={s.id} className="flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    name="programs"
                    value={s.name}
                    defaultChecked={(client.programs ?? []).includes(s.name)}
                    className="size-4 rounded border"
                  />
                  {s.name}
                </label>
              ))}
            </div>
          </div>

          {customFields.length > 0 && (
            <div className="border-t pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Additional Information
              </p>
              <div className="flex flex-col gap-4">
                {customFields.map((field) => (
                  <CustomFieldInput key={field.id} field={field} existing={cf[field.name]} />
                ))}
              </div>
            </div>
          )}

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
