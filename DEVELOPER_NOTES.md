# Developer Notes
*Last updated: 2026-03-28*

A running log of what's built, what's not, and where to start. Keep this updated as features are completed.

---

## Project Structure

```
nonprofit_client_and_case_management/
├── frontend/                        # Next.js 16 app (App Router)
│   ├── app/                         # Pages and layouts
│   ├── components/ui/               # shadcn/ui primitives
│   ├── lib/supabase/
│   │   ├── client.ts                # Browser Supabase client
│   │   └── server.ts                # Server Component Supabase client
│   ├── proxy.ts                     # Auth redirect (Next.js 16 "proxy" = middleware)
│   ├── .env.local                   # Local env vars (not committed)
│   └── package.json
├── supabase/
│   └── migrations/
│       └── 20260328000001_init.sql  # Full initial schema
├── .github/workflows/ci.yml         # CI: lint + type-check on every PR
├── .env.example                     # Template — copy to frontend/.env.local
├── functional_requirements.md       # Full feature specs with FR codes
└── DEVELOPER_NOTES.md               # This file
```

---

## What's Already Built

### Infrastructure
| Item | Status | Notes |
|------|--------|-------|
| Next.js 16 scaffold | ✅ Done | App Router, TypeScript strict mode, Tailwind CSS |
| shadcn/ui | ✅ Done | Initialized with neutral theme; `Button`, `Card`, `Input`, `Label` added |
| ESLint + Prettier | ✅ Done | Config in `frontend/eslint.config.mjs` and `frontend/.prettierrc` |
| Supabase client helpers | ✅ Done | `lib/supabase/client.ts` (browser) + `lib/supabase/server.ts` (server) |
| Auth proxy | ✅ Done | `frontend/proxy.ts` — redirects unauthenticated users to `/login` |
| Database schema | ✅ Done | Migration in `supabase/migrations/` — see schema section below |
| GitHub Actions CI | ✅ Done | Runs `lint` + `type-check` on every PR targeting `main` |

### Auth (P0 — Done)
| Item | Notes |
|------|-------|
| Login page | `/login` — email/password + Google SSO |
| Signup page | `/signup` — email/password + Google SSO |
| Google OAuth | `GoogleSignInButton` → `/auth/callback` route handler → session established |
| Proxy (auth guard) | `frontend/proxy.ts` — validates session on every request; redirects unauthenticated users to `/login` |
| Profile auto-creation | `handle_new_user` trigger creates a profile row on signup; `getProfile()` upserts on-demand for pre-trigger accounts |
| Server actions | `signIn`, `signUp`, `signOut`, `exchangeOAuthCode` in `app/login/actions.ts` |
| Data fetchers | `getProfile(userId)` in `lib/supabase/queries.ts` |

**Known limitation:** Roles exist in the DB and are enforced by RLS, but role-gated UI (hiding admin-only actions from case workers) is not yet implemented. Track in issue [#1](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/1).

### Database Schema
Applied. The migration files in `supabase/migrations/` define:

| Migration | Purpose |
|-----------|---------|
| `20260328000001_init.sql` | Full schema: `profiles`, `clients`, `visits`, `service_types`, `audit_log` + all RLS policies + service type seed data |
| `20260328000002_profile_trigger.sql` | `handle_new_user` trigger — auto-creates a profile row when a user signs up |
| `20260328000003_profiles_self_insert.sql` | INSERT policy on `profiles` — allows authenticated users to self-insert (for accounts created before the trigger) |
| `20260328000004_fix_profiles_rls_recursion.sql` | Fixes `42P17` infinite recursion in `profiles: admin read all` via a `security definer` helper function `is_admin()` |

All migrations have been applied to the Supabase project. RLS is active on all tables. 10 default service types are seeded.

---

## What's NOT Built Yet

Everything below is tracked on the [ohack_dev project board](https://github.com/users/jean-johnson-zwix/projects/3).

### P0 — Start here
| Issue | Feature | Status | Notes |
|-------|---------|--------|-------|
| [#1](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/1) | Auth + RBAC | In progress | Auth done. Role-gated UI pending. |
| [#2](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/2) | Client Registration | Not started | Intake form, client list — **pick this up next** |
| [#3](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/3) | Service/Visit Logging | Not started | Log entry form, service type dropdown, history list |
| [#4](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/4) | Client Profile View | Not started | Demographics + visit history on one page |
| [#5](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/5) | Deploy + Seed Data | Not started | Vercel deploy, seed 10+ clients and 30+ visits |

### P1 — After P0 is live
Issues [#6](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/6) – [#10](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/10): CSV Import/Export, Reporting Dashboard, Scheduling, Configurable Fields, Audit Log

### P2 — AI stretch
Issues [#11](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/11) – [#17](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/17): Photo-to-Intake, Semantic Search, Handoff Summary, Funder Reports, Follow-Up Detection, Voice Notes, Multilingual Intake

---

## Key Conventions

### Roles
Three roles enforced at both the UI and database (RLS) levels:
- `admin` — full access
- `case_worker` — create/edit clients and visits; edit own visits only
- `read_only` — view only

### Data Fetching Pattern
- **Read data:** Use Next.js Server Components with `lib/supabase/server.ts`
- **Write data:** Use Next.js Server Actions
- **Client-side interactivity only:** Use `lib/supabase/client.ts`

### File Naming
- Pages/routes: `kebab-case`
- Components: `PascalCase`
- DB columns: `snake_case`
- TypeScript types/interfaces: `PascalCase`

### Branch Naming
```
feature/short-description
fix/short-description
chore/short-description
```

### Running Checks Locally
```bash
cd frontend
npm run lint          # ESLint
npm run type-check    # TypeScript (tsc --noEmit)
npm run format        # Prettier (auto-fix)
npm run build         # Full production build
```

---

## Environment Variables

Copy `.env.example` to `frontend/.env.local` and fill in:

| Variable | Where to find it |
|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Settings → API (keep secret) |

---

## Important Notes

- **`proxy.ts` not `middleware.ts`** — Next.js 16 renamed middleware to "proxy". The file is `frontend/proxy.ts` and the export is `export async function proxy(...)`. Do not create a `middleware.ts` file.
- **RLS is on** — All Supabase tables have Row Level Security enabled. If a query returns empty unexpectedly, check the RLS policies in the migration file.
- **`custom_fields` is jsonb** — Client custom fields are stored as `jsonb` on the `clients` table. Admin-configurable field definitions will be added in issue [#9](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/9) (P1).
- **`proxy.ts` owns the auth redirect** — Do not add `redirect('/login')` in layouts or pages. The proxy handles unauthenticated users. Layouts call `getUser()` once and call `getProfile(user.id)` to get the profile. If profile is null but user exists, `getProfile` upserts automatically.
- **`getProfile(userId)` requires a user ID** — It no longer calls `getUser()` internally. Get the user from `createClient().auth.getUser()` in the layout/page, then pass `user.id` to `getProfile`.
