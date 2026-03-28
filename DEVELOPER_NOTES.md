# Developer Notes
*Last updated: 2026-03-28*

A running log of what's built, what's not, and where to start. Keep this updated as features are completed.

---

## Project Structure

```
nonprofit_client_and_case_management/
├── frontend/                        # Next.js 16 app (App Router)
│   ├── app/
│   │   ├── (app)/                   # Authenticated shell (sidebar layout)
│   │   │   ├── layout.tsx           # Sidebar + main content shell
│   │   │   ├── not-found.tsx        # In-app 404 (renders inside sidebar)
│   │   │   ├── clients/
│   │   │   │   ├── page.tsx         # Client list (server component)
│   │   │   │   ├── ClientsTable.tsx # Interactive search + table (client component)
│   │   │   │   ├── new/
│   │   │   │   │   ├── page.tsx               # New client page
│   │   │   │   │   ├── ClientRegistrationForm.tsx  # Form component
│   │   │   │   │   └── actions.ts             # Server Action stub
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx     # Client profile (demographics + visit history)
│   │   │   ├── visits/
│   │   │   │   ├── page.tsx         # Visits placeholder
│   │   │   │   └── new/
│   │   │   │       ├── page.tsx               # Log visit page
│   │   │   │       ├── VisitLogForm.tsx        # Form component
│   │   │   │       └── actions.ts             # Server Action stub
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx         # Dashboard placeholder (P1)
│   │   │   └── settings/
│   │   │       └── page.tsx         # Settings placeholder (P1)
│   │   ├── login/
│   │   │   └── page.tsx             # Login page (UI only, auth stubbed)
│   │   ├── not-found.tsx            # Global 404
│   │   ├── layout.tsx               # Root layout (fonts, metadata)
│   │   └── page.tsx                 # Redirects / → /clients
│   ├── components/
│   │   ├── AppNav.tsx               # Sidebar nav with active link highlighting
│   │   └── ui/                      # shadcn/ui primitives
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── label.tsx
│   ├── lib/
│   │   ├── types.ts                 # TypeScript types for all DB tables
│   │   ├── utils.ts                 # cn() helper
│   │   └── supabase/
│   │       ├── client.ts            # Browser Supabase client
│   │       └── server.ts            # Server Component Supabase client
│   ├── proxy.ts                     # Auth redirect (Next.js 16 proxy = middleware)
│   └── package.json
├── supabase/
│   └── migrations/
│       └── 20260328000001_init.sql  # Full initial schema
│   └── seed.sql                     # Demo data: 12 clients, 32 visits, 4 staff
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
| TypeScript types | ✅ Done | `lib/types.ts` — `Client`, `Visit`, `Profile`, `ServiceType`, `AuditLog` |
| Auth proxy | ✅ Done | `frontend/proxy.ts` — redirects unauthenticated users to `/login` |
| Database schema | ✅ Done | Migration in `supabase/migrations/` — see schema section below |
| GitHub Actions CI | ✅ Done | Runs `lint` + `type-check` on every PR targeting `main` |

### P0 UI — All screens built (Supabase not yet wired)
| Feature | Status | Files |
|---------|--------|-------|
| App shell + sidebar nav | ✅ Done | `(app)/layout.tsx`, `components/AppNav.tsx` |
| Login page | ✅ Done (UI only) | `app/login/page.tsx` — auth disabled, wired in #1 |
| Root redirect | ✅ Done | `app/page.tsx` → `/clients` |
| Client list + search | ✅ Done | `clients/page.tsx` + `ClientsTable.tsx` — live search works |
| Client registration form | ✅ Done (stub) | `clients/new/` — validates, Server Action ready for Supabase |
| Client profile view | ✅ Done | `clients/[id]/page.tsx` — demographics + visit history |
| Visit log form | ✅ Done (stub) | `visits/new/` — validates, Server Action ready for Supabase |
| 404 pages | ✅ Done | `app/not-found.tsx` + `(app)/not-found.tsx` |
| Seed data | ✅ Done | `supabase/seed.sql` — 12 clients, 32 visits, 4 staff |

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

> **Action needed:** Run the migration SQL in your Supabase project dashboard → SQL Editor before starting feature development. Then run `seed.sql` for demo data.

---

## What's NOT Built Yet

### P0 — Last step: wire Supabase
| Issue | Feature | What's needed |
|-------|---------|---------------|
| [#1](https://github.com/jean-johnson-zwix/amor_et_cura/issues/1) | Auth + RBAC | Build login page Supabase calls; add Google SSO; enforce role guards on routes |
| [#2](https://github.com/jean-johnson-zwix/amor_et_cura/issues/2) | Client Registration | Uncomment Supabase insert in `clients/new/actions.ts`; swap stub data in `clients/page.tsx` |
| [#3](https://github.com/jean-johnson-zwix/amor_et_cura/issues/3) | Service/Visit Logging | Uncomment Supabase insert in `visits/new/actions.ts`; load real visits in `clients/[id]/page.tsx` |
| [#4](https://github.com/jean-johnson-zwix/amor_et_cura/issues/4) | Client Profile View | Swap stub data with Supabase query in `clients/[id]/page.tsx` |
| [#5](https://github.com/jean-johnson-zwix/amor_et_cura/issues/5) | Deploy + Seed Data | Set up Vercel deploy; run migration + seed on Supabase |

### P1 — After P0 is live
Issues [#6](https://github.com/jean-johnson-zwix/amor_et_cura/issues/6) – [#10](https://github.com/jean-johnson-zwix/amor_et_cura/issues/10): CSV Import/Export, Reporting Dashboard, Scheduling, Configurable Fields, Audit Log

### P2 — AI stretch
Issues [#11](https://github.com/jean-johnson-zwix/amor_et_cura/issues/11) – [#17](https://github.com/jean-johnson-zwix/amor_et_cura/issues/17): Photo-to-Intake, Semantic Search, Handoff Summary, Funder Reports, Follow-Up Detection, Voice Notes, Multilingual Intake

---

## How to Wire Supabase (after #1 Auth lands)

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
- **`custom_fields` is jsonb** — Client custom fields are stored as `jsonb` on the `clients` table. Admin-configurable field definitions will be added in issue [#9](https://github.com/jean-johnson-zwix/amor_et_cura/issues/9) (P1).
- **Stub data in 3 places** — When wiring Supabase, replace stubs in: `clients/page.tsx`, `clients/[id]/page.tsx`, and `visits/new/page.tsx`.
- **`useActionState` not `useFormState`** — React 19 renamed this hook. Use `useActionState` from `react`.
