# Amor et Cura
### *Case management built for nonprofits that care*

A lightweight, open-source client and case management platform any nonprofit can self-host for **under $30/month** — replacing spreadsheets and paper forms with a professional, AI-assisted system.

Built at [ASU WiCS × OHack Hackathon](https://www.ohack.dev) — March 28–29, 2026.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management&root=frontend&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,NEXT_PUBLIC_AI_API_URL,NEXT_PUBLIC_ORG_NAME&envDescription=See%20README%20for%20details&envLink=https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management%23environment-variables)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management)

---

## 15-Minute Setup Checklist

- [ ] **1 — Supabase** — Create a free project at [supabase.com](https://supabase.com). Copy your Project URL, anon key, and service_role key from **Settings → API**.
- [ ] **2 — Run migrations** — In the Supabase SQL Editor, paste and run [`supabase/schema.sql`](./supabase/schema.sql) (single file, all tables + seed data).
- [ ] **3 — Create your admin account** — Sign up at your Supabase Auth dashboard, then run: `update public.profiles set role = 'admin' where id = '<your-uuid>';`
- [ ] **4 — Deploy backend** — Click "Deploy to Render" above. Add `GEMINI_API_KEY` and `GROQ_API_KEY` in the Environment section. Note your service URL (e.g. `https://amor-et-cura-backend.onrender.com`).
- [ ] **5 — Deploy frontend** — Click "Deploy with Vercel" above. Fill in the 5 environment variables (Supabase keys + your Render URL). Click Deploy.
- [ ] **6 — Configure your org** — Sign in as admin and complete the 5-step setup wizard at `/setup` (name, branding, services, intake fields, AI settings).

---

## The Problem

92% of nonprofits operate on budgets under $1M and track clients in spreadsheets and paper intake forms. Enterprise solutions (Bonterra Apricot, Salesforce NPSP) cost $50–150+/user/month. Across 7 OHack hackathons (2016–2024), 9+ nonprofits submitted the same core need:

> "We need to register clients, record what we do for them, and report on it."

**Amor et Cura** solves that once — for everyone.

---

## Live Demo

| Service | URL |
|---------|-----|
| Frontend | https://amor-et-cura.vercel.app |
| AI Backend | https://amor-et-cura-backend.onrender.com/health |

**Demo credentials:** `demo@amorsetcura.org` / `Demo1234!`

### Demo Walkthrough

Follow these steps to showcase the full platform in ~10 minutes:

#### 1 — Admin Setup (2 min)
1. Log in as admin (`demo@amorsetcura.org` / `Demo1234!`)
2. Navigate to **Admin → Settings** to show the org setup wizard results: custom branding colors, service types, intake field configuration
3. Open **Admin → Settings → AI Lab** to show the AI orchestrator: per-task model chains, kill-switch toggles, and the live test-prompt panel

#### 2 — Client Registration with AI Photo Scan (2 min)
1. Go to **Clients → Register New Client**
2. Click **"Scan a paper form"** and upload any photo (the `media/` folder has a sample intake form)
3. Watch the AI extract fields into the form — review and confirm
4. Submit to create the client

#### 3 — Log a Visit with AI Voice Notes (2 min)
1. Open the newly created client's profile
2. Go to **Case Notes → Log a Visit**
3. Click the microphone icon and record a short verbal description of the visit
4. Watch Whisper transcribe and Llama 3.3 structure the note into a clinical Markdown format
5. Submit the visit

#### 4 — Client Handoff Summary (1 min)
1. Still on the client profile, click **"Generate Summary"** in the Overview tab
2. The AI pulls all case history and generates a structured handoff document (background, needs, risk factors, next steps)

#### 5 — Funder Report (1 min)
1. Go to **Admin → Reports**
2. Select a date range and program filter
3. Click **"Generate AI Report"** — the AI drafts a grant-ready narrative combining real service stats with prose

#### 6 — Admin Audit Trail (30 sec)
1. Go to **Admin → Audit Log**
2. Filter by actor or event type — show every create/update/delete with full attribution

---

## What's Shipped

### Core (P0) — all complete

- **Auth & RBAC** — Email/password + Google OAuth, three roles: Admin / Case Worker / Viewer
- **Client registration** — Custom intake fields, search, sort, filter, CSV import/export, household linking, auto-generated client IDs (`CLT-00042`)
- **Client profiles** — 4-tab view: Overview · Case Notes timeline · Documents · Appointments
- **Visit logging** — Case narrative, service type, referral tracking, duration, custom fields
- **Appointment calendar** — Week-view, create/cancel/reschedule from dashboard
- **Audit trail** — Every create/update/delete logged with actor + changed fields; PII-safe (field names only, never values)

### Demo-worthy (P1) — all complete

- **Reporting dashboard** — Stat cards, visit trend line chart (8-week history), service breakdown pie chart, quick-action buttons, today's appointments
- **Configurable intake fields** — Admins define custom fields (text / number / date / boolean / select / multiselect) for clients and visits via UI — no code deploys needed
- **Document storage** — Upload/download files (up to 50 MB) attached to client profiles
- **Admin console** — User role management, service type editor, audit log viewer

### AI features (P2) — complete

| Feature | Endpoint | How it works |
|---------|----------|-------------|
| **Photo-to-Intake** | `POST /ai/photo-to-intake` | Photograph a paper form → AI extracts fields → pre-fills registration form for staff review |
| **Voice-to-Case Notes** | `POST /ai/voice-to-note` | Record verbal notes → Whisper transcribes → Llama 3.3 structures into a clinical Markdown note |
| **Multilingual Intake** | `POST /ai/multilingual-intake` | Any-language form photo → AI detects language + extracts + translates fields to English |
| **Semantic Search** | `POST /api/semantic-search` | Natural language query across all case notes — ranked by meaning via `pgvector` embeddings |
| **Client Handoff Summary** | `POST /ai/client-summary` | Generate a structured case summary (background, needs, risk factors, next steps) from any client profile |
| **Funder Report** | `POST /api/funder-report` | Select a date range → AI generates a grant-ready narrative report combining service stats + prose |

All AI processing is **in-memory only** — no uploaded files are ever written to disk.

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

14 migrations in [`supabase/migrations/`](./supabase/migrations/) applied in order:

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

## Getting Started

**Prerequisites:** Node.js 20+, Supabase account, Render account (AI features only).

### 1 — Clone and install

```bash
git clone https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management.git
cd nonprofit_client_and_case_management/frontend
npm install
```

### 2 — Configure environment

```bash
cp ../.env.example .env.local
```

Fill in your Supabase credentials (see [Environment Variables](#environment-variables) below).

### 3 — Apply the database schema

In the Supabase SQL Editor, paste and run [`supabase/schema.sql`](./supabase/schema.sql) — this single file creates all tables, RLS policies, triggers, and seeds default service types, custom fields, and AI model configurations.

Optionally run [`supabase/seed.sql`](./supabase/seed.sql) to load 12 demo clients with visit history.

### 4 — Bootstrap first admin

```sql
-- Run once in Supabase SQL Editor after your first sign-up
update public.profiles set role = 'admin' where id = '<your-user-uuid>';
```

### 5 — Start the frontend

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6 — Start the AI backend (optional)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # add GEMINI_API_KEY and GROQ_API_KEY
uvicorn main:app --reload
```

Backend runs at [http://localhost:8000](http://localhost:8000). Set `NEXT_PUBLIC_AI_API_URL=http://localhost:8000` in the frontend `.env.local`.

---

## Environment Variables

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-side only — never expose publicly |
| `NEXT_PUBLIC_AI_API_URL` | No | AI backend URL (default: `http://localhost:8000`) |
| `NEXT_PUBLIC_ORG_NAME` | No | Org name shown in the UI (default: `"our organization"`) |

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google AI Studio key — photo and multilingual intake |
| `GROQ_API_KEY` | Yes | Groq key — Whisper transcription + Llama note structuring |
| `SAMBANOVA_API_KEY` | No | SambaNova key — fallback for note structuring |
| `OPENROUTER_API_KEY` | No | OpenRouter key — additional fallback |

---

## Deployment

### Frontend → Vercel

**Before you start:** Make sure your code is pushed to GitHub and you have a [Vercel account](https://vercel.com).

#### Step 1 — Import the repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Add GitHub account"** if prompted, then select the `nonprofit_client_and_case_management` repo
3. On the **Configure Project** screen:
   - **Framework Preset:** Next.js *(auto-detected)*
   - **Root Directory:** `frontend`
   - Leave Build Command and Output Directory as defaults

#### Step 2 — Add environment variables

Still on the Configure Project screen, expand **Environment Variables** and add all five:

| Name | Value | Notes |
|------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Supabase → Settings → API → anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Supabase → Settings → API → service_role key — **never expose this publicly** |
| `NEXT_PUBLIC_AI_API_URL` | `https://amor-et-cura-backend.onrender.com` | Your Render backend URL (deploy backend first, then come back and update this) |
| `NEXT_PUBLIC_ORG_NAME` | `Your Nonprofit Name` | Optional — appears in the UI greeting |

#### Step 3 — Deploy

Click **Deploy**. Vercel builds and deploys in ~2 minutes. Your app will be live at `https://your-project.vercel.app`.

#### Step 4 — Verify

Open the deployed URL and confirm you reach the login page. Try signing up — you should receive a Supabase confirmation email.

#### Redeployments

Every push to `main` triggers an automatic redeploy. To update environment variables later: **Vercel Dashboard → Project → Settings → Environment Variables**, then go to **Deployments → Redeploy** to apply them.

---

### AI Backend → Render

**Before you start:** Make sure your code is pushed to GitHub and you have a [Render account](https://render.com). Get a free API key from [Google AI Studio](https://aistudio.google.com/apikey) (Gemini) and [Groq Console](https://console.groq.com/keys) (Groq).

#### Step 1 — Create a new Web Service

1. Go to [dashboard.render.com](https://dashboard.render.com) → **New → Web Service**
2. Connect your GitHub account if not already connected, then select the `nonprofit_client_and_case_management` repo

#### Step 2 — Configure the service

Render will detect [`backend/render.yaml`](./backend/render.yaml) automatically. Confirm these settings match (or fill them in manually):

| Setting | Value |
|---------|-------|
| **Name** | `amor-et-cura-backend` |
| **Region** | Oregon (or closest to you) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | Python |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Plan** | Free |

#### Step 3 — Add environment variables

In the **Environment** section of the service config, add:

| Key | Value | Notes |
|-----|-------|-------|
| `GEMINI_API_KEY` | `AIza...` | Required — [Get from Google AI Studio](https://aistudio.google.com/apikey) |
| `GROQ_API_KEY` | `gsk_...` | Required — [Get from Groq Console](https://console.groq.com/keys) |
| `SAMBANOVA_API_KEY` | `...` | Optional fallback — [Get from SambaNova Cloud](https://cloud.sambanova.ai) |

#### Step 4 — Deploy

Click **Create Web Service**. Render pulls the repo, runs `pip install`, and starts the server. First deploy takes ~3 minutes.

#### Step 5 — Verify

Once the service shows **Live**, open:
```
https://amor-et-cura-backend.onrender.com/health
```
You should get: `{"status": "ok", "service": "amor-et-cura-backend"}`

#### Step 6 — Wire the backend URL into Vercel

Go back to your Vercel project → **Settings → Environment Variables** → update `NEXT_PUBLIC_AI_API_URL` to your Render URL:
```
https://amor-et-cura-backend.onrender.com
```
Then trigger a redeploy from **Deployments → ⋯ → Redeploy**.

#### Free tier note

Render's free tier spins down services after 15 minutes of inactivity. The first AI request after idle will take ~30 seconds to cold-start. For demo purposes this is fine; for production upgrade to the **Starter plan ($7/mo)** which keeps the service always-on.

---

## Page Structure

```
/dashboard                  Reporting dashboard — stats, trend chart, appointments
/clients                    Client list — search, filter, sort, CSV export
/clients/new                Register a new client (with AI photo scan option)
/clients/import             Bulk CSV import
/clients/[id]               Client profile — Overview · Case Notes · Documents · Appointments
/clients/[id]/edit          Edit client demographics
/services/visits            All visits table
/services/visits/new        Log a visit (with AI voice-to-note — record or upload)
/services/schedule          Weekly appointment calendar
/services/schedule/new      Book an appointment
/admin                      Admin overview
/admin/users                Manage staff roles
/admin/settings             Configure service types and custom fields
/admin/audit-log            View audit trail
/admin/reports              Generate AI funder reports (date range + program filter)
/login                      Sign in
/signup                     Create account
```

---

## Cost Estimate

| Service | Free tier | Cost at scale |
|---------|-----------|--------------|
| Vercel (frontend) | 100 GB bandwidth/mo | ~$0 for most nonprofits |
| Supabase (database + auth + storage) | 500 MB DB, 1 GB storage | ~$25/mo for Pro |
| Render (AI backend) | 750 hrs/mo | ~$7/mo for Starter |
| Gemini API | 1,500 requests/day free | Pay-as-you-go after |
| Groq API | Generous free tier | Pay-as-you-go after |

**Estimated monthly cost — no AI usage:** ~$0
**Estimated monthly cost — moderate AI usage:** ~$5–30

---

## Nonprofit Partners

Built to generalize the shared case management needs of:
**NMTSA · Chandler CARE Center · Will2Walk · ICM Food & Clothing Bank · Sunshine Acres · Lost Our Home Pet Rescue · Tranquility Trail · Seed Spot**

---

## Contributing

1. Pick an issue from the [project board](https://github.com/users/jean-johnson-zwix/projects/3)
2. Branch from `main`: `feature/short-description` or `fix/short-description`
3. Open a PR — CI runs lint and type-check automatically

See [DEVELOPER_NOTES.md](./DEVELOPER_NOTES.md) for architecture details, conventions, and a full breakdown of every feature.

---

## License

MIT — free to use, adapt, and deploy for any nonprofit.
