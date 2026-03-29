import type { Client } from '@/types/database'

function escapeCell(value: string | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  // Wrap in quotes if contains comma, quote, or newline
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function toRow(cells: (string | null | undefined)[]): string {
  return cells.map(escapeCell).join(',')
}

export function clientsToCsv(clients: Client[]): string {
  const header = toRow([
    'Client ID',
    'First Name',
    'Last Name',
    'Date of Birth',
    'Phone',
    'Email',
    'Address',
    'Program',
    'Status',
    'Registered',
  ])

  const rows = clients.map((c) =>
    toRow([
      c.client_number,
      c.first_name,
      c.last_name,
      c.dob,
      c.phone,
      c.email,
      c.address,
      c.program,
      c.is_active ? 'Active' : 'Inactive',
      c.created_at.split('T')[0],
    ])
  )

  return [header, ...rows].join('\n')
}

export function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
