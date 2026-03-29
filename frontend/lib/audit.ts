import { createClient } from '@/lib/supabase/server'

type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE'

export async function logAudit({
  actorId,
  action,
  tableName,
  recordId,
  changedFields,
}: {
  actorId: string
  action: AuditAction
  tableName: string
  recordId: string
  changedFields?: string[]
}) {
  const supabase = await createClient()
  await supabase.from('audit_log').insert({
    actor_id: actorId,
    action,
    table_name: tableName,
    record_id: recordId,
    changed_fields: changedFields ?? null,
  })
}
