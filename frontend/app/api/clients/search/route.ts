import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  if (!q) return NextResponse.json({ results: [] })

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clients')
    .select('id, first_name, last_name, client_number, status')
    .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,client_number.ilike.%${q}%`)
    .order('last_name')
    .limit(8)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ results: data ?? [] })
}
