# Developer Notes
*Last updated: 2026-03-28*

A running log of what's built, what's not, and where to start. Keep this updated as features are completed.

---

## Project Structure

```
nonprofit_client_and_case_management/
├── frontend/                        # Next.js 16 app (App Router)
│   ├── app/
│   │   ├── (dashboard)/            # Auth-required pages (proxy.ts guards entry)
│   │   │   ├── layout.tsx          # Fetches session, renders NavBar
│   │   │   ├── page.tsx            # Dashboard home /
│   │   │   └── admin/              # Admin-only pages (/admin/*)
│   │   │       ├── layout.tsx      # Role guard: non-admins redirected to /
│   │   │       ├── page.tsx        # /admin — user count summary + section links
│   │   │       ├── users/          # /admin/users — role management table
│   │   │       ├── settings/       # /admin/settings — service type config (P1)
│   │   │       └── audit-log/      # /admin/audit-log — audit log viewer (P1)
│   │   ├── auth/callback/          # OAuth code exchange route handler
│   │   ├── login/                  # /login — email/password + Google SSO
│   │   └── signup/                 # /signup — email/password + Google SSO
│   ├── components/
│   │   ├── google-sign-in-button.tsx
│   │   ├── nav-bar.tsx             # Shows admin nav links only to admins
│   │   └── ui/                     # shadcn/ui primitives: Button, Card, Input, Label
│   ├── lib/
│   │   ├── auth/
│   │   │   └── permissions.ts      # can.createClient(), can.editVisit(), etc.
│   │   └── supabase/
│   │       ├── client.ts           # Browser Supabase client (OAuth initiation)
│   │       ├── server.ts           # Server Supabase client (cookies from next/headers)
│   │       ├── session.ts          # getSession() — returns { user, profile }
│   │       └── queries.ts          # getProfile(userId), getAllProfiles()
│   ├── types/database.ts           # TypeScript types for all DB tables
│   └── proxy.ts                    # Next.js 16 proxy: session refresh + auth guard
├── supabase/migrations/            # Apply in order via Supabase SQL Editor
├── .github/workflows/ci.yml        # CI: lint + type-check on every PR
├── .env.example                    # Copy to frontend/.env.local
├── functional_requirements.md      # Full feature specs with FR codes
└── DEVELOPER_NOTES.md              # This file
```

---

## What's Already Built

### Infrastructure
| Item | Status | Notes |
|------|--------|-------|
| Next.js 16 scaffold | ✅ Done | App Router, TypeScript strict mode, Tailwind CSS |
| shadcn/ui | ✅ Done | `Button`, `Card`, `Input`, `Label` |
| ESLint + Prettier | ✅ Done | `frontend/eslint.config.mjs`, `frontend/.prettierrc` |
| Supabase client helpers | ✅ Done | `lib/supabase/client.ts` + `server.ts` |
| GitHub Actions CI | ✅ Done | Lint + type-check on every PR targeting `main` |

### P0: Auth + Role-Based Access ✅ Complete (issue #1)

| Item | File(s) | Notes |
|------|---------|-------|
| Email/password login | `app/login/` | `signIn` server action, form with error state |
| Email/password signup | `app/signup/` | `signUp` server action, email confirmation flow |
| Google SSO | `components/google-sign-in-button.tsx`, `app/auth/callback/route.ts` | PKCE flow; browser-side initiation, server-side exchange |
| Sign out | `app/login/actions.ts` → `signOut` | Clears session, redirects to `/login` |
| Session guard (proxy) | `proxy.ts` | Validates JWT on every request via `getUser()`; redirects unauthenticated users to `/login` |
| Profile auto-creation | `supabase/migrations/20260328000002_profile_trigger.sql` | `handle_new_user` trigger; `getProfile()` upserts on-demand for pre-trigger accounts |
| Session + profile helper | `lib/supabase/session.ts` → `getSession()` | Returns `{ user, profile }`. Use this in every layout/page. |
| Role-gated routes | `app/(dashboard)/admin/layout.tsx` | Non-admins redirected to `/` for all `/admin/*` routes |
| Admin nav links | `components/nav-bar.tsx` | Users / Settings / Audit Log links shown only to `admin` |
| Admin user management | `app/(dashboard)/admin/users/` | Table of all users, role selector per row, `updateUserRole` server action |
| Permissions helper | `lib/auth/permissions.ts` | `can.createClient(role)`, `can.editVisit(role, ownerId, userId)`, etc. Import in any component or server action |
| Role escalation fix | `supabase/migrations/20260328000005_fix_profiles_role_escalation.sql` | Prevents users from self-promoting; admins can change any role |

**First admin bootstrap:** Run this in the Supabase SQL Editor (bypasses RLS):
```sql
update public.profiles set role = 'admin' where id = '<your-user-id>';
```
After that, use `/admin/users` to promote others.

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
| [#2](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/2) | Client Registration | Not started | Intake form + searchable client list — **start here** |
| [#3](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/3) | Service/Visit Logging | Not started | Log entry form, service type dropdown, visit history |
| [#4](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/4) | Client Profile View | Not started | Demographics + visit history on one page |
| [#5](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/5) | Deploy + Seed Data | Not started | Vercel deploy, 10+ demo clients, 30+ visits |

### P1 — After all P0s are live
Issues [#6](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/6) – [#10](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/10): CSV Import/Export, Reporting Dashboard, Scheduling, Configurable Fields, Audit Log UI

### P2 — AI stretch
Issues [#11](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/11) – [#17](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/17): Photo-to-Intake, Semantic Search, Handoff Summary, Funder Reports, Follow-Up Detection, Voice Notes, Multilingual Intake

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

### Local checks
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
- **Admin-only routes need no extra guard in pages** — `app/(dashboard)/admin/layout.tsx` handles the redirect for the entire `/admin/*` subtree.
