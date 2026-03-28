export type UserRole = 'admin' | 'case_worker' | 'read_only'

export type Profile = {
  id: string
  full_name: string
  role: UserRole
  created_at: string
  updated_at: string
}

export type Client = {
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

export type ServiceType = {
  id: string
  name: string
  is_active: boolean
  created_at: string
}

export type Visit = {
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

export type AuditLog = {
  id: string
  actor_id: string | null
  action: 'CREATE' | 'UPDATE' | 'DELETE'
  table_name: string
  record_id: string
  changed_fields: string[] | null
  created_at: string
}
