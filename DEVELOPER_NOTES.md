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

### Database Schema (migration not yet run on Supabase)
The migration file `supabase/migrations/20260328000001_init.sql` defines:

| Table | Purpose |
|-------|---------|
| `profiles` | Extends Supabase `auth.users` — stores `full_name` and `role` |
| `clients` | Client records with auto-generated `CLT-XXXXX` IDs and `custom_fields` (jsonb) |
| `visits` | Service/visit log entries linked to a client and case worker |
| `service_types` | Admin-configurable dropdown values for visit service types |
| `audit_log` | Tracks create/update/delete actions (field names only, no PII values) |

RLS policies are defined for all tables. Seed data for 10 default service types is included.

> **Action needed:** Run the migration SQL in your Supabase project dashboard → SQL Editor before starting feature development.

---

## What's NOT Built Yet

Everything below is tracked on the [ohack_dev project board](https://github.com/users/jean-johnson-zwix/projects/3).

### P0 — Start here
| Issue | Feature | Notes |
|-------|---------|-------|
| [#1](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/1) | Auth + RBAC | Login page, Google SSO, role enforcement. **Start here.** |
| [#2](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/2) | Client Registration | Intake form, duplicate detection, client list |
| [#3](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/3) | Service/Visit Logging | Log entry form, service type dropdown, history list |
| [#4](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/4) | Client Profile View | Demographics + visit history on one page |
| [#5](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/5) | Deploy + Seed Data | Vercel deploy, seed 10+ clients and 30+ visits |

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
- **No login page yet** — Visiting the app shows a 404 because `/login` doesn't exist. Build issue [#1](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/1) first.
