'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/supabase/session'

async function requireAdmin() {
  const session = await getSession()
  if (session?.profile?.role !== 'admin') throw new Error('Not authorized')
}

export type AiConfigFormState = { error?: string; success?: boolean }

/** Update the system prompt for a task (shared across all models in its chain). */
export async function updateTaskPrompt(
  taskSlug: string,
  systemPrompt: string | null
): Promise<AiConfigFormState> {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from('ai_tasks')
    .update({ system_prompt: systemPrompt || null })
    .eq('slug', taskSlug)

  if (error) return { error: error.message }
  revalidatePath('/admin/settings/ai')
  return { success: true }
}

/** Update model parameters for a single config row (no prompt). */
export async function updateTaskConfig(
  configId: string,
  data: {
    temperature: number
    max_tokens: number
    response_format: 'text' | 'json'
  }
): Promise<AiConfigFormState> {
  await requireAdmin()

  const temperature = Number(data.temperature)
  const maxTokens   = Number(data.max_tokens)

  if (isNaN(temperature) || temperature < 0 || temperature > 2)
    return { error: 'Temperature must be between 0 and 2.' }
  if (isNaN(maxTokens) || maxTokens < 0)
    return { error: 'Max tokens must be a positive number.' }
  if (!['text', 'json'].includes(data.response_format))
    return { error: 'Invalid response format.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('ai_task_configs')
    .update({ temperature, max_tokens: maxTokens, response_format: data.response_format })
    .eq('id', configId)

  if (error) return { error: error.message }
  revalidatePath('/admin/settings/ai')
  return { success: true }
}

/** Toggle is_active for all configs belonging to a task. */
export async function toggleTaskActive(taskSlug: string, isActive: boolean): Promise<void> {
  await requireAdmin()
  const supabase = await createClient()
  await supabase
    .from('ai_task_configs')
    .update({ is_active: isActive })
    .eq('task_slug', taskSlug)
  revalidatePath('/admin/settings/ai')
}

/** Swap the model on a config row. */
export async function updateConfigModel(configId: string, modelId: string): Promise<AiConfigFormState> {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from('ai_task_configs')
    .update({ model_id: modelId })
    .eq('id', configId)

  if (error) return { error: error.message }
  revalidatePath('/admin/settings/ai')
  return { success: true }
}

/**
 * Move a config up or down in the fallback chain by swapping priorities
 * with its immediate neighbour.
 */
export async function reorderConfig(
  configId: string,
  taskSlug: string,
  direction: 'up' | 'down'
): Promise<AiConfigFormState> {
  await requireAdmin()
  const supabase = await createClient()

  const { data: configs, error: fetchError } = await supabase
    .from('ai_task_configs')
    .select('id, priority')
    .eq('task_slug', taskSlug)
    .order('priority', { ascending: true })

  if (fetchError) return { error: fetchError.message }
  if (!configs) return { error: 'No configs found.' }

  const idx = configs.findIndex(c => c.id === configId)
  if (idx === -1) return { error: 'Config not found.' }

  const swapIdx = direction === 'up' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= configs.length) return { success: true } // already at boundary

  const a = configs[idx]
  const b = configs[swapIdx]

  // Swap priorities using a temporary value to avoid unique constraint conflict
  const tmpPriority = Math.max(...configs.map(c => c.priority)) + 1

  const { error: e1 } = await supabase.from('ai_task_configs').update({ priority: tmpPriority }).eq('id', a.id)
  if (e1) return { error: e1.message }
  const { error: e2 } = await supabase.from('ai_task_configs').update({ priority: a.priority }).eq('id', b.id)
  if (e2) return { error: e2.message }
  const { error: e3 } = await supabase.from('ai_task_configs').update({ priority: b.priority }).eq('id', a.id)
  if (e3) return { error: e3.message }

  revalidatePath('/admin/settings/ai')
  return { success: true }
}
