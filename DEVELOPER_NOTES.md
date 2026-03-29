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
│   │   │   ├── layout.tsx           # Fetches session, renders AppNav with profile
│   │   │   ├── not-found.tsx        # In-app 404 (renders inside sidebar)
│   │   │   ├── page.tsx             # Redirects / → /clients
│   │   │   ├── clients/
│   │   │   │   ├── page.tsx                    # Client list (server component)
│   │   │   │   ├── ClientsTable.tsx            # Interactive search + table (client)
│   │   │   │   ├── new/
│   │   │   │   │   ├── page.tsx                # New client page
│   │   │   │   │   ├── ClientRegistrationForm.tsx
│   │   │   │   │   └── actions.ts              # Server Action (Supabase insert)
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx                # Client profile: demographics + visits
│   │   │   ├── visits/
│   │   │   │   ├── page.tsx                    # Visits placeholder
│   │   │   │   └── new/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── VisitLogForm.tsx
│   │   │   │       └── actions.ts              # Server Action (Supabase insert)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx                    # Reporting dashboard (P1)
│   │   │   ├── schedule/
│   │   │   │   └── page.tsx                    # Week-view calendar (P1)
│   │   │   └── admin/                          # Admin-only pages (/admin/*)
│   │   │       ├── layout.tsx                  # Role guard: non-admins → /
│   │   │       ├── page.tsx                    # /admin — stats + section links
│   │   │       ├── users/                      # /admin/users — role management
│   │   │       ├── settings/                   # /admin/settings — service types (P1)
│   │   │       └── audit-log/                  # /admin/audit-log — audit log (P1)
│   │   ├── auth/callback/           # OAuth code exchange route handler
│   │   ├── login/                   # /login — email/password + Google SSO
│   │   ├── signup/                  # /signup — email/password registration
│   │   ├── not-found.tsx            # Global 404
│   │   └── layout.tsx               # Root layout (fonts, metadata)
│   ├── components/
│   │   ├── AppNav.tsx               # Sidebar nav; shows admin links only to admins
│   │   ├── google-sign-in-button.tsx
│   │   └── ui/                      # shadcn/ui primitives: Button, Card, Input, Label
│   ├── lib/
│   │   ├── auth/
│   │   │   └── permissions.ts       # can.createClient(), can.editVisit(), etc.
│   │   ├── utils.ts                 # cn() helper
│   │   └── supabase/
│   │       ├── client.ts            # Browser Supabase client (OAuth initiation)
│   │       ├── server.ts            # Server Supabase client (cookies from next/headers)
│   │       ├── session.ts           # getSession() — returns { user, profile }
│   │       └── queries.ts           # getProfile(userId), getAllProfiles()
│   ├── types/database.ts            # TypeScript types: Client, Visit, Profile, etc.
│   └── proxy.ts                     # Next.js 16 proxy: session refresh + auth guard
├── supabase/
│   ├── migrations/                  # Apply in order via Supabase SQL Editor
│   └── seed.sql                     # Demo data: 12 clients, 32 visits, 4 staff
├── .github/workflows/ci.yml         # CI: lint + type-check on every PR
├── .env.example                     # Copy to frontend/.env.local
├── functional_requirements.md       # Full feature specs with FR codes
└── DEVELOPER_NOTES.md               # This file
```

---

## What's Already Built

### Infrastructure
| Item | Status | Notes |
|------|--------|-------|
| Next.js 16 scaffold | ✅ Done | App Router, TypeScript strict mode, Tailwind CSS |
| shadcn/ui | ✅ Done | Initialized with neutral theme; `Button`, `Card`, `Input`, `Label` |
| ESLint + Prettier | ✅ Done | `frontend/eslint.config.mjs`, `frontend/.prettierrc` |
| Supabase client helpers | ✅ Done | `lib/supabase/client.ts` (browser) + `server.ts` (server) |
| TypeScript types | ✅ Done | `types/database.ts` — `Client`, `Visit`, `Profile`, `ServiceType`, `AuditLog`, `Appointment` |
| Auth proxy | ✅ Done | `frontend/proxy.ts` — redirects unauthenticated users to `/login` |
| Database schema | ✅ Done | Migrations 1–5 in `supabase/migrations/` — see schema section below |
| Seed data | ✅ Done | `supabase/seed.sql` — 12 clients, 32 visits, 4 staff |
| GitHub Actions CI | ✅ Done | Lint + type-check on every PR targeting `main` |

### P0: Auth + Role-Based Access ✅ Complete (issue #1)

| Item | File(s) | Notes |
|------|---------|-------|
| Email/password login | `app/login/` | `signIn` server action, form with error state |
| Email/password signup | `app/signup/` | `signUp` server action, email confirmation flow |
| Google SSO | `components/google-sign-in-button.tsx`, `app/auth/callback/route.ts` | PKCE flow |
| Sign out | `app/login/actions.ts` → `signOut` | Clears session, redirects to `/login` |
| Session guard (proxy) | `proxy.ts` | Validates JWT on every request; redirects unauthenticated to `/login` |
| Profile auto-creation | `supabase/migrations/20260328000002_profile_trigger.sql` | `handle_new_user` trigger; `getProfile()` upserts on-demand |
| Session + profile helper | `lib/supabase/session.ts` → `getSession()` | Returns `{ user, profile }`. Use this in every layout/page. |
| Role-gated routes | `app/(app)/admin/layout.tsx` | Non-admins redirected to `/` for all `/admin/*` routes |
| Admin nav links | `components/AppNav.tsx` | Users / Settings / Audit Log links shown only to `admin` |
| Admin user management | `app/(app)/admin/users/` | Table of all users, role selector per row, `updateUserRole` server action |
| Permissions helper | `lib/auth/permissions.ts` | `can.createClient(role)`, `can.editVisit(role, ownerId, userId)`, etc. |
| Role escalation fix | `supabase/migrations/20260328000005_fix_profiles_role_escalation.sql` | Prevents users from self-promoting; admins can change any role |

**First admin bootstrap:** Run this in the Supabase SQL Editor (bypasses RLS):
```sql
update public.profiles set role = 'admin' where id = '<your-user-id>';
```
After that, use `/admin/users` to promote others.

### P0 Feature UI — Built, Supabase wiring in progress

| Feature | Status | Files |
|---------|--------|-------|
| App shell + sidebar nav | ✅ Done | `(app)/layout.tsx`, `components/AppNav.tsx` |
| Client list + search | ✅ Done | `clients/page.tsx` + `ClientsTable.tsx` — live search works |
| Client registration form | ✅ Done | `clients/new/` — validates, Supabase insert wired |
| Client profile view | ✅ Done | `clients/[id]/page.tsx` — demographics + visit history |
| Visit log form | ✅ Done | `visits/new/` — validates, Supabase insert wired |
| CSV import/export | ✅ Done | `clients/import/`, `lib/csv.ts` — Papa Parse import, CSV export |
| Reporting dashboard | ✅ Done | `dashboard/page.tsx` — stat cards + Recharts charts |
| Schedule / calendar | ✅ Done | `schedule/page.tsx` — week view + appointment form |
| 404 pages | ✅ Done | `app/not-found.tsx` + `(app)/not-found.tsx` |

### Database Migrations
All 5 migrations must be applied in order via the Supabase SQL Editor:

| # | File | Purpose |
|---|------|---------|
| 1 | `20260328000001_init.sql` | Full schema + RLS policies + 10 seeded service types |
| 2 | `20260328000002_profile_trigger.sql` | Auto-create profile row on signup |
| 3 | `20260328000003_profiles_self_insert.sql` | Allow authenticated users to self-insert profile (pre-trigger accounts) |
| 4 | `20260328000004_fix_profiles_rls_recursion.sql` | Fix `42P17` recursion in admin read policy via `is_admin()` security definer |
| 5 | `20260328000005_fix_profiles_role_escalation.sql` | Prevent role self-promotion; `get_my_role()` + `profiles: admin update all` |

---

## What's NOT Built Yet

### P0 — Complete these before the demo
| Issue | Feature | Status | Notes |
|-------|---------|--------|-------|
| [#1](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/1) | Auth + RBAC | ✅ Done | |
| [#2](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/2) | Client Registration | ✅ Done | Supabase insert wired in `clients/new/actions.ts`; client list wired |
| [#3](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/3) | Service/Visit Logging | UI done | Wire Supabase insert in `visits/new/actions.ts` |
| [#4](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/4) | Client Profile View | UI done | Wire Supabase in `clients/[id]/page.tsx` |
| [#5](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/5) | Deploy + Seed Data | Not started | Vercel deploy, `supabase/seed.sql` ready |

### P1 — After all P0s are live
Issues [#6](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/6) – [#10](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/10): CSV Import/Export, Reporting Dashboard, Scheduling, Configurable Fields, Audit Log UI

### P2 — AI stretch
Issues [#11](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/11) – [#17](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/17): Photo-to-Intake, Semantic Search, Handoff Summary, Funder Reports, Follow-Up Detection, Voice Notes, Multilingual Intake

---

## How to Wire Supabase

### 1. Client list (`clients/page.tsx`)
Replace `STUB_CLIENTS` with:
```ts
const supabase = await createClient()
const { data: clients } = await supabase
  .from('clients')
  .select('*')
  .eq('is_active', true)
  .order('last_name')
```

### 2. Client registration (`clients/new/actions.ts`)
Uncomment the Supabase block and the `redirect('/clients')` call.

### 3. Visit logging (`visits/new/actions.ts`)
Uncomment the Supabase block and the `redirect(\`/clients/\${clientId}\`)` call.

### 4. Client profile (`clients/[id]/page.tsx`)
Replace `STUB_CLIENTS` and `STUB_VISITS` with:
```ts
const supabase = await createClient()
const { data: client } = await supabase
  .from('clients').select('*').eq('id', id).single()

const { data: visits } = await supabase
  .from('visits')
  .select('*, service_types(name), profiles(full_name)')
  .eq('client_id', id)
  .order('visit_date', { ascending: false })
```

---

## Key Conventions

### Auth pattern in layouts and pages
```ts
// Always use getSession() — one call returns both user and profile
import { getSession } from '@/lib/supabase/session'

const session = await getSession()
const { user, profile } = session ?? {}
```

Do **not** call `getUser()` + `getProfile()` separately. Do **not** add `redirect('/login')` in layouts — `proxy.ts` owns that.

### Role-gating UI elements
```tsx
import { can } from '@/lib/auth/permissions'

// In a Server Component (profile comes from getSession())
{can.createClient(profile?.role) && <Button>Add Client</Button>}
{can.editVisit(profile?.role, visit.case_worker_id, user.id) && <EditButton />}
```

### Role-gating server actions
```ts
'use server'
import { can } from '@/lib/auth/permissions'
import { getSession } from '@/lib/supabase/session'

export async function deleteClient(id: string) {
  const session = await getSession()
  if (!can.deleteClient(session?.profile?.role)) throw new Error('Forbidden')
  // ...
}
```

### Data fetching
- **Server Components:** `lib/supabase/server.ts` + `lib/supabase/queries.ts`
- **Server Actions (writes):** `lib/supabase/server.ts` — Supabase handles RLS automatically
- **Client Components (OAuth only):** `lib/supabase/client.ts`

### File naming
- Routes/pages: `kebab-case`
- Components: `PascalCase`
- DB columns: `snake_case`
- TypeScript types: `PascalCase`

### Branch naming
```
feature/short-description
fix/short-description
chore/short-description
```

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
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard → Settings → API → anon/public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Settings → API → service_role (keep secret, server-only) |

---

## Important Notes

- **`proxy.ts` not `middleware.ts`** — Next.js 16 renamed middleware to "proxy". Export must be `export async function proxy(...)`. Never create `middleware.ts`.
- **RLS is on everywhere** — If a query returns empty unexpectedly, the likely cause is a missing or incorrect RLS policy. Check `supabase/migrations/20260328000001_init.sql`.
- **`is_admin()` and `get_my_role()` are security definer functions** — They bypass RLS to avoid infinite recursion when policies reference the `profiles` table. Do not drop them.
- **`custom_fields` is jsonb** — Admin-configurable field definitions are a P1 feature (issue #9). For now, `custom_fields` defaults to `{}`.
- **Admin-only routes need no extra guard in pages** — `app/(app)/admin/layout.tsx` handles the redirect for the entire `/admin/*` subtree.
- **`proxy.ts` owns the auth redirect** — Do not add `redirect('/login')` in layouts or pages.
- **`useActionState` not `useFormState`** — React 19 renamed this hook. Use `useActionState` from `react`.
- **Stub data** — When wiring Supabase, replace stubs in: `clients/page.tsx`, `clients/[id]/page.tsx`, `visits/new/page.tsx`, `dashboard/page.tsx`, `schedule/page.tsx`.
