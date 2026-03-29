'use client'

import { useActionState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addFieldDefinition, toggleFieldActive, deleteFieldDefinition, type FieldFormState } from './actions'
import type { FieldDefinition } from '@/types/database'

const FIELD_TYPE_LABELS: Record<string, string> = {
  text: 'Text',
  number: 'Number',
  date: 'Date',
  boolean: 'Yes / No',
  select: 'Dropdown',
  multiselect: 'Multi-select',
}

function FieldRow({ field }: { field: FieldDefinition }) {
  const [isPending, startTransition] = useTransition()

  return (
    <tr className={`border-t text-sm ${!field.is_active ? 'opacity-50' : ''}`}>
      <td className="px-4 py-3 font-medium">{field.label}</td>
      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{field.name}</td>
      <td className="px-4 py-3 text-muted-foreground">{FIELD_TYPE_LABELS[field.field_type] ?? field.field_type}</td>
      <td className="px-4 py-3 text-muted-foreground capitalize">{field.applies_to}</td>
      <td className="px-4 py-3">
        {field.required ? (
          <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Required</span>
        ) : (
          <span className="text-muted-foreground text-xs">Optional</span>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {field.options?.join(', ') || '—'}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => startTransition(() => toggleFieldActive(field.id, !field.is_active))}
            disabled={isPending}
            className="text-xs text-muted-foreground underline hover:text-foreground disabled:opacity-50"
          >
            {field.is_active ? 'Disable' : 'Enable'}
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete field "${field.label}"? This cannot be undone.`)) {
                startTransition(() => deleteFieldDefinition(field.id))
              }
            }}
            disabled={isPending}
            className="text-xs text-destructive underline hover:text-destructive/80 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  )
}

const initialState: FieldFormState = {}

export default function FieldManager({ fields }: { fields: FieldDefinition[] }) {
  const [state, action, isPending] = useActionState(addFieldDefinition, initialState)
  const fieldType = typeof window !== 'undefined'
    ? (document.querySelector<HTMLSelectElement>('[name="field_type"]')?.value ?? '')
    : ''

  const showOptions = ['select', 'multiselect'].includes(fieldType)

  return (
    <div className="flex flex-col gap-6">
      {/* Existing fields table */}
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium">Label</th>
              <th className="px-4 py-2.5 text-left font-medium">Slug</th>
              <th className="px-4 py-2.5 text-left font-medium">Type</th>
              <th className="px-4 py-2.5 text-left font-medium">Applies to</th>
              <th className="px-4 py-2.5 text-left font-medium">Required</th>
              <th className="px-4 py-2.5 text-left font-medium">Options</th>
              <th className="px-4 py-2.5 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {fields.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No custom fields defined yet.
                </td>
              </tr>
            ) : (
              fields.map((f) => <FieldRow key={f.id} field={f} />)
            )}
          </tbody>
        </table>
      </div>

      {/* Add field form */}
      <div className="rounded-lg border p-4 flex flex-col gap-4 max-w-xl">
        <h3 className="text-sm font-semibold">Add new field</h3>

        {state.error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </div>
        )}
        {state.success && (
          <div className="rounded-lg border border-green-500/50 bg-green-50 px-3 py-2 text-sm text-green-800">
            Field added successfully.
          </div>
        )}

        <form action={action} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="label">Display label *</Label>
              <Input id="label" name="label" placeholder="Emergency Contact" required />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="field_type">Field type *</Label>
              <select
                id="field_type"
                name="field_type"
                required
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Select…</option>
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="boolean">Yes / No</option>
                <option value="select">Dropdown (single)</option>
                <option value="multiselect">Multi-select</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="options">
              Options <span className="text-muted-foreground">(comma-separated, for dropdown / multi-select)</span>
            </Label>
            <Input id="options" name="options" placeholder="Option A, Option B, Option C" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="applies_to">Applies to</Label>
              <select
                id="applies_to"
                name="applies_to"
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="client">Client intake form</option>
                <option value="visit">Visit log form</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" id="required" name="required" className="size-4 rounded border" />
              <Label htmlFor="required">Required field</Label>
            </div>
          </div>

          <Button type="submit" disabled={isPending} className="self-start">
            {isPending ? 'Adding…' : 'Add field'}
          </Button>
        </form>
      </div>
    </div>
  )
}
