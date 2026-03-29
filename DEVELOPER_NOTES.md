# Developer Notes
*Last updated: 2026-03-28*

A running log of what's built, what's not, and where to start. Keep this updated as features are completed.

---

## Project Structure

```
nonprofit_client_and_case_management/
├── frontend/                        # Next.js 16 app (App Router)
│   ├── app/
│   │   ├── (app)/                   # Auth-required shell (proxy.ts guards entry)
│   │   │   ├── layout.tsx           # Fetches session, renders NavBar + AppNav with profile
│   │   │   ├── not-found.tsx        # In-app 404 (renders inside sidebar)
│   │   │   ├── page.tsx             # Redirects / → /dashboard
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx         # Stat cards + Recharts charts (live Supabase data)
│   │   │   │   └── PrintButton.tsx  # Client component: window.print()
│   │   │   ├── clients/
│   │   │   │   ├── page.tsx         # Client list (server component, live data)
│   │   │   │   ├── ClientsTable.tsx # Interactive search + table (client component)
│   │   │   │   ├── new/
│   │   │   │   │   ├── page.tsx     # Fetches service_types + field_definitions
│   │   │   │   │   ├── ClientRegistrationForm.tsx  # Renders standard + custom fields
│   │   │   │   │   └── actions.ts   # createClient — insert + custom_fields + audit log
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx     # Client profile: demographics + custom fields + visits
│   │   │   │   └── import/
│   │   │   │       ├── page.tsx     # CSV import UI
│   │   │   │       ├── ImportForm.tsx
│   │   │   │       └── actions.ts   # importClients — bulk insert + audit log per row
│   │   │   ├── services/
│   │   │   │   ├── page.tsx         # Redirects /services → /services/schedule
│   │   │   │   ├── visits/
│   │   │   │   │   ├── page.tsx     # All visits table (live data)
│   │   │   │   │   └── new/
│   │   │   │   │       ├── page.tsx
│   │   │   │   │       ├── VisitLogForm.tsx
│   │   │   │   │       └── actions.ts  # createVisit — insert + audit log
│   │   │   │   └── schedule/
│   │   │   │       ├── page.tsx     # Week-view calendar (live data, ?week= param)
│   │   │   │       └── new/
│   │   │   │           ├── page.tsx
│   │   │   │           ├── AppointmentForm.tsx
│   │   │   │           └── actions.ts  # createAppointment — insert + audit log
│   │   │   └── admin/               # Admin-only pages (/admin/*)
│   │   │       ├── layout.tsx       # Role guard: non-admins → /dashboard
│   │   │       ├── page.tsx         # /admin — stats + section links
│   │   │       ├── users/
│   │   │       │   ├── page.tsx     # User management table + role selector
│   │   │       │   ├── role-form.tsx
│   │   │       │   └── actions.ts   # updateUserRole — update + audit log
│   │   │       ├── settings/
│   │   │       │   ├── page.tsx     # Configurable fields viewer (server)
│   │   │       │   ├── FieldManager.tsx  # Add / disable / delete fields (client)
│   │   │       │   └── actions.ts   # addFieldDefinition, toggleFieldActive, deleteFieldDefinition
│   │   │       └── audit-log/
│   │   │           └── page.tsx     # Audit log viewer with filters + pagination
│   │   ├── auth/callback/           # OAuth code exchange route handler
│   │   ├── login/                   # /login — email/password + Google SSO
│   │   ├── signup/                  # /signup — email/password registration
│   │   ├── not-found.tsx            # Global 404
│   │   └── layout.tsx               # Root layout (fonts, metadata)
│   ├── components/
│   │   ├── AppNav.tsx               # Context-aware sidebar (Services sub-nav, Admin sub-nav)
│   │   ├── nav-bar.tsx              # Top nav: Dashboard / Clients / Services / Admin
│   │   ├── google-sign-in-button.tsx
│   │   ├── dashboard/
│   │   │   ├── ServiceBreakdownChart.tsx   # Recharts bar chart
│   │   │   └── VisitTrendChart.tsx         # Recharts line chart
│   │   └── ui/                      # shadcn/ui primitives
│   ├── lib/
│   │   ├── audit.ts                 # logAudit() — thin wrapper around audit_log insert
│   │   ├── appointments.ts          # getMondayOfWeek, addDays, getWeekDays, appointmentsForDate, formatTime
│   │   ├── csv.ts                   # parseCSV (Papa Parse), exportToCSV
│   │   ├── dashboard.ts             # computeDashboardStats(visits, activeClients)
│   │   ├── utils.ts                 # cn() Tailwind class merger
│   │   └── supabase/
│   │       ├── client.ts            # Browser Supabase client (OAuth only)
│   │       ├── server.ts            # Server Supabase client (reads cookies)
│   │       ├── session.ts           # getSession() → { user, profile }
│   │       └── queries.ts           # getProfile(userId), getAllProfiles()
│   │   └── auth/
│   │       └── permissions.ts       # can.createClient(), can.editVisit(), can.manageUsers(), etc.
│   ├── types/database.ts            # Client, Visit, Appointment, Profile, ServiceType, AuditLog, FieldDefinition
│   └── proxy.ts                     # Next.js 16 proxy: session refresh + auth guard
├── supabase/
│   ├── migrations/                  # Apply in numbered order via Supabase SQL Editor
│   ├── seed.sql                     # Original seed (clients + visits only)
│   └── demo_seed.sql                # Complete demo seed: profiles + clients + visits + appointments
├── .github/workflows/ci.yml         # CI: lint + type-check on every PR
├── .env.example                     # Copy to frontend/.env.local
├── functional_requirements.md       # Full feature specs with FR codes and completion status
└── DEVELOPER_NOTES.md               # This file
```

---

## What's Already Built

### Infrastructure
| Item | Status | Notes |
|------|--------|-------|
| Next.js 16 scaffold | ✅ Done | App Router, TypeScript strict mode, Tailwind CSS |
| shadcn/ui | ✅ Done | Initialized with neutral theme; Button, Card, Input, Label |
| ESLint + Prettier | ✅ Done | `frontend/eslint.config.mjs`, `frontend/.prettierrc` |
| Supabase client helpers | ✅ Done | `lib/supabase/client.ts` (browser) + `server.ts` (server) |
| TypeScript types | ✅ Done | `types/database.ts` — Client, Visit, Appointment, Profile, ServiceType, AuditLog, FieldDefinition |
| Auth proxy | ✅ Done | `frontend/proxy.ts` — redirects unauthenticated to `/login` |
| Database schema | ✅ Done | Migrations 1–8 in `supabase/migrations/` |
| Demo seed data | ✅ Done | `supabase/demo_seed.sql` — 12 clients, 32 visits, 16 appointments, 4 staff |
| GitHub Actions CI | ✅ Done | Lint + type-check on every PR targeting `main` |

### P0: Auth + Role-Based Access ✅ Complete (issue #1)

| Item | File(s) | Notes |
|------|---------|-------|
| Email/password login | `app/login/` | `signIn` server action |
| Email/password signup | `app/signup/` | `signUp` server action, email confirmation flow |
| Google SSO | `components/google-sign-in-button.tsx`, `app/auth/callback/route.ts` | PKCE flow |
| Sign out | `app/login/actions.ts` → `signOut` | Clears session, redirects to `/login` |
| Session guard (proxy) | `proxy.ts` | Validates JWT on every request |
| Profile auto-creation | `supabase/migrations/20260328000002_profile_trigger.sql` | `handle_new_user` trigger |
| Session + profile helper | `lib/supabase/session.ts` → `getSession()` | Returns `{ user, profile }` — use this everywhere |
| Role-gated routes | `app/(app)/admin/layout.tsx` | Non-admins redirected for all `/admin/*` |
| Admin user management | `app/(app)/admin/users/` | Role selector per row, `updateUserRole` server action + audit logged |
| Permissions helper | `lib/auth/permissions.ts` | `can.createClient(role)`, `can.editVisit(role, ownerId, userId)`, `can.manageUsers(role)` |
| Role escalation fix | `supabase/migrations/20260328000005_fix_profiles_role_escalation.sql` | Prevents self-promotion |

**First admin bootstrap** (run once in Supabase SQL Editor):
```sql
update public.profiles set role = 'admin' where id = '<your-user-id>';
```

### P0: Client Registration ✅ Complete (issue #2)

| Item | File(s) |
|------|---------|
| Client list with live search | `clients/page.tsx` + `ClientsTable.tsx` |
| New client form | `clients/new/ClientRegistrationForm.tsx` |
| Create action + audit log | `clients/new/actions.ts` |
| Custom fields on intake form | Fetched from `field_definitions` where `applies_to = 'client'` |

### P0: Service/Visit Logging ✅ Complete (issue #3)

| Item | File(s) |
|------|---------|
| Log visit form | `services/visits/new/VisitLogForm.tsx` |
| Create visit action + audit log | `services/visits/new/actions.ts` |
| All visits list | `services/visits/page.tsx` |

### P0: Client Profile View ✅ Complete (issue #4)

| Item | File(s) |
|------|---------|
| Demographics panel + visit history | `clients/[id]/page.tsx` |
| Custom field values displayed | Reads from `client.custom_fields` jsonb, labels from `field_definitions` |

### P1: CSV Import/Export ✅ Complete (issue #6)

| Item | File(s) |
|------|---------|
| CSV upload + row-by-row insert | `clients/import/ImportForm.tsx` + `actions.ts` |
| Export clients to CSV | `lib/csv.ts` → `exportToCSV()` |
| Audit log per imported row | `actions.ts` → `logAudit()` per success |

### P1: Reporting Dashboard ✅ Complete (issue #7)

| Item | File(s) |
|------|---------|
| Stat cards: active clients, visits week/month/quarter | `dashboard/page.tsx` |
| Service breakdown bar chart | `components/dashboard/ServiceBreakdownChart.tsx` |
| Visit trend line chart | `components/dashboard/VisitTrendChart.tsx` |
| Print button | `dashboard/PrintButton.tsx` |

### P1: Scheduling/Calendar ✅ Complete (issue #8)

| Item | File(s) |
|------|---------|
| Week-view calendar | `services/schedule/page.tsx` |
| New appointment form | `services/schedule/new/AppointmentForm.tsx` |
| Create appointment action + audit log | `services/schedule/new/actions.ts` |
| Appointments DB table + RLS | `supabase/migrations/20260328000007_appointments.sql` |

### P1: Configurable Fields ✅ Complete (issue #9)

| Item | File(s) |
|------|---------|
| `field_definitions` table + RLS + seed | `supabase/migrations/20260328000008_field_definitions.sql` |
| Admin field CRUD | `admin/settings/FieldManager.tsx` + `actions.ts` |
| Custom fields on intake form | `clients/new/ClientRegistrationForm.tsx` — renders `cf_*` inputs |
| Custom field values saved | `clients/new/actions.ts` → collects `cf_*` keys into `custom_fields` jsonb |
| Custom fields on client profile | `clients/[id]/page.tsx` — shows fields with values present |
| `FieldDefinition` TypeScript type | `types/database.ts` |

### P1: Audit Log ✅ Complete (issue #10)

| Item | File(s) |
|------|---------|
| `audit_log` table + RLS | `supabase/migrations/20260328000001_init.sql` |
| DB triggers (clients, visits, profiles) | `supabase/migrations/20260328000006_audit_triggers.sql` |
| `logAudit()` helper | `lib/audit.ts` |
| Server action logging | All 5 write actions: createClient, importClients, createVisit, createAppointment, updateUserRole |
| Admin audit log viewer | `admin/audit-log/page.tsx` — filter by table, action, user; 50/page pagination |

### Database Migrations
Apply in order via Supabase SQL Editor → New Query:

| # | File | Purpose |
|---|------|---------|
| 1 | `20260328000001_init.sql` | Full schema (profiles, service_types, clients, visits, audit_log) + RLS + 10 seeded service types |
| 2 | `20260328000002_profile_trigger.sql` | Auto-create profile row on signup |
| 3 | `20260328000003_profiles_self_insert.sql` | Allow authenticated users to self-insert profile |
| 4 | `20260328000004_fix_profiles_rls_recursion.sql` | Fix `42P17` recursion via `is_admin()` security definer |
| 5 | `20260328000005_fix_profiles_role_escalation.sql` | Prevent role self-promotion; `get_my_role()` + admin update policy |
| 6 | `20260328000006_audit_triggers.sql` | DB triggers: log INSERT/UPDATE/DELETE on clients, visits, profiles |
| 7 | `20260328000007_appointments.sql` | Appointments table + RLS |
| 8 | `20260328000008_field_definitions.sql` | Configurable field definitions table + RLS + 5 starter fields |

---

## What's NOT Built Yet

### P0 — Last remaining item
| Issue | Feature | Status | Notes |
|-------|---------|--------|-------|
| [#5](https://github.com/jean-johnson-zwix/amor_et_cura/issues/5) | Deploy + Seed Data | Not started | See deployment steps below |

### P2 — AI stretch goals
Issues [#11](https://github.com/jean-johnson-zwix/amor_et_cura/issues/11) – [#17](https://github.com/jean-johnson-zwix/amor_et_cura/issues/17): Photo-to-Intake, Semantic Search, Client Handoff Summary, Auto-Generated Funder Reports, Smart Follow-Up Detection, Voice-to-Case Notes, Multilingual Intake

---

## Deployment Steps (issue #5)

### 1. Apply all 8 migrations
Supabase dashboard → SQL Editor → paste each file in numbered order → Run.

### 2. Seed demo data
Supabase dashboard → SQL Editor → paste `supabase/demo_seed.sql`.

> Before running: create 4 demo auth accounts, copy their UUIDs, and replace the 4 placeholder UUIDs at the top of `demo_seed.sql`.

### 3. Bootstrap first admin
```sql
update public.profiles set role = 'admin' where id = '<your-user-uuid>';
```

### 4. Deploy to Vercel
```bash
cd frontend
npx vercel --prod
```
Set these in the Vercel dashboard → Project → Settings → Environment Variables:
| Variable | Where to find it |
|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon/public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role (server-only) |

### 5. Enable Google OAuth (optional)
Supabase → Auth → Providers → Google → add Client ID + Secret from Google Cloud Console.
Add `https://<your-vercel-url>/auth/callback` to the Google redirect URIs.

---

## Key Conventions

### Auth pattern — always use `getSession()`
```ts
import { getSession } from '@/lib/supabase/session'

const session = await getSession()
const { user, profile } = session ?? {}
```
Do **not** call `getUser()` + `getProfile()` separately. Do **not** add `redirect('/login')` in layouts — `proxy.ts` owns that.

### Role-gating UI
```tsx
import { can } from '@/lib/auth/permissions'

{can.createClient(profile?.role) && <Button>Add Client</Button>}
```

### Role-gating server actions
```ts
'use server'
const session = await getSession()
if (!can.createClient(session?.profile?.role)) return { error: 'Not authorized.' }
```

### Audit logging in server actions
```ts
import { logAudit } from '@/lib/audit'

await logAudit({ actorId: session.user.id, action: 'CREATE', tableName: 'clients', recordId: data.id })
// For updates, pass changedFields: ['role'] or similar
```

### Custom fields — name convention
Form inputs for custom fields use `cf_<field_name>` (e.g. `cf_emergency_contact`).
The action strips the `cf_` prefix and stores the result in `custom_fields` jsonb.

### Data fetching
- **Server Components:** `lib/supabase/server.ts`
- **Server Actions (writes):** `lib/supabase/server.ts` — Supabase RLS applies automatically
- **Client Components (OAuth only):** `lib/supabase/client.ts`

### Navigation structure
- **NavBar (top):** Dashboard | Clients | Services | Admin (admin only)
- **AppNav (sidebar):** context-aware — shows Services sub-nav on `/services/*`, Admin sub-nav on `/admin/*`; `null` elsewhere

### File naming
- Routes/pages: `kebab-case`
- Components: `PascalCase`
- DB columns: `snake_case`
- TypeScript types: `PascalCase`

### Running checks locally
```bash
cd frontend
npm run lint          # ESLint
npm run type-check    # tsc --noEmit
npm run format        # Prettier auto-fix
npm run build         # Full production build
```

---

## Environment Variables

Copy `.env.example` to `frontend/.env.local`:

| Variable | Where to find it |
|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon/public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role (keep secret, never commit) |

---

## Important Notes

- **`proxy.ts` not `middleware.ts`** — Next.js 16 renamed middleware. Export must be `export async function proxy(...)`. Never create `middleware.ts`.
- **RLS is on everywhere** — If a query returns empty unexpectedly, check the RLS policies in `20260328000001_init.sql`. Use the service role key in SQL Editor to bypass for debugging.
- **`is_admin()` and `get_my_role()` are security definer functions** — They bypass RLS to avoid infinite recursion when policies reference `profiles`. Do not drop them.
- **`custom_fields` is jsonb** — Field definitions live in `field_definitions`; values live in `clients.custom_fields`. The intake form collects `cf_*` keys; the action strips the prefix.
- **Audit triggers fire on DB-level changes** — The `log_audit_event()` trigger on `clients`, `visits`, and `profiles` runs regardless of which user or tool makes the change. Server action `logAudit()` calls are a belt-and-suspenders supplement for CREATE events.
- **Admin-only routes need no extra guard in pages** — `app/(app)/admin/layout.tsx` handles the redirect for all `/admin/*` routes.
- **`useActionState` not `useFormState`** — React 19 renamed this hook. Use `useActionState` from `react`.
- **`searchParams` is a Promise in Next.js 16** — Always `await searchParams` before accessing properties.
