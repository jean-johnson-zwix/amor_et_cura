'use client'

import { useState, useTransition, useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import {
  addFieldDefinition,
  toggleFieldActive,
  deleteFieldDefinition,
  updateFieldDefinition,
  type FieldFormState,
} from './actions'
import type { FieldDefinition, FieldAppliesTo, FieldType } from '@/types/database'
import { ChevronLeft, ChevronRight, Pencil, Trash2, ClipboardList, UserPlus, Check, X } from 'lucide-react'

// ── Constants ─────────────────────────────────────────────────

const FIELD_TYPE_LABELS: Record<string, string> = {
  text: 'Text',
  number: 'Number',
  date: 'Date',
  boolean: 'Yes / No',
  select: 'Dropdown',
  multiselect: 'Multi-select',
}

const FORMS: { id: FieldAppliesTo; label: string; description: string; icon: React.ReactNode }[] = [
  {
    id: 'client',
    label: 'Client Intake',
    description: 'Extra fields shown on the new client registration form.',
    icon: <UserPlus className="size-5 text-teal" />,
  },
  {
    id: 'visit',
    label: 'Log Visit',
    description: 'Extra fields shown on the visit log form.',
    icon: <ClipboardList className="size-5 text-teal" />,
  },
]

// ── Inline edit form ──────────────────────────────────────────

function EditFieldRow({
  field,
  onDone,
}: {
  field: FieldDefinition
  onDone: () => void
}) {
  const [label, setLabel] = useState(field.label)
  const [fieldType, setFieldType] = useState<FieldType>(field.field_type)
  const [options, setOptions] = useState(field.options?.join(', ') ?? '')
  const [required, setRequired] = useState(field.required)
  const [saving, startSave] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const showOptions = fieldType === 'select' || fieldType === 'multiselect'

  function handleSave() {
    setError(null)
    const parsedOptions = showOptions
      ? options.split(',').map((s) => s.trim()).filter(Boolean)
      : null

    startSave(async () => {
      const result = await updateFieldDefinition(field.id, {
        label,
        field_type: fieldType,
        options: parsedOptions,
        required,
      })
      if (result?.error) {
        setError(result.error)
      } else {
        onDone()
      }
    })
  }

  return (
    <tr className="border-t bg-[#f8fafc]">
      <td colSpan={6} className="px-4 py-4">
        <div className="flex flex-col gap-3">
          {error && (
            <p className="text-[12px] text-red-600">{error}</p>
          )}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-[#6b7280]">Label *</label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="h-8 rounded-lg border border-[#e2e8f0] px-2.5 text-[13px] text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-[#6b7280]">Field type *</label>
              <Select
                size="sm"
                value={fieldType}
                onChange={(e) => setFieldType(e.target.value as FieldType)}
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="boolean">Yes / No</option>
                <option value="select">Dropdown (single)</option>
                <option value="multiselect">Multi-select</option>
              </Select>
            </div>

            {showOptions && (
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-[11px] font-medium text-[#6b7280]">Options (comma-separated)</label>
                <input
                  value={options}
                  onChange={(e) => setOptions(e.target.value)}
                  placeholder="Option A, Option B, Option C"
                  className="h-8 rounded-lg border border-[#e2e8f0] px-2.5 text-[13px] text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
                />
              </div>
            )}

            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id={`req-edit-${field.id}`}
                checked={required}
                onChange={(e) => setRequired(e.target.checked)}
                className="size-4 rounded border-[#e2e8f0] accent-teal"
              />
              <label htmlFor={`req-edit-${field.id}`} className="text-[13px] text-navy">Required</label>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-teal px-3 text-[12px] font-medium text-white hover:bg-[#D45228] disabled:opacity-60"
            >
              <Check className="size-3" />
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={onDone}
              disabled={saving}
              className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-3 text-[12px] font-medium text-navy hover:bg-teal-tint"
            >
              <X className="size-3" />
              Cancel
            </button>
          </div>
        </div>
      </td>
    </tr>
  )
}

// ── Field row ─────────────────────────────────────────────────

function FieldRow({
  field,
  onEdit,
}: {
  field: FieldDefinition
  onEdit: () => void
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <tr className={`border-t text-sm ${!field.is_active ? 'opacity-40' : ''}`}>
      <td className="px-4 py-3 font-medium text-navy text-[13px]">{field.label}</td>
      <td className="px-4 py-3 font-mono text-[11px] text-[#6b7280]">{field.name}</td>
      <td className="px-4 py-3 text-[12px] text-[#6b7280]">{FIELD_TYPE_LABELS[field.field_type] ?? field.field_type}</td>
      <td className="px-4 py-3">
        {field.required ? (
          <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
            Required
          </span>
        ) : (
          <span className="text-[11px] text-[#9ca3af]">Optional</span>
        )}
      </td>
      <td className="px-4 py-3 text-[12px] text-[#6b7280]">
        {field.options?.join(', ') || '—'}
      </td>
      <td className="px-4 py-3">
        {field.is_active ? (
          <span className="inline-flex h-5 items-center rounded-full bg-teal-light px-2 text-[10px] font-medium text-[#16A34A]">Active</span>
        ) : (
          <span className="inline-flex h-5 items-center rounded-full bg-[#f3f4f6] px-2 text-[10px] font-medium text-[#6b7280]">Disabled</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onEdit}
            disabled={isPending}
            className="inline-flex items-center gap-1 text-[12px] text-[#6b7280] hover:text-navy disabled:opacity-50"
            title="Edit field"
          >
            <Pencil className="size-3" />
            Edit
          </button>
          <button
            onClick={() => startTransition(() => toggleFieldActive(field.id, !field.is_active))}
            disabled={isPending}
            className="text-[12px] text-[#6b7280] underline hover:text-navy disabled:opacity-50"
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
            className="inline-flex items-center gap-1 text-[12px] text-red-500 hover:text-red-700 disabled:opacity-50"
            title="Delete field"
          >
            <Trash2 className="size-3" />
            Delete
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Add field form ────────────────────────────────────────────

const addInitialState: FieldFormState = {}

function AddFieldForm({
  appliesTo,
  onSuccess,
}: {
  appliesTo: FieldAppliesTo
  onSuccess: () => void
}) {
  const [state, action, isPending] = useActionState(addFieldDefinition, addInitialState)
  const [fieldType, setFieldType] = useState('')
  const showOptions = fieldType === 'select' || fieldType === 'multiselect'

  // Auto-close on success
  if (state.success) {
    onSuccess()
    return null
  }

  return (
    <div className="rounded-lg border border-teal/30 bg-[#f0fdf9] p-4 flex flex-col gap-4">
      <p className="text-[12px] font-semibold text-navy">New field</p>

      {state.error && (
        <p className="text-[12px] text-red-600">{state.error}</p>
      )}

      <form action={action} className="flex flex-col gap-3">
        {/* Hidden: lock applies_to to current form */}
        <input type="hidden" name="applies_to" value={appliesTo} />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="add-label" className="text-[11px] font-medium text-[#6b7280]">Display label *</label>
            <Input id="add-label" name="label" placeholder="e.g. Insurance ID" required className="h-8 text-[13px]" />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="add-type" className="text-[11px] font-medium text-[#6b7280]">Field type *</label>
            <Select
              size="sm"
              id="add-type"
              name="field_type"
              required
              value={fieldType}
              onChange={(e) => setFieldType(e.target.value)}
            >
              <option value="">Select…</option>
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
              <option value="boolean">Yes / No</option>
              <option value="select">Dropdown (single)</option>
              <option value="multiselect">Multi-select</option>
            </Select>
          </div>

          {showOptions && (
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label htmlFor="add-options" className="text-[11px] font-medium text-[#6b7280]">
                Options (comma-separated)
              </label>
              <Input id="add-options" name="options" placeholder="Option A, Option B, Option C" className="h-8 text-[13px]" />
            </div>
          )}

          <div className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              id="add-required"
              name="required"
              className="size-4 rounded border-[#e2e8f0] accent-teal"
            />
            <label htmlFor="add-required" className="text-[13px] text-navy">Required</label>
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={isPending} className="h-7 text-[12px]">
            {isPending ? 'Adding…' : 'Add field'}
          </Button>
        </div>
      </form>
    </div>
  )
}

// ── Form detail view ──────────────────────────────────────────

function FormFieldEditor({
  appliesTo,
  formLabel,
  fields,
  onBack,
}: {
  appliesTo: FieldAppliesTo
  formLabel: string
  fields: FieldDefinition[]
  onBack: () => void
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 text-[12px] font-medium text-[#6b7280] hover:text-navy"
        >
          <ChevronLeft className="size-4" />
          All forms
        </button>
        <span className="text-[#d1d5db]">/</span>
        <span className="text-[13px] font-semibold text-navy">{formLabel}</span>
      </div>

      {/* Field table */}
      <div className="rounded-lg border border-[#e2e8f0] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#f8fafc] text-[#6b7280]">
            <tr>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide">Label</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide">Slug</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide">Type</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide">Required</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide">Options</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide">Status</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {fields.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[13px] text-[#6b7280]">
                  No custom fields on this form yet.
                </td>
              </tr>
            ) : (
              fields.map((f) =>
                editingId === f.id ? (
                  <EditFieldRow
                    key={f.id}
                    field={f}
                    onDone={() => setEditingId(null)}
                  />
                ) : (
                  <FieldRow
                    key={f.id}
                    field={f}
                    onEdit={() => {
                      setEditingId(f.id)
                      setShowAdd(false)
                    }}
                  />
                )
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Add field */}
      {showAdd ? (
        <AddFieldForm
          appliesTo={appliesTo}
          onSuccess={() => setShowAdd(false)}
        />
      ) : (
        <button
          onClick={() => {
            setShowAdd(true)
            setEditingId(null)
          }}
          className="self-start inline-flex h-8 items-center gap-1.5 rounded-lg border border-dashed border-teal px-3 text-[12px] font-medium text-teal hover:bg-teal-light"
        >
          + Add field
        </button>
      )}
    </div>
  )
}

// ── Form picker view ──────────────────────────────────────────

function FormPicker({
  fields,
  onSelect,
}: {
  fields: FieldDefinition[]
  onSelect: (id: FieldAppliesTo) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {FORMS.map((form) => {
        const count = fields.filter((f) => f.applies_to === form.id).length
        const activeCount = fields.filter((f) => f.applies_to === form.id && f.is_active).length

        return (
          <button
            key={form.id}
            onClick={() => onSelect(form.id)}
            className="group flex flex-col gap-3 rounded-2xl bg-white shadow-sm p-5 text-left transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-light">
                {form.icon}
              </div>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-teal opacity-0 transition-opacity group-hover:opacity-100">
                Manage fields <ChevronRight className="size-3" />
              </span>
            </div>
            <div>
              <p className="text-[14px] font-semibold text-navy">{form.label}</p>
              <p className="mt-0.5 text-[12px] text-[#6b7280]">{form.description}</p>
            </div>
            <div className="flex items-center gap-3 border-t border-[#f1f5f9] pt-3">
              <span className="text-[12px] text-navy">
                <strong>{count}</strong> {count === 1 ? 'field' : 'fields'}
              </span>
              {count > 0 && (
                <span className="text-[11px] text-[#6b7280]">
                  {activeCount} active
                </span>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ── Root export ───────────────────────────────────────────────

export default function FieldManager({ fields }: { fields: FieldDefinition[] }) {
  const [selectedForm, setSelectedForm] = useState<FieldAppliesTo | null>(null)

  const activeFormMeta = FORMS.find((f) => f.id === selectedForm)
  const formFields = selectedForm ? fields.filter((f) => f.applies_to === selectedForm) : []

  if (selectedForm && activeFormMeta) {
    return (
      <FormFieldEditor
        appliesTo={selectedForm}
        formLabel={activeFormMeta.label}
        fields={formFields}
        onBack={() => setSelectedForm(null)}
      />
    )
  }

  return <FormPicker fields={fields} onSelect={setSelectedForm} />
}
