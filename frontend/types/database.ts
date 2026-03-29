export type UserRole = 'admin' | 'case_worker' | 'viewer'

export interface Profile {
  id: string
  full_name: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  client_number: string
  first_name: string
  last_name: string
  dob: string | null
  phone: string | null
  email: string | null
  address: string | null
  program: string | null
  is_active: boolean
  custom_fields: Record<string, unknown>
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ServiceType {
  id: string
  name: string
  is_active: boolean
  created_at: string
}

export interface Visit {
  id: string
  client_id: string
  case_worker_id: string
  service_type_id: string | null
  visit_date: string
  duration_minutes: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  client_id: string
  case_worker_id: string
  service_type_id: string | null
  scheduled_at: string   // ISO datetime e.g. "2026-03-30T10:00:00"
  duration_minutes: number | null
  notes: string | null
  status: 'scheduled' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  actor_id: string | null
  action: 'CREATE' | 'UPDATE' | 'DELETE'
  table_name: string
  record_id: string
  changed_fields: string[] | null
  created_at: string
}

export type FieldType = 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect'
export type FieldAppliesTo = 'client' | 'visit'

export interface FieldDefinition {
  id: string
  name: string
  label: string
  field_type: FieldType
  options: string[] | null
  required: boolean
  applies_to: FieldAppliesTo
  sort_order: number
  is_active: boolean
  created_at: string
}
