import type { UserRole } from '@/types/database'

/**
 * Role-to-action permission map.
 * Use this in Server Components, Server Actions, and Client Components alike.
 *
 * Usage:
 *   can.editClient(profile?.role)           // true | false
 *   can.editVisit(profile?.role, visit.case_worker_id, user.id)  // own-only for case_worker
 */
export const can = {
  // Clients
  createClient:     (role?: UserRole) => role === 'admin' || role === 'case_worker',
  editClient:       (role?: UserRole) => role === 'admin' || role === 'case_worker',
  deactivateClient: (role?: UserRole) => role === 'admin',
  deleteClient:     (role?: UserRole) => role === 'admin',

  // Visits
  logVisit:   (role?: UserRole) => role === 'admin' || role === 'case_worker',
  editVisit:  (role?: UserRole, visitOwnerId?: string, userId?: string) => {
    if (role === 'admin') return true
    if (role === 'case_worker') return !!visitOwnerId && visitOwnerId === userId
    return false
  },
  deleteVisit: (role?: UserRole) => role === 'admin',

  // Admin-only
  manageUsers:       (role?: UserRole) => role === 'admin',
  configureSettings: (role?: UserRole) => role === 'admin',
  viewAuditLog:      (role?: UserRole) => role === 'admin',
  importCsv:         (role?: UserRole) => role === 'admin',
  exportCsv:         (role?: UserRole) => role === 'admin' || role === 'case_worker',
} as const
