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
  programs: string[]
  is_active: boolean
  household_id: string | null
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
  case_notes: string | null
  referral_to: string | null
  custom_fields: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  client_id: string
  file_name: string
  file_path: string
  file_size: number | null
  mime_type: string | null
  uploaded_by: string | null
  created_at: string
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

export interface OrgSettings {
  id: string
  org_name: string
  org_mission: string
  contact_email: string
  org_logo_url: string | null
  primary_color: string
  secondary_color: string
  setup_complete: boolean
  created_at: string
  updated_at: string
}

export interface AiTask {
  slug: string
  display_name: string
  description: string
  task_type: 'chat' | 'vision' | 'audio'
  system_prompt: string | null
}

export interface AiModel {
  id: string
  name: string
  provider: string
  model_id: string
  supports_vision: boolean
  supports_audio: boolean
  is_active: boolean
  created_at: string
}

export interface AiTaskConfig {
  id: string
  task_slug: string
  model_id: string
  priority: number
  temperature: number
  max_tokens: number
  response_format: 'text' | 'json'
  is_active: boolean
  updated_at: string
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
