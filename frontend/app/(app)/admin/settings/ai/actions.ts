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
