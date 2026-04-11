# Developer Notes
*Last updated: 2026-04-08*

A running log of what's built, what's not, and where to start next. Keep this updated as features land.

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
│   │   │   │   ├── page.tsx         # Stat cards, charts, quick actions, today's appointments
│   │   │   │   ├── DashboardAppointments.tsx  # Cancel/reschedule step machine (client)
│   │   │   │   ├── actions.ts       # cancelAppointment, rescheduleAppointment
│   │   │   │   └── PrintButton.tsx  # Client component: window.print()
│   │   │   ├── clients/
│   │   │   │   ├── page.tsx         # Client list with search, sort, filter (server)
│   │   │   │   ├── ClientsTable.tsx # Interactive table with CSV export (client)
│   │   │   │   ├── new/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── ClientRegistrationForm.tsx  # AI photo scan + manual fields + programs
│   │   │   │   │   └── actions.ts   # createClient — insert + custom_fields + audit log
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx     # Fetches visits, documents, appointments, household members
│   │   │   │   │   ├── ClientProfileTabs.tsx  # 4-tab UI: Overview / Case Notes / Documents / Appointments
│   │   │   │   │   ├── actions.ts   # updateClient, setClientActive, linkFamilyMember
│   │   │   │   │   └── edit/        # Edit demographics form
│   │   │   │   └── import/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── CsvImporter.tsx
│   │   │   │       └── actions.ts   # importClients — bulk insert + audit log per row
│   │   │   ├── services/
│   │   │   │   ├── page.tsx         # Redirects /services → /services/schedule
│   │   │   │   ├── visits/
│   │   │   │   │   ├── page.tsx     # All past visits table (live data)
│   │   │   │   │   └── new/
│   │   │   │   │       ├── page.tsx
│   │   │   │   │       ├── VisitLogForm.tsx  # Visit form + AI voice-to-note (record live or upload)
│   │   │   │   │       └── actions.ts        # createVisit — returns {success:true}, no redirect
│   │   │   │   └── schedule/
│   │   │   │       ├── page.tsx     # Week-view calendar (?week= param)
│   │   │   │       └── new/
│   │   │   │           ├── page.tsx
│   │   │   │           ├── AppointmentForm.tsx
│   │   │   │           └── actions.ts  # createAppointment — insert + audit log
│   │   │   └── admin/
│   │   │       ├── layout.tsx       # Role guard: non-admins → /dashboard
│   │   │       ├── page.tsx         # /admin — stats + section links
│   │   │       ├── users/           # User role management
│   │   │       ├── settings/        # Service types + configurable field CRUD
│   │   │       └── audit-log/       # Audit log viewer — filter + paginate
│   │   ├── auth/callback/           # OAuth code exchange route handler
│   │   ├── login/                   # Email/password + Google SSO
│   │   ├── signup/                  # Email/password registration
│   │   └── layout.tsx               # Root layout (fonts, metadata)
│   ├── components/
│   │   ├── nav-bar.tsx              # Sidebar navigation
│   │   ├── AuthLayout.tsx           # Login page shell
│   │   ├── Topbar.tsx               # Page header + breadcrumbs
│   │   ├── google-sign-in-button.tsx
│   │   ├── dashboard/
│   │   │   ├── ServiceBreakdownChart.tsx   # Recharts PieChart — visits by service type
│   │   │   └── VisitTrendChart.tsx         # Recharts LineChart — visits per week (last 8 weeks)
│   │   └── ui/                      # Base UI primitives
│   ├── lib/
│   │   ├── audit.ts                 # logAudit() — insert into audit_log
│   │   ├── appointments.ts          # Week helpers, appointmentsForDate, formatTime
│   │   ├── csv.ts                   # parseCSV (Papa Parse), exportToCSV
│   │   ├── dashboard.ts             # computeDashboardStats() — stats + visitTrend (weekly buckets)
│   │   ├── utils.ts                 # cn() Tailwind class merger
│   │   └── supabase/
│   │       ├── client.ts            # Browser Supabase client
│   │       ├── server.ts            # Server Supabase client
│   │       ├── session.ts           # getSession() → { user, profile }
│   │       └── queries.ts           # getProfile(), getAllProfiles()
│   ├── types/database.ts            # Client, Visit, Appointment, Profile, ServiceType, AuditLog, FieldDefinition, Document
│   ├── next.config.ts               # ignoreBuildErrors: true (TypeScript errors don't block deploy)
│   └── proxy.ts                     # Next.js 16 proxy: session refresh + auth guard
│
├── backend/                         # FastAPI Python AI backend
│   ├── main.py                      # Endpoints + _ai_error_message() helper + test-prompt + invalidate-cache
│   ├── intelligence/
│   │   ├── llm.py                   # LLMClient: DB-first config, multi-provider fallback, 1.5s 429 back-off
│   │   ├── llm_router.py            # get_db_task_config(): DB-fetched LLM config with 5-min cache + variable injection
│   │   ├── llm_config.py            # Static fallback configs (used when Supabase is unreachable)
│   │   └── prompts.py               # System prompts for each AI task (static fallback)
│   ├── models.py                    # Pydantic request/response models
│   ├── requirements.txt
│   ├── render.yaml                  # Render deployment config (auto-detected)
│   ├── Dockerfile                   # Docker image for local/self-hosted backend
│   └── .env                         # GEMINI_API_KEY, GROQ_API_KEY, SAMBANOVA_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
│
├── supabase/
│   ├── migrations/                  # 14 migrations — apply in numbered order
│   ├── seed.sql                     # Default service types + starter custom fields (generic placeholders)
│   └── demo_seed.sql                # 12 clients, 32 visits, 16 appointments, 4 staff
│
├── docker-compose.yml               # Local backend (docker compose up)
├── vercel.json                      # Vercel one-click deploy config
├── .github/workflows/ci.yml         # CI: lint + type-check on every PR
├── .env.example
├── README.md
├── DEVELOPER_NOTES.md               # This file
└── functional_requirements.md
```

---

## What's Built

### Infrastructure
| Item | Status | Notes |
|------|--------|-------|
| Next.js 16 scaffold | ✅ | App Router, TypeScript, Tailwind CSS 4 |
| Supabase client helpers | ✅ | `lib/supabase/client.ts` + `server.ts` |
| TypeScript types | ✅ | `types/database.ts` |
| Auth proxy | ✅ | `proxy.ts` — redirects unauthenticated to `/login` |
| Database schema | ✅ | 12 migrations in `supabase/migrations/` |
| Demo seed data | ✅ | `supabase/demo_seed.sql` |
| GitHub Actions CI | ✅ | Lint + type-check on every PR |
| FastAPI AI backend | ✅ | `backend/` — deployed on Render |
| `next.config.ts` build flags | ✅ | `ignoreBuildErrors: true` — TS errors don't block Vercel deploy |

### P0: Auth + RBAC ✅ Complete
| Item | File(s) |
|------|---------|
| Email/password login + signup | `app/login/`, `app/signup/` |
| Google OAuth (PKCE) | `components/google-sign-in-button.tsx`, `app/auth/callback/route.ts` |
| Session guard | `proxy.ts` |
| Profile auto-creation trigger | `migrations/20260328000002_profile_trigger.sql` |
| Role-gated routes | `app/(app)/admin/layout.tsx` |
| Admin user management | `admin/users/` |
| Permissions helper | `lib/auth/permissions.ts` |
| Role escalation prevention | `migrations/20260328000005_fix_profiles_role_escalation.sql` |

**First admin bootstrap** (run once in Supabase SQL Editor after signup):
```sql
update public.profiles set role = 'admin' where id = '<your-user-uuid>';
```

**Auth callback URL** — must be set in Supabase for OAuth to work:
- Supabase → Authentication → URL Configuration
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/auth/callback`

### P0: Client Registration ✅ Complete
| Item | File(s) |
|------|---------|
| Client list — search, filter, sort | `clients/page.tsx` + `ClientsTable.tsx` |
| New client form + custom fields | `clients/new/ClientRegistrationForm.tsx` |
| **AI photo scan (English)** | `ClientRegistrationForm.tsx` → `POST /ai/photo-to-intake` |
| **AI photo scan (multilingual)** | `ClientRegistrationForm.tsx` → `POST /ai/multilingual-intake` |
| Create action + audit | `clients/new/actions.ts` |
| Edit demographics | `clients/[id]/edit/` |
| Deactivate/reactivate | `clients/[id]/actions.ts#setClientActive` |

### P0: Service/Visit Logging ✅ Complete
| Item | File(s) |
|------|---------|
| Log visit form | `services/visits/new/VisitLogForm.tsx` |
| **AI voice-to-note (live record)** | `VisitLogForm.tsx` → `MediaRecorder` → `POST /ai/voice-to-note` |
| **AI voice-to-note (file upload)** | `VisitLogForm.tsx` → file input → `POST /ai/voice-to-note` |
| Case notes rendered as Markdown | `ClientProfileTabs.tsx` → `react-markdown` |
| Create visit action + audit | `services/visits/new/actions.ts` |
| All visits list | `services/visits/page.tsx` |

### P0: Client Profile View ✅ Complete
4-tab view: **Overview** (demographics + custom fields + household) · **Case Notes** (visit timeline with Markdown rendering + expand/collapse) · **Documents** (upload/download) · **Appointments** (upcoming + past)

### P1: CSV Import/Export ✅ Complete
Papa Parse import with row-by-row audit log. Export selected rows or all to CSV.

### P1: Reporting Dashboard ✅ Complete
- Stat cards: active clients, visits this week/month, appointments today
- Visit trend **line chart** (8-week history, weekly buckets from `computeDashboardStats`)
- Service breakdown **pie chart**
- Quick actions: Record Visit, Add Client, New Appointment
- Today's appointments with cancel/reschedule

### P1: Scheduling/Calendar ✅ Complete
Week-view grid, appointment creation, cancel/reschedule from dashboard, status machine.

### P1: Configurable Fields ✅ Complete
Admin CRUD for custom fields (text/number/date/boolean/select/multiselect) scoped to `client` or `visit`. Values stored in JSONB.

### P1: Audit Log ✅ Complete
DB triggers + server action logging. PII-safe (field names only, never values). Admin-only viewer with filters.

### P2: AI Features ✅ Complete
| Feature | Endpoint | Status |
|---------|----------|--------|
| Photo-to-Intake | `POST /ai/photo-to-intake` | ✅ Wired in ClientRegistrationForm |
| Multilingual Intake | `POST /ai/multilingual-intake` | ✅ Wired in ClientRegistrationForm (language toggle) |
| Voice-to-Case Notes | `POST /ai/voice-to-note` | ✅ Wired in VisitLogForm (live record + file upload) |
| Client Handoff Summary | `POST /ai/client-summary` | ✅ Wired in ClientProfileTabs Overview tab |
| Funder Report | `POST /api/funder-report` | ✅ Wired in AdminReports |
| Semantic Search | `POST /api/semantic-search` | ✅ pgvector embeddings on visit save |

**AI model chain:**
```
Vision tasks (photo/multilingual intake):
  Gemini 3 Flash → Gemini 3 Flash Lite (fallback)

Voice-to-Note:
  Step 1 Transcription: Groq Whisper large-v3-turbo → Whisper large-v3
  Step 2 Structuring:   Groq Llama 3.3 70B → Gemini 3 Flash → SambaNova Llama 3.3 70B

Client Summary / Funder Report:
  Fetches data from Supabase → LLM generates structured Markdown narrative
```

**Dynamic AI Orchestrator:** All AI tasks are configurable from the Admin → AI Lab panel:
- Per-task model chain with priority-ordered fallbacks
- Kill-switch toggle per task
- Live test-prompt panel with raw response + model attribution
- `{{org_name}}` / `{{org_mission}}` variable injection in system prompts
- DB-fetched config with 5-min in-memory cache; static `llm_config.py` fallback if DB unreachable
- `TaskDisabledError` propagates to a friendly 503 message when all configs are disabled

**Error handling:** 1.5s back-off on 429 before trying next provider. User-facing errors are plain English, not stack traces.

### Database Setup

**For a fresh install:** run `supabase/schema.sql` — single file, all tables + RLS + triggers + seed data.

**Individual migrations** are preserved in `supabase/migrations/` for reference and for teams using the Supabase CLI (`supabase db push`). The cumulative history:

| # | File | Purpose |
|---|------|---------|
| 1 | `20260328000001_init.sql` | Full schema + RLS + 10 seeded service types |
| 2 | `20260328000002_profile_trigger.sql` | Auto-create profile on signup |
| 3 | `20260328000003_profiles_self_insert.sql` | Allow self-insert |
| 4 | `20260328000004_fix_profiles_rls_recursion.sql` | Fix `42P17` recursion |
| 5 | `20260328000005_fix_profiles_role_escalation.sql` | Prevent self-promotion |
| 6 | `20260328000006_audit_triggers.sql` | DB triggers on clients/visits/profiles |
| 7 | `20260328000007_appointments.sql` | Appointments table + RLS |
| 8 | `20260328000008_field_definitions.sql` | Configurable fields + 5 starter fields |
| 9 | `20260328000009_rename_read_only_to_viewer.sql` | Rename `read_only` → `viewer` |
| 9b | `20260328000009b_viewer_migrate_profiles.sql` | Migrate existing rows to new enum value |
| 10 | `20260328000010_programs_array.sql` | `programs text[]`, drop old `program text` |
| 11 | `20260329000001_visits_custom_fields.sql` | Add `custom_fields jsonb` to visits |
| 12 | `20260329000002_care_work_features.sql` | Additional care workflow fields |
| 13 | `20260407000001_org_settings.sql` | `org_settings` table — org identity, branding, setup wizard state |
| 14 | `20260407000002_ai_orchestrator.sql` | `ai_models`, `ai_tasks`, `ai_task_configs` tables — Dynamic AI Orchestrator |
| 14b | `20260408000002_reset_ai_tables.sql` | Repopulate AI tables with corrected display names/descriptions |

---

## What's NOT Built Yet (Recommended Next)

All P0, P1, and P2 features are complete. See **functional_requirements.md** for full FR details.

### Remaining / post-launch

| Feature | FR | Notes |
|---------|-----|-------|
| **Multi-tenancy (org_id)** | NFR | Add `org_id` to all tables + RLS policies. Required before this can serve multiple real nonprofits simultaneously without data bleed. |
| **Smart follow-up detection** | FR-AI-11/12 | Analyze case note on save → surface action items. Can run in `createVisit` action after insert. |
| **Appointment reminders** | FR-SCH-3 | Email or in-app. Supabase edge functions + cron, or Resend for email. |
| **FR-AI-17 label caching** | FR-AI-17 | Cache translated form labels for multilingual intake. |
| **Supabase CLI + migration management** | — | Currently requires manual SQL Editor steps. `supabase link` + `supabase db push` would streamline this. |
| **Appointment status auto-update** | — | Mark past `scheduled` appointments as `completed` via a Supabase cron function. |

---

## Deployment

### Frontend → Vercel
See README.md for full step-by-step. Key points:
- Root Directory must be set to `frontend` (enforced by `vercel.json`)
- After deploy, set `NEXT_PUBLIC_AI_API_URL` to the Render backend URL
- After deploy, add `https://your-app.vercel.app/auth/callback` to Supabase → Auth → Redirect URLs

### AI Backend → Render
`backend/render.yaml` is auto-detected. Set `GEMINI_API_KEY`, `GROQ_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` in the Render environment.

Health check: `GET /health` → `{"status": "ok"}`

Free tier cold-starts after 15 min idle (~30s delay). Upgrade to Starter ($7/mo) for always-on.

### AI Backend → Docker (local / self-hosted)
```bash
# From the project root
cp backend/.env backend/.env  # already populated? or fill in the values
docker compose up --build
```
Backend runs at `http://localhost:8000`. Set `NEXT_PUBLIC_AI_API_URL=http://localhost:8000` in `frontend/.env.local`.

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
```

### Custom fields
Form inputs use `cf_<field_name>` prefix (e.g. `cf_emergency_contact`).
Action strips `cf_` prefix and stores result in `custom_fields` JSONB.
Multi-select uses `formData.getAll('cf_fieldname')`.

### AI API calls (frontend)
All AI calls go from client component → `NEXT_PUBLIC_AI_API_URL` (backend). Always use `FormData` with a `file` field. Handle errors by reading `response.detail` from the JSON error body.

### Data fetching
- **Server Components:** `lib/supabase/server.ts`
- **Server Actions:** `lib/supabase/server.ts` — RLS applies automatically
- **Client Components (OAuth, document uploads):** `lib/supabase/client.ts`

### Important Next.js 16 gotchas
- **`proxy.ts` not `middleware.ts`** — export must be `export async function proxy(...)`
- **`searchParams` is a Promise** — always `await searchParams` before accessing properties
- **`useActionState` not `useFormState`** — React 19 renamed this hook

### Running checks locally
```bash
cd frontend
npm run lint          # ESLint
npm run type-check    # tsc --noEmit
npm run build         # Full production build (TypeScript errors skipped — see next.config.ts)
```

---

## Environment Variables

### Frontend (`frontend/.env.local`)
| Variable | Required | Where to find |
|----------|----------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase → Settings → API → anon/public |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase → Settings → API → service_role — **never commit** |
| `NEXT_PUBLIC_AI_API_URL` | No | Render backend URL (default: `http://localhost:8000`) |
| `NEXT_PUBLIC_ORG_NAME` | No | Org name shown in UI greeting |

### Backend (`backend/.env`)
| Variable | Required | Notes |
|----------|----------|-------|
| `GEMINI_API_KEY` | Yes | Google AI Studio — vision tasks |
| `GROQ_API_KEY` | Yes | Groq — Whisper + Llama |
| `SUPABASE_URL` | Yes | Supabase project URL — used by `llm_router.py` to fetch DB-stored AI configs |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key — bypasses RLS for AI config reads |
| `SAMBANOVA_API_KEY` | No | SambaNova — fallback for note structuring |
| `OPENROUTER_API_KEY` | No | OpenRouter — additional fallback |
