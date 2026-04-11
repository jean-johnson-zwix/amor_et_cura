# Amor et Cura
### *Case management built for nonprofits that care*

A lightweight, open-source client and case management platform any nonprofit can self-host for **under $30/month** — replacing spreadsheets and paper forms with a professional, AI-assisted system.

Built at [ASU WiCS × OHack Hackathon](https://www.ohack.dev) — March 28–29, 2026.

---

## Setup Checklist

- [ ] **1 — Supabase** — Create a free project at [supabase.com](https://supabase.com). Copy your Project URL, anon key, and service_role key from **Settings → API**.
- [ ] **2 — Run migrations** — In the Supabase SQL Editor, paste and run [`supabase/schema.sql`](./supabase/schema.sql) (single file, all tables + seed data).
- [ ] **3 — Create your admin account** — Sign up at your Supabase Auth dashboard, then run: `update public.profiles set role = 'admin' where id = '<your-uuid>';`
- [ ] **4 — Deploy backend** — Add `GEMINI_API_KEY` and `GROQ_API_KEY` in the Environment section and [Deploy to Render](https://render.com/deploy?repo=https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management)

- [ ] **5 — Deploy frontend** — Fill in the 5 environment variables (Supabase keys + your Render URL) and [Deploy with Vercel](https://vercel.com/new/clone?repository-url=https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management&root=frontend&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,NEXT_PUBLIC_AI_API_URL,NEXT_PUBLIC_ORG_NAME&envDescription=See%20README%20for%20details&envLink=https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management%23environment-variables)
- [ ] **6 — Configure your org** — Sign in as admin and complete the 5-step setup wizard at `/setup` (name, branding, services, intake fields, AI settings).
---

## What's Shipped

### Core (P0) features
- **Auth & RBAC** — Email/password + Google OAuth, three roles: Admin / Case Worker / Viewer
- **Client registration** — Custom intake fields, search, sort, filter, CSV import/export, household linking, auto-generated client IDs (`CLT-00042`)
- **Client profiles** — 4-tab view: Overview · Case Notes timeline · Documents · Appointments
- **Visit logging** — Case narrative, service type, referral tracking, duration, custom fields
- **Appointment calendar** — Week-view, create/cancel/reschedule from dashboard
- **Audit trail** — Every create/update/delete logged with actor + changed fields; PII-safe (field names only, never values)

### P1 features
- **Reporting dashboard** — Stat cards, visit trend line chart (8-week history), service breakdown pie chart, quick-action buttons, today's appointments
- **Configurable intake fields** — Admins define custom fields (text / number / date / boolean / select / multiselect) for clients and visits via UI — no code deploys needed
- **Document storage** — Upload/download files (up to 50 MB) attached to client profiles
- **Admin console** — User role management, service type editor, audit log viewer

### P2 Features
| Feature | Endpoint | How it works |
|---------|----------|-------------|
| **Photo-to-Intake** | `POST /ai/photo-to-intake` | Photograph a paper form → AI extracts fields → pre-fills registration form for staff review |
| **Voice-to-Case Notes** | `POST /ai/voice-to-note` | Record verbal notes → Whisper transcribes → Llama 3.3 structures into a clinical Markdown note |
| **Multilingual Intake** | `POST /ai/multilingual-intake` | Any-language form photo → AI detects language + extracts + translates fields to English |
| **Semantic Search** | `POST /api/semantic-search` | Natural language query across all case notes — ranked by meaning via `pgvector` embeddings |
| **Client Handoff Summary** | `POST /ai/client-summary` | Generate a structured case summary (background, needs, risk factors, next steps) from any client profile |
| **Funder Report** | `POST /api/funder-report` | Select a date range → AI generates a grant-ready narrative report combining service stats + prose |

### Print / Download
- **Print Client Profile** — Print or export any client's full profile (demographics, case notes, appointments) to PDF directly from their profile page.

---

## AI Architecture

```
Photo-to-Intake / Multilingual Intake
  Gemini 3 Flash (vision) → Gemini 3 Flash Lite (fallback)

Voice-to-Case Notes
  Step 1 — Transcription:  Groq Whisper large-v3-turbo → Whisper large-v3 (fallback)
  Step 2 — Structuring:    Groq Llama 3.3 70B → Gemini 3 Flash → SambaNova Llama 3.3 70B

Semantic Search
  Embedding generation (on visit save) → pgvector similarity query

Client Handoff Summary / Funder Reports
  Backend fetches data from Supabase → LLM generates structured Markdown narrative
```

- **Graceful degradation** — 1.5 s back-off between 429 retries before trying the next provider
- **User-friendly errors** — rate limits, config issues, and service outages surface as plain-language guidance to caseworkers ("Wait 30 seconds and try again" vs. a raw stack trace)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router, Server Components, Server Actions) |
| **Language** | TypeScript — strict mode throughout |
| **Styling** | Tailwind CSS 4 |
| **UI / Icons** | Base UI, Lucide React |
| **Charts** | Recharts (line chart + pie chart) |
| **Markdown rendering** | react-markdown (AI case notes displayed formatted) |
| **CSV** | PapaParse (client-side import/export) |
| **Database** | Supabase — PostgreSQL + Row Level Security |
| **Auth** | Supabase Auth — email/password + Google OAuth (PKCE) |
| **File storage** | Supabase Storage (`client-documents` bucket) |
| **AI backend** | FastAPI + Python, deployed on Render |
| **AI models** | Gemini 3 Flash, Groq Whisper, Groq Llama 3.3 70B, SambaNova Llama 3.3 70B |
| **Frontend hosting** | Vercel |
| **CI** | GitHub Actions — lint + `tsc --noEmit` on every PR |

---

## Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | Extends `auth.users` — stores `full_name`, `role` |
| `clients` | Client demographics, programs array, custom fields (JSONB), household link |
| `visits` | Visit records — date, duration, case notes, referral, custom fields |
| `appointments` | Scheduled sessions with status (`scheduled` / `completed` / `cancelled`) |
| `service_types` | Admin-managed lookup — 10 defaults seeded |
| `field_definitions` | Custom field schema (applies to `client` or `visit`) |
| `documents` | Metadata for files stored in Supabase Storage |
| `audit_log` | PII-safe event log — actor, action, table, record ID, changed field names |
| `visit_embeddings` | `pgvector` embeddings for semantic search across case notes |
| `client_summaries` | Cached AI-generated client handoff summaries |

RLS policies on every table. Audit triggers fire automatically on INSERT / UPDATE / DELETE.

---

## License

MIT — free to use, adapt, and deploy for any nonprofit.
