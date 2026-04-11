import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/Topbar'
import AiTaskList from './AiTaskList'
import type { AiTask, AiTaskConfig, AiModel } from '@/types/database'

interface ConfigWithModel extends AiTaskConfig {
  ai_models: AiModel
}

interface TaskWithConfigs extends AiTask {
  configs: ConfigWithModel[]
}

export default async function AdminAiSettingsPage() {
  const supabase = await createClient()

  const [{ data: tasks }, { data: configs }, { data: models }] = await Promise.all([
    supabase.from('ai_tasks').select('*').order('slug'),
    supabase
      .from('ai_task_configs')
      .select('*, ai_models(*)')
      .order('priority'),
    supabase.from('ai_models').select('*').eq('is_active', true).order('name'),
  ])

  // Group configs by task_slug
  const configsByTask: Record<string, ConfigWithModel[]> = {}
  for (const cfg of (configs ?? []) as ConfigWithModel[]) {
    if (!configsByTask[cfg.task_slug]) configsByTask[cfg.task_slug] = []
    configsByTask[cfg.task_slug].push(cfg)
  }

  const tasksWithConfigs: TaskWithConfigs[] = (tasks ?? []).map(task => ({
    ...task,
    configs: configsByTask[task.slug] ?? [],
  }))

  return (
    <>
      <Topbar
        crumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Settings', href: '/admin/settings' },
          { label: 'AI Configuration' },
        ]}
      />
      <div className="p-6 flex flex-col gap-4 max-w-4xl">
        <div>
          <h1 className="text-[15px] font-semibold text-navy">AI Configuration</h1>
          <p className="mt-0.5 text-[12px] text-[#6b7280]">
            Manage which AI models power each feature, edit system prompts, and enable or disable tasks.
            Changes take effect immediately — no redeployment required.
          </p>
        </div>

        <AiTaskList tasks={tasksWithConfigs} availableModels={(models ?? []) as AiModel[]} />
      </div>
    </>
  )
}
