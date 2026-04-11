'use client'

import { useState, useTransition } from 'react'
import {
  Mic, FileText, Globe, Brain, BarChart3, ScanLine, ClipboardList, ListChecks,
  ChevronDown, ChevronUp, Power, PowerOff, ArrowUp, ArrowDown, Play, Loader2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { toggleTaskActive, updateTaskPrompt, updateTaskConfig, updateConfigModel, reorderConfig } from './actions'
import type { AiTask, AiTaskConfig, AiModel } from '@/types/database'

// ── Local types ────────────────────────────────────────────────

interface ConfigWithModel extends AiTaskConfig {
  ai_models: AiModel
}

interface TaskWithConfigs extends AiTask {
  configs: ConfigWithModel[]
}

// ── Icons ──────────────────────────────────────────────────────

const TASK_ICONS: Record<string, LucideIcon> = {
  photo_intake_extraction: ScanLine,
  audio_transcription:     Mic,
  note_structuring:        FileText,
  multilingual_intake:     Globe,
  client_summary:          ClipboardList,
  funder_report:           BarChart3,
  follow_up_extraction:    ListChecks,
}

const TASK_TYPE_LABELS: Record<string, string> = {
  chat:   'Chat',
  vision: 'Vision',
  audio:  'Audio',
}

// ── Priority badge ─────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: number }) {
  if (priority === 1) {
    return <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-800">Primary</span>
  }
  return <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">Fallback {priority - 1}</span>
}

// ── Prompt editor (task-level) ────────────────────────────────

function PromptEditor({ task }: { task: TaskWithConfigs }) {
  const [prompt, setPrompt]           = useState(task.system_prompt ?? '')
  const [feedback, setFeedback]       = useState<{ error?: string; success?: boolean } | null>(null)
  const [isPending, startTransition]  = useTransition()

  const isDirty = prompt !== (task.system_prompt ?? '')

  function save() {
    setFeedback(null)
    startTransition(async () => {
      const result = await updateTaskPrompt(task.slug, prompt)
      setFeedback(result)
    })
  }

  if (task.task_type === 'audio') {
    return (
      <p className="text-xs text-gray-400 italic px-1">
        Audio transcription (Whisper) does not use a system prompt.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">System Prompt</Label>
      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        rows={8}
        className="w-full rounded-lg border border-input bg-white px-3 py-2 text-xs font-mono text-gray-800 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 resize-y"
        placeholder="Enter the system prompt for this task…"
      />
      {feedback?.error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">{feedback.error}</p>
      )}
      {feedback?.success && (
        <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">Prompt saved.</p>
      )}
      {isDirty && (
        <div className="flex justify-end">
          <Button size="sm" onClick={save} disabled={isPending}>
            {isPending ? 'Saving…' : 'Save prompt'}
          </Button>
        </div>
      )}
    </div>
  )
}

// ── Test prompt panel ─────────────────────────────────────────

function TestPromptPanel({ taskSlug, taskType }: { taskSlug: string; taskType: string }) {
  const [userPrompt, setUserPrompt] = useState('')
  const [result, setResult] = useState<{ response: string; model: string; provider: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (taskType === 'audio') {
    return (
      <p className="text-xs text-gray-400 italic px-1">
        Audio tasks (Whisper) cannot be tested with a text prompt.
      </p>
    )
  }

  function run() {
    if (!userPrompt.trim()) return
    setResult(null)
    setError(null)
    startTransition(async () => {
      try {
        const res = await fetch('/api/test-prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ task_slug: taskSlug, user_prompt: userPrompt }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error ?? 'AI service error')
        } else {
          setResult(data)
        }
      } catch {
        setError('Could not reach the AI service.')
      }
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Test Prompt</Label>
      <textarea
        value={userPrompt}
        onChange={e => setUserPrompt(e.target.value)}
        rows={4}
        placeholder={taskType === 'vision'
          ? 'Describe an image or paste extracted text to test the prompt logic…'
          : 'Enter a sample input to test how the model responds…'}
        className="w-full rounded-lg border border-input bg-white px-3 py-2 text-xs font-mono text-gray-800 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 resize-y"
      />
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={run} disabled={isPending || !userPrompt.trim()}>
          {isPending ? <Loader2 className="size-3.5 animate-spin mr-1" /> : <Play className="size-3.5 mr-1" />}
          {isPending ? 'Running…' : 'Run'}
        </Button>
      </div>
      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">{error}</p>
      )}
      {result && (
        <div className="flex flex-col gap-1">
          <p className="text-[11px] text-gray-400">
            Response from <span className="font-medium text-gray-600">{result.model}</span> ({result.provider})
          </p>
          <pre className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 whitespace-pre-wrap font-mono overflow-auto max-h-64">
            {result.response}
          </pre>
        </div>
      )}
    </div>
  )
}

// ── Single model-chain row (params only, no prompt) ────────────

function ConfigRow({
  config,
  taskType,
  availableModels,
  isFirst,
  isLast,
  taskSlug,
}: {
  config: ConfigWithModel
  taskType: string
  availableModels: AiModel[]
  isFirst: boolean
  isLast: boolean
  taskSlug: string
}) {
  const [isPending, startTransition]    = useTransition()
  const [selectedModelId, setSelectedModelId] = useState(config.model_id)
  const [temperature, setTemperature]   = useState(String(config.temperature))
  const [maxTokens, setMaxTokens]       = useState(String(config.max_tokens))
  const [responseFormat, setResponseFormat] = useState<'text' | 'json'>(config.response_format as 'text' | 'json')
  const [feedback, setFeedback]         = useState<{ error?: string; success?: boolean } | null>(null)

  const compatibleModels = availableModels.filter(m => {
    if (taskType === 'vision') return m.supports_vision
    if (taskType === 'audio')  return m.supports_audio
    return !m.supports_audio
  })

  const isDirty =
    selectedModelId !== config.model_id ||
    temperature !== String(config.temperature) ||
    maxTokens !== String(config.max_tokens) ||
    responseFormat !== config.response_format

  function save() {
    setFeedback(null)
    startTransition(async () => {
      if (selectedModelId !== config.model_id) {
        const r = await updateConfigModel(config.id, selectedModelId)
        if (r.error) { setFeedback(r); return }
      }
      const r = await updateTaskConfig(config.id, {
        temperature:     parseFloat(temperature),
        max_tokens:      parseInt(maxTokens, 10),
        response_format: responseFormat,
      })
      setFeedback(r)
    })
  }

  const [reorderPending, startReorderTransition] = useTransition()

  function move(direction: 'up' | 'down') {
    startReorderTransition(() => reorderConfig(config.id, taskSlug, direction))
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 flex flex-col gap-3">
      {/* Model selector + reorder row */}
      <div className="flex items-center gap-2">
        <PriorityBadge priority={config.priority} />
        <Select
          value={selectedModelId}
          onChange={e => setSelectedModelId(e.target.value)}
          className="flex-1"
        >
          {compatibleModels.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
          {!compatibleModels.find(m => m.id === selectedModelId) && (
            <option value={config.ai_models.id}>{config.ai_models.name} (incompatible)</option>
          )}
        </Select>
        <div className="flex flex-col gap-0.5 shrink-0">
          <button
            onClick={() => move('up')}
            disabled={isFirst || reorderPending}
            title="Move up"
            className="flex items-center justify-center rounded border border-gray-200 bg-white p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowUp className="size-3" />
          </button>
          <button
            onClick={() => move('down')}
            disabled={isLast || reorderPending}
            title="Move down"
            className="flex items-center justify-center rounded border border-gray-200 bg-white p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowDown className="size-3" />
          </button>
        </div>
      </div>

      {/* Params row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1">
          <Label className="text-[11px] text-gray-500">Temperature</Label>
          <Input
            type="number" min={0} max={2} step={0.05}
            value={temperature}
            onChange={e => setTemperature(e.target.value)}
            className="text-sm h-8"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-[11px] text-gray-500">Max Tokens</Label>
          <Input
            type="number" min={0} step={256}
            value={maxTokens}
            onChange={e => setMaxTokens(e.target.value)}
            className="text-sm h-8"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-[11px] text-gray-500">Format</Label>
          <Select
            size="sm"
            value={responseFormat}
            onChange={e => setResponseFormat(e.target.value as 'text' | 'json')}
          >
            <option value="text">Text</option>
            <option value="json">JSON</option>
          </Select>
        </div>
      </div>

      {feedback?.error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">{feedback.error}</p>
      )}
      {feedback?.success && (
        <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">Saved.</p>
      )}
      {isDirty && (
        <div className="flex justify-end">
          <Button size="sm" onClick={save} disabled={isPending}>
            {isPending ? 'Saving…' : 'Save'}
          </Button>
        </div>
      )}
    </div>
  )
}

// ── Task card ──────────────────────────────────────────────────

function TaskCard({ task, availableModels }: { task: TaskWithConfigs; availableModels: AiModel[] }) {
  const [expanded, setExpanded]      = useState(false)
  const [isPending, startTransition] = useTransition()

  const primaryConfig = task.configs.find(c => c.priority === 1)
  const isActive      = primaryConfig?.is_active ?? true
  const Icon          = TASK_ICONS[task.slug] ?? Brain

  function handleToggle() {
    startTransition(() => toggleTaskActive(task.slug, !isActive))
  }

  return (
    <div className={cn('rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden', !isActive && 'opacity-60')}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-light">
          <Icon className="size-4 text-teal" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[13px] font-semibold text-navy">{task.display_name}</p>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
              {TASK_TYPE_LABELS[task.task_type] ?? task.task_type}
            </span>
            {!isActive && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">Disabled</span>
            )}
          </div>
          <p className="mt-0.5 text-[12px] text-gray-500 truncate">{task.description}</p>
          {primaryConfig && (
            <p className="mt-0.5 text-[11px] text-gray-400">
              Model: {primaryConfig.ai_models?.name ?? '—'}
              {task.configs.length > 1 && ` with ${task.configs.length - 1} fallback${task.configs.length > 2 ? 's' : ''}`}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleToggle}
            disabled={isPending}
            title={isActive ? 'Disable this AI feature' : 'Enable this AI feature'}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50',
              isActive
                ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
            )}
          >
            {isActive ? <PowerOff className="size-3" /> : <Power className="size-3" />}
            {isActive ? 'Disable' : 'Enable'}
          </button>

          <button
            onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50 transition-colors"
          >
            {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
            {expanded ? 'Collapse' : 'Edit'}
          </button>
        </div>
      </div>

      {/* Expanded body — prompt, model chain, test prompt */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-5 flex flex-col gap-6">

          {/* Prompt section */}
          <PromptEditor task={task} />

          {/* Model chain section */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Model Chain <span className="font-normal text-gray-400 normal-case tracking-normal">— primary runs first, fallbacks if it fails</span>
            </p>
            {task.configs.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No models configured.</p>
            ) : (
              task.configs.map((cfg, idx) => (
                <ConfigRow
                  key={cfg.id}
                  config={cfg}
                  taskType={task.task_type}
                  availableModels={availableModels}
                  isFirst={idx === 0}
                  isLast={idx === task.configs.length - 1}
                  taskSlug={task.slug}
                />
              ))
            )}
          </div>

          {/* Test prompt section */}
          <div className="border-t border-gray-100 pt-4">
            <TestPromptPanel taskSlug={task.slug} taskType={task.task_type} />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main list ──────────────────────────────────────────────────

export default function AiTaskList({
  tasks,
  availableModels,
}: {
  tasks: TaskWithConfigs[]
  availableModels: AiModel[]
}) {
  return (
    <div className="flex flex-col gap-3">
      {tasks.map(task => (
        <TaskCard key={task.slug} task={task} availableModels={availableModels} />
      ))}
    </div>
  )
}
