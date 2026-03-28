import Link from 'next/link'
import ClientsTable from './ClientsTable'
import type { Client } from '@/lib/types'

// Stub data — replace with Supabase query after #1 Auth lands
const STUB_CLIENTS: Client[] = [
  { id: '1', client_number: 'CLT-00001', first_name: 'Maria',  last_name: 'Garcia',    dob: '1985-04-12', phone: '(602) 555-0101', email: 'mgarcia@example.com',  address: '123 Main St, Chandler, AZ',  program: 'Family Services',        is_active: true, custom_fields: {}, created_by: null, created_at: '2026-01-10T00:00:00Z', updated_at: '2026-01-10T00:00:00Z' },
  { id: '2', client_number: 'CLT-00002', first_name: 'James',  last_name: 'Thompson',  dob: '1972-09-30', phone: '(602) 555-0102', email: null,                   address: '456 Oak Ave, Chandler, AZ',  program: 'Housing Support',        is_active: true, custom_fields: {}, created_by: null, created_at: '2026-01-15T00:00:00Z', updated_at: '2026-01-15T00:00:00Z' },
  { id: '3', client_number: 'CLT-00003', first_name: 'Aisha',  last_name: 'Patel',     dob: '1991-02-18', phone: '(602) 555-0103', email: 'apatel@example.com',   address: '789 Elm Blvd, Gilbert, AZ', program: 'Food Assistance',        is_active: true, custom_fields: {}, created_by: null, created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
  { id: '4', client_number: 'CLT-00004', first_name: 'Carlos', last_name: 'Rivera',    dob: '1968-11-05', phone: null,             email: 'crivera@example.com',  address: '321 Pine St, Mesa, AZ',     program: 'Employment Support',     is_active: true, custom_fields: {}, created_by: null, created_at: '2026-02-01T00:00:00Z', updated_at: '2026-02-01T00:00:00Z' },
  { id: '5', client_number: 'CLT-00005', first_name: 'Linda',  last_name: 'Nguyen',    dob: '1999-07-22', phone: '(602) 555-0105', email: 'lnguyen@example.com',  address: '654 Cedar Rd, Tempe, AZ',   program: 'Mental Health Services', is_active: true, custom_fields: {}, created_by: null, created_at: '2026-02-10T00:00:00Z', updated_at: '2026-02-10T00:00:00Z' },
  { id: '6', client_number: 'CLT-00006', first_name: 'David',  last_name: 'Okonkwo',   dob: '1983-03-14', phone: '(602) 555-0106', email: 'dokonkwo@example.com', address: '99 Birch Ln, Chandler, AZ', program: 'Case Management',        is_active: true, custom_fields: {}, created_by: null, created_at: '2026-02-12T00:00:00Z', updated_at: '2026-02-12T00:00:00Z' },
  { id: '7', client_number: 'CLT-00007', first_name: 'Rosa',   last_name: 'Mendez',    dob: '2001-12-01', phone: '(602) 555-0107', email: null,                   address: '200 Maple Dr, Gilbert, AZ', program: 'Child & Family Services',is_active: true, custom_fields: {}, created_by: null, created_at: '2026-02-18T00:00:00Z', updated_at: '2026-02-18T00:00:00Z' },
  { id: '8', client_number: 'CLT-00008', first_name: 'Kevin',  last_name: 'Johnson',   dob: '1975-06-19', phone: '(602) 555-0108', email: 'kjohnson@example.com', address: '550 Spruce Way, Mesa, AZ',  program: 'Housing Support',        is_active: true, custom_fields: {}, created_by: null, created_at: '2026-02-20T00:00:00Z', updated_at: '2026-02-20T00:00:00Z' },
  { id: '9', client_number: 'CLT-00009', first_name: 'Fatima', last_name: 'Al-Hassan', dob: '1994-08-27', phone: '(602) 555-0109', email: 'falhassan@example.com',address: '17 Willow Ct, Tempe, AZ',   program: 'Medical Referral',       is_active: true, custom_fields: {}, created_by: null, created_at: '2026-02-25T00:00:00Z', updated_at: '2026-02-25T00:00:00Z' },
  { id: '10',client_number: 'CLT-00010', first_name: 'Marcus', last_name: 'Williams',  dob: '1989-01-08', phone: null,             email: 'mwilliams@example.com',address: '403 Aspen Ave, Chandler, AZ',program: 'Employment Support',    is_active: true, custom_fields: {}, created_by: null, created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  { id: '11',client_number: 'CLT-00011', first_name: 'Priya',  last_name: 'Sharma',    dob: '2003-05-30', phone: '(602) 555-0111', email: 'psharma@example.com',  address: '88 Sycamore St, Gilbert, AZ',program: 'Education Support',     is_active: true, custom_fields: {}, created_by: null, created_at: '2026-03-05T00:00:00Z', updated_at: '2026-03-05T00:00:00Z' },
  { id: '12',client_number: 'CLT-00012', first_name: 'Darius', last_name: 'Mitchell',  dob: '1960-10-22', phone: '(602) 555-0112', email: null,                   address: '77 Juniper Pl, Mesa, AZ',   program: 'Food Assistance',        is_active: true, custom_fields: {}, created_by: null, created_at: '2026-03-08T00:00:00Z', updated_at: '2026-03-08T00:00:00Z' },
]

export default function ClientsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Clients</h1>
        <div className="flex gap-2">
          <Link
            href="/clients/import"
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-input bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            Import CSV
          </Link>
          <Link
            href="/clients/new"
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          >
            + New Client
          </Link>
        </div>
      </div>

      {/* TODO(#2): pass real Supabase data here after #1 Auth lands */}
      <ClientsTable clients={STUB_CLIENTS} />
    </div>
  )
}
