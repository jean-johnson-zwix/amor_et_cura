import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  if (!q) return NextResponse.json({ clients: [], tasks: [] })

  const supabase = await createClient()

  const [{ data: clientData, error: clientError }, { data: taskData, error: taskError }] =
    await Promise.all([
      supabase
        .from('clients')
        .select('id, first_name, last_name, client_number')
        .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,client_number.ilike.%${q}%`)
        .order('last_name')
        .limit(8),
      supabase
        .from('follow_ups')
        .select('id, client_id, description, urgency, status, clients(first_name, last_name)')
        .eq('status', 'active')
        .ilike('description', `%${q}%`)
        .order('suggested_due_date', { ascending: true, nullsFirst: false })
        .limit(5),
    ])

  if (clientError) return NextResponse.json({ error: clientError.message }, { status: 500 })
  if (taskError) return NextResponse.json({ error: taskError.message }, { status: 500 })

  const tasks = (taskData ?? []).map((t) => {
    const client = t.clients as unknown as { first_name: string; last_name: string } | null
    return {
      id: t.id,
      client_id: t.client_id,
      description: t.description,
      urgency: t.urgency,
      client_name: client ? `${client.first_name} ${client.last_name}` : null,
    }
  })

  return NextResponse.json({ clients: clientData ?? [], tasks })
}
