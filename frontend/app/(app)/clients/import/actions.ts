'use server'

import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/supabase/session'
import { logAudit } from '@/lib/audit'

export type ImportRow = {
  row: number
  first_name: string
  last_name: string
  dob: string | null
  phone: string | null
  email: string | null
  address: string | null
  program: string | null
}

export type ImportRowResult = {
  row: number
  name: string
  status: 'success' | 'error'
  error?: string
}

export type ImportResult = {
  results: ImportRowResult[]
  successCount: number
  errorCount: number
}

export async function importClients(rows: ImportRow[]): Promise<ImportResult> {
  const session = await getSession()
  if (!session) {
    return {
      results: rows.map((r) => ({
        row: r.row,
        name: `${r.first_name} ${r.last_name}`,
        status: 'error',
        error: 'Not authenticated.',
      })),
      successCount: 0,
      errorCount: rows.length,
    }
  }

  const supabase = await createClient()
  const results: ImportRowResult[] = []

  for (const row of rows) {
    const name = `${row.first_name} ${row.last_name}`
    const { data, error } = await supabase.from('clients').insert({
      first_name: row.first_name,
      last_name: row.last_name,
      dob: row.dob,
      phone: row.phone,
      email: row.email,
      address: row.address,
      program: row.program,
      created_by: session.user.id,
    }).select('id').single()

    if (error) {
      results.push({ row: row.row, name, status: 'error', error: error.message })
    } else {
      results.push({ row: row.row, name, status: 'success' })
      if (data?.id) {
        await logAudit({ actorId: session.user.id, action: 'CREATE', tableName: 'clients', recordId: data.id })
      }
    }
  }

  return {
    results,
    successCount: results.filter((r) => r.status === 'success').length,
    errorCount: results.filter((r) => r.status === 'error').length,
  }
}
