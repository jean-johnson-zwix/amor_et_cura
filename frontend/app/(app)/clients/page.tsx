import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import type { Client } from '@/lib/types'

// Stub data — replace with Supabase query after #1 Auth lands
const STUB_CLIENTS: Client[] = [
  { id: '1', client_number: 'CLT-00001', first_name: 'Maria', last_name: 'Garcia', dob: '1985-04-12', phone: '(602) 555-0101', email: 'mgarcia@example.com', address: '123 Main St, Chandler, AZ', program: 'Family Services', is_active: true, custom_fields: {}, created_by: null, created_at: '2026-01-10T00:00:00Z', updated_at: '2026-01-10T00:00:00Z' },
  { id: '2', client_number: 'CLT-00002', first_name: 'James', last_name: 'Thompson', dob: '1972-09-30', phone: '(602) 555-0102', email: null, address: '456 Oak Ave, Chandler, AZ', program: 'Housing Support', is_active: true, custom_fields: {}, created_by: null, created_at: '2026-01-15T00:00:00Z', updated_at: '2026-01-15T00:00:00Z' },
  { id: '3', client_number: 'CLT-00003', first_name: 'Aisha', last_name: 'Patel', dob: '1991-02-18', phone: '(602) 555-0103', email: 'apatel@example.com', address: '789 Elm Blvd, Gilbert, AZ', program: 'Food Assistance', is_active: true, custom_fields: {}, created_by: null, created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
  { id: '4', client_number: 'CLT-00004', first_name: 'Carlos', last_name: 'Rivera', dob: '1968-11-05', phone: null, email: 'crivera@example.com', address: '321 Pine St, Mesa, AZ', program: 'Employment Support', is_active: true, custom_fields: {}, created_by: null, created_at: '2026-02-01T00:00:00Z', updated_at: '2026-02-01T00:00:00Z' },
  { id: '5', client_number: 'CLT-00005', first_name: 'Linda', last_name: 'Nguyen', dob: '1999-07-22', phone: '(602) 555-0105', email: 'lnguyen@example.com', address: '654 Cedar Rd, Tempe, AZ', program: 'Mental Health Services', is_active: true, custom_fields: {}, created_by: null, created_at: '2026-02-10T00:00:00Z', updated_at: '2026-02-10T00:00:00Z' },
]

export default function ClientsPage() {
  // Note: searchParams is a Promise in Next.js 16 (accessed via async/await in Server Components)
  // For now using stub sync access — will be fixed when wiring Supabase
  const query: string = ''

  const filtered = STUB_CLIENTS.filter((c) => {
    if (!query) return true
    const name = `${c.first_name} ${c.last_name}`.toLowerCase()
    return name.includes(query.toLowerCase()) || c.client_number.toLowerCase().includes(query.toLowerCase())
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Clients</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} active clients</p>
        </div>
        <Link
          href="/clients/new"
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          + New Client
        </Link>
      </div>

      <div className="max-w-sm">
        {/* TODO: wire up search with searchParams after auth lands */}
        <Input placeholder="Search by name or ID…" defaultValue={query} />
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Date of Birth</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Program</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => (
                <tr key={client.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{client.client_number}</td>
                  <td className="px-4 py-3">
                    <Link href={`/clients/${client.id}`} className="font-medium hover:underline">
                      {client.first_name} {client.last_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{client.dob ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{client.phone ?? '—'}</td>
                  <td className="px-4 py-3">{client.program ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No clients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
