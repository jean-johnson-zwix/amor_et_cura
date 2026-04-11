'use client'

import { useState, useTransition, useActionState, useRef } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Mic, FileText, Globe, Brain, BarChart3,
  ScanLine, ClipboardList, ListChecks,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  saveIdentity,
  saveBranding,
  savePrograms,
  applyFieldTemplate,
  saveAiFlags,
  completeSetup,
  type SetupFormState,
} from './actions'
import type { ServiceType, AiTask } from '@/types/database'

// ── Types ──────────────────────────────────────────────────────

interface OrgSettings {
  org_name?: string | null
  org_mission?: string | null
  contact_email?: string | null
  org_logo_url?: string | null
  primary_color?: string | null
  secondary_color?: string | null
}

interface Props {
  initialSettings: OrgSettings | null
  serviceTypes: ServiceType[]
  aiTasks: AiTask[]
}

// ── Step indicator ─────────────────────────────────────────────

const STEPS = [
  { number: 1, label: 'Identity' },
  { number: 2, label: 'Branding' },
  { number: 3, label: 'Services' },
  { number: 4, label: 'Fields' },
  { number: 5, label: 'AI Features' },
]

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((step, i) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors',
                current === step.number
                  ? 'bg-[--org-primary,#F2673C] border-[--org-primary,#F2673C] text-white'
                  : current > step.number
                  ? 'bg-[--org-primary,#F2673C]/20 border-[--org-primary,#F2673C] text-[--org-primary,#F2673C]'
                  : 'bg-white border-gray-200 text-gray-400'
              )}
            >
              {current > step.number ? '✓' : step.number}
            </div>
            <span className={cn('text-[10px] font-medium', current >= step.number ? 'text-gray-700' : 'text-gray-400')}>
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={cn('w-10 h-0.5 mb-4 mx-1 transition-colors', current > step.number ? 'bg-[--org-primary,#F2673C]' : 'bg-gray-200')} />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Error message ─────────────────────────────────────────────

function ErrorMsg({ message }: { message: string }) {
  return (
    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{message}</p>
  )
}

// ── Step 1: Identity ─────────────────────────────────────────

function Step1({ initial, onNext }: { initial: OrgSettings | null; onNext: () => void }) {
  const [state, action, pending] = useActionState<SetupFormState, FormData>(
    async (prev, formData) => {
      const result = await saveIdentity(prev, formData)
      if (!result.error) onNext()
      return result
    },
    {}
  )

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="org_name">Organization Name <span className="text-red-500">*</span></Label>
        <Input
          id="org_name"
          name="org_name"
          placeholder="e.g. Mesa Community Care Center"
          defaultValue={initial?.org_name ?? ''}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="org_mission">Mission Statement</Label>
        <textarea
          id="org_mission"
          name="org_mission"
          placeholder="Briefly describe your organization's mission…"
          defaultValue={initial?.org_mission ?? ''}
          rows={3}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact_email">Contact Email</Label>
        <Input
          id="contact_email"
          name="contact_email"
          type="email"
          placeholder="info@yourorg.org"
          defaultValue={initial?.contact_email ?? ''}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="org_logo_url">Logo URL <span className="text-gray-400 font-normal">(optional)</span></Label>
        <Input
          id="org_logo_url"
          name="org_logo_url"
          type="url"
          placeholder="https://yourorg.org/logo.png"
          defaultValue={initial?.org_logo_url ?? ''}
        />
        <p className="text-xs text-gray-400">Paste a direct link to your logo image. Leave blank to use the default.</p>
      </div>

      {state.error && <ErrorMsg message={state.error} />}

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : 'Next →'}
        </Button>
      </div>
    </form>
  )
}

// ── Step 2: Branding ─────────────────────────────────────────

function Step2({
  initial,
  onNext,
  onBack,
}: {
  initial: OrgSettings | null
  onNext: () => void
  onBack: () => void
}) {
  const [primary, setPrimary]     = useState(initial?.primary_color ?? '#F2673C')
  const [secondary, setSecondary] = useState(initial?.secondary_color ?? '#8B5CF6')
  const [error, setError]         = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    setError(null)
    const formData = new FormData()
    formData.set('primary_color', primary)
    formData.set('secondary_color', secondary)

    startTransition(async () => {
      const result = await saveBranding({}, formData)
      if (result.error) {
        setError(result.error)
      } else {
        onNext()
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label>Primary Color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={primary}
              onChange={e => setPrimary(e.target.value)}
              className="w-10 h-10 rounded-lg border border-input cursor-pointer p-0.5"
            />
            <Input
              value={primary}
              onChange={e => setPrimary(e.target.value)}
              placeholder="#F2673C"
              className="font-mono text-sm"
              maxLength={7}
            />
          </div>
          <p className="text-xs text-gray-400">Used for buttons, links, and highlights</p>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Secondary Color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={secondary}
              onChange={e => setSecondary(e.target.value)}
              className="w-10 h-10 rounded-lg border border-input cursor-pointer p-0.5"
            />
            <Input
              value={secondary}
              onChange={e => setSecondary(e.target.value)}
              placeholder="#8B5CF6"
              className="font-mono text-sm"
              maxLength={7}
            />
          </div>
          <p className="text-xs text-gray-400">Used for accents and badges</p>
        </div>
      </div>

      {/* Live preview */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div
          className="flex items-center gap-3 px-4 py-3 text-white text-sm font-semibold"
          style={{ background: '#1C1C1C' }}
        >
          <div className="w-2 h-2 rounded-full" style={{ background: primary }} />
          Your Organization
        </div>
        <div className="p-4 bg-white flex flex-col gap-3">
          <p className="text-sm text-gray-600">Preview of your branded UI:</p>
          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ background: primary }}
            >
              Save Client
            </button>
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ background: secondary }}
            >
              AI Summary
            </button>
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
              style={{ background: primary }}
            >
              Active
            </span>
          </div>
        </div>
      </div>

      {error && <ErrorMsg message={error} />}

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>← Back</Button>
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? 'Saving…' : 'Next →'}
        </Button>
      </div>
    </div>
  )
}

// ── Step 3: Programs ─────────────────────────────────────────

function Step3({
  onNext,
  onBack,
}: {
  serviceTypes: ServiceType[]   // kept in props for interface compatibility
  onNext: () => void
  onBack: () => void
}) {
  const [programs, setPrograms]   = useState<string[]>([])
  const [inputVal, setInputVal]   = useState('')
  const [error, setError]         = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  function addProgram() {
    const name = inputVal.trim()
    if (!name) return
    if (programs.includes(name)) {
      setInputVal('')
      return
    }
    setPrograms(prev => [...prev, name])
    setInputVal('')
    inputRef.current?.focus()
  }

  function removeProgram(name: string) {
    setPrograms(prev => prev.filter(p => p !== name))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addProgram()
    }
  }

  function handleSubmit() {
    setError(null)
    startTransition(async () => {
      const result = await savePrograms(programs)
      if (result.error) {
        setError(result.error)
      } else {
        onNext()
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-500">
        Enter the services your organization provides. Press Enter or click Add after each one.
        You can manage these later in Admin → Settings.
      </p>

      {/* Input row */}
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Food Assistance"
          className="flex-1"
        />
        <Button type="button" variant="outline" onClick={addProgram} disabled={!inputVal.trim()}>
          Add
        </Button>
      </div>

      {/* Program tags */}
      {programs.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {programs.map(name => (
            <span
              key={name}
              className="inline-flex items-center gap-1.5 rounded-full border border-[--org-primary,#F2673C] bg-[--org-primary,#F2673C]/5 pl-3 pr-2 py-1 text-sm font-medium text-gray-800"
            >
              {name}
              <button
                type="button"
                onClick={() => removeProgram(name)}
                className="flex items-center justify-center w-4 h-4 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors"
                aria-label={`Remove ${name}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400 italic">No services added yet. You can skip this step and add them later.</p>
      )}

      {error && <ErrorMsg message={error} />}

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>← Back</Button>
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? 'Saving…' : 'Next →'}
        </Button>
      </div>
    </div>
  )
}

// ── Step 4: Custom Fields ─────────────────────────────────────

type FieldTemplate = 'basic' | 'hmis' | 'custom'

const TEMPLATES: { id: FieldTemplate; label: string; description: string; fields?: string[] }[] = [
  {
    id: 'basic',
    label: 'Basic',
    description: 'No extra fields. Use the standard intake form (name, DOB, phone, programs).',
  },
  {
    id: 'hmis',
    label: 'HMIS-Compliant',
    description: 'Adds HUD-required fields for homeless services reporting.',
    fields: ['Veteran Status', 'Disability Status', 'Household Size', 'Monthly Income', 'Last Permanent Address', 'Days Homeless'],
  },
  {
    id: 'custom',
    label: 'I\'ll set this up later',
    description: 'Skip for now. You can define custom fields in Admin → Settings at any time.',
  },
]

function Step4({
  onNext,
  onBack,
}: {
  onNext: () => void
  onBack: () => void
}) {
  const [selected, setSelected]     = useState<FieldTemplate>('basic')
  const [error, setError]           = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    setError(null)
    startTransition(async () => {
      const result = await applyFieldTemplate(selected)
      if (result.error) {
        setError(result.error)
      } else {
        onNext()
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-500">Choose a starting point for your intake form fields.</p>

      <div className="flex flex-col gap-3">
        {TEMPLATES.map(tmpl => (
          <label
            key={tmpl.id}
            className={cn(
              'flex flex-col gap-1 rounded-xl border-2 px-4 py-3 cursor-pointer transition-colors select-none',
              selected === tmpl.id
                ? 'border-[--org-primary,#F2673C] bg-[--org-primary,#F2673C]/5'
                : 'border-gray-200 bg-white hover:border-gray-300'
            )}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="template"
                value={tmpl.id}
                checked={selected === tmpl.id}
                onChange={() => setSelected(tmpl.id)}
                className="accent-[--org-primary,#F2673C]"
              />
              <span className="text-sm font-semibold text-gray-800">{tmpl.label}</span>
            </div>
            <p className="ml-6 text-xs text-gray-500">{tmpl.description}</p>
            {tmpl.fields && selected === tmpl.id && (
              <div className="ml-6 mt-1 flex flex-wrap gap-1">
                {tmpl.fields.map(f => (
                  <span key={f} className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">{f}</span>
                ))}
              </div>
            )}
          </label>
        ))}
      </div>

      {error && <ErrorMsg message={error} />}

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>← Back</Button>
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? 'Applying…' : 'Next →'}
        </Button>
      </div>
    </div>
  )
}

// ── Step 5: AI Features ───────────────────────────────────────

const TASK_ICONS: Record<string, LucideIcon> = {
  photo_intake_extraction: ScanLine,
  audio_transcription:     Mic,
  note_structuring:        FileText,
  multilingual_intake:     Globe,
  client_summary:          ClipboardList,
  funder_report:           BarChart3,
  follow_up_extraction:    ListChecks,
}

function Step5({
  aiTasks,
  onBack,
}: {
  aiTasks: AiTask[]
  onBack: () => void
}) {
  const [enabled, setEnabled] = useState<Set<string>>(new Set(aiTasks.map(t => t.slug)))
  const [error, setError]     = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function toggle(slug: string) {
    setEnabled(prev => {
      const next = new Set(prev)
      next.has(slug) ? next.delete(slug) : next.add(slug)
      return next
    })
  }

  function handleComplete() {
    setError(null)
    startTransition(async () => {
      const flagResult = await saveAiFlags(Array.from(enabled))
      if (flagResult.error) {
        setError(flagResult.error)
        return
      }
      await completeSetup()
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-500">
        Enable or disable AI features for your team. All features are on by default.
        You can change these anytime in Admin → Settings → AI.
      </p>

      <div className="flex flex-col gap-2">
        {aiTasks.map(task => {
          const Icon = TASK_ICONS[task.slug] ?? Brain
          return (
            <label
              key={task.slug}
              className={cn(
                'flex items-start gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-colors select-none',
                enabled.has(task.slug)
                  ? 'border-[--org-primary,#F2673C] bg-[--org-primary,#F2673C]/5'
                  : 'border-gray-200 bg-white hover:border-gray-300 opacity-60'
              )}
            >
              <div className="flex items-center gap-3 pt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={enabled.has(task.slug)}
                  onChange={() => toggle(task.slug)}
                  className="accent-[--org-primary,#F2673C]"
                />
                <Icon className="size-4 text-gray-500 shrink-0" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{task.display_name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
              </div>
            </label>
          )
        })}
      </div>

      {error && <ErrorMsg message={error} />}

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>← Back</Button>
        <Button onClick={handleComplete} disabled={isPending}>
          {isPending ? 'Finishing setup…' : '🎉 Complete Setup'}
        </Button>
      </div>
    </div>
  )
}

// ── Main Wizard ───────────────────────────────────────────────

const STEP_TITLES: Record<number, { title: string; subtitle: string }> = {
  1: { title: 'Tell us about your organization',   subtitle: 'This information appears in reports and client documents.' },
  2: { title: 'Choose your brand colors',          subtitle: 'These colors will theme your entire app.' },
  3: { title: 'Which services do you offer?',      subtitle: 'Case workers will see these options when logging visits.' },
  4: { title: 'Customize your intake form',        subtitle: 'Add extra fields to capture data your funders need.' },
  5: { title: 'Configure AI features',             subtitle: 'Choose which AI tools your staff can access.' },
}

export default function SetupWizard({ initialSettings, serviceTypes, aiTasks }: Props) {
  const [step, setStep] = useState(1)

  const { title, subtitle } = STEP_TITLES[step]

  return (
    <div className="w-full max-w-xl">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
          <span className="w-8 h-px bg-gray-300" />
          Setup Wizard
          <span className="w-8 h-px bg-gray-300" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <StepIndicator current={step} />

        {step === 1 && (
          <Step1 initial={initialSettings} onNext={() => setStep(2)} />
        )}
        {step === 2 && (
          <Step2 initial={initialSettings} onNext={() => setStep(3)} onBack={() => setStep(1)} />
        )}
        {step === 3 && (
          <Step3 serviceTypes={serviceTypes} onNext={() => setStep(4)} onBack={() => setStep(2)} />
        )}
        {step === 4 && (
          <Step4 onNext={() => setStep(5)} onBack={() => setStep(3)} />
        )}
        {step === 5 && (
          <Step5 aiTasks={aiTasks} onBack={() => setStep(4)} />
        )}
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">
        You can update all of these settings later in Admin → Settings.
      </p>
    </div>
  )
}
