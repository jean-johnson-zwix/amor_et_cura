'use server'

import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/supabase/session'
import { logAudit } from '@/lib/audit'

export type NewVisitFormState = {
  error?: string
  fieldErrors?: Partial<Record<string, string>>
  success?: boolean
}

export async function createVisit(
  _prev: NewVisitFormState,
  formData: FormData
): Promise<NewVisitFormState> {
  const clientId = (formData.get('client_id') as string | null)?.trim()
  const visitDate = (formData.get('visit_date') as string | null)?.trim()
  const serviceTypeId = (formData.get('service_type_id') as string | null)?.trim() || null
  const durationMinutes = formData.get('duration_minutes')
  const notes = (formData.get('notes') as string | null)?.trim() || null
  const caseNotes = (formData.get('case_notes') as string | null)?.trim() || null
  const referralTo = (formData.get('referral_to') as string | null)?.trim() || null

  const customFields: Record<string, unknown> = {}
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('cf_')) {
      const fieldName = key.slice(3)
      const existing = customFields[fieldName]
      if (existing !== undefined) {
        customFields[fieldName] = Array.isArray(existing) ? [...existing, value] : [existing, value]
      } else {
        customFields[fieldName] = value
      }
    }
  }

  const fieldErrors: Record<string, string> = {}
  if (!clientId) fieldErrors.client_id = 'Client is required.'
  if (!visitDate) fieldErrors.visit_date = 'Visit date is required.'
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors }

  const duration = durationMinutes ? parseInt(durationMinutes as string, 10) : null

  const session = await getSession()
  if (!session) return { error: 'Not authenticated.' }

  const supabase = await createClient()
  const { data, error } = await supabase.from('visits').insert({
    client_id: clientId,
    case_worker_id: session.user.id,
    service_type_id: serviceTypeId,
    visit_date: visitDate,
    duration_minutes: duration,
    notes,
    case_notes: caseNotes,
    referral_to: referralTo,
    custom_fields: customFields,
  }).select('id').single()

  if (error) return { error: error.message }

  if (data?.id) {
    await logAudit({ actorId: session.user.id, action: 'CREATE', tableName: 'visits', recordId: data.id })

    const aiUrl = process.env.NEXT_PUBLIC_AI_API_URL ?? 'http://localhost:8000'
    const aiText = [caseNotes, notes].filter(Boolean).join('\n\n').trim()

    if (aiText) {
      // Generate embedding for semantic search (best-effort — never block the save)
      try {
        const embedRes = await fetch(`${aiUrl}/ai/embed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: aiText }),
        })
        if (embedRes.ok) {
          const { embedding } = await embedRes.json()
          await supabase.from('visits').update({ embedding: JSON.stringify(embedding) }).eq('id', data.id)
        }
      } catch {
        // Non-critical — silently skip if backend is unavailable
      }

      // Extract implied follow-ups (fire-and-forget — UI returns immediately)
      fetch(`${aiUrl}/ai/extract-followups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visit_id: data.id, client_id: clientId, visit_text: aiText }),
      }).catch(() => {
        // Non-critical — silently skip if backend is unavailable
      })
    }
  }

  return { success: true }
}
