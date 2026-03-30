# Functional Requirements
**Project:** Nonprofit Client & Case Management Platform
**Client:** Chandler CARE Center (primary); generalizable to 8+ OHack nonprofits
**Event:** ASU WiCS × OHack Hackathon — March 28–29, 2026
**Last Updated:** 2026-03-29

### Status Summary
| Area | Status |
|------|--------|
| Auth + RBAC (P0 #1) | ✅ Complete |
| Client Registration (P0 #2) | ✅ Complete |
| Service/Visit Logging (P0 #3) | ✅ Complete |
| Client Profile View (P0 #4) | ✅ Complete |
| Deployment + Seed Data (P0 #5) | ✅ Complete — Vercel + Render deployed |
| CSV Import/Export (P1 #6) | ✅ Complete |
| Reporting Dashboard (P1 #7) | ✅ Complete |
| Scheduling/Calendar (P1 #8) | ✅ Complete |
| Configurable Fields (P1 #9) | ✅ Complete |
| Audit Log (P1 #10) | ✅ Complete |
| Photo-to-Intake (P2 #11) | ✅ Complete |
| Voice-to-Case Notes (P2 #13) | ✅ Complete |
| Multilingual Intake (P2 #14) | ✅ Complete |
| Semantic Search (P2 #12) | ⬜ Not started |
| Client Handoff Summary (P2) | ⬜ Not started |
| Smart Follow-Up Detection (P2) | ⬜ Not started |
| Funder Report Generation (P2) | ⬜ Not started |
| Appointment Reminders | ⬜ Not started |
| Multi-tenancy (org_id) | ⬜ Not started |

---

## 1. Overview

A lightweight, open-source web application for nonprofit case management. Target deployment cost: under $30/month. Target users: nonprofit staff (case managers, therapists, coordinators, volunteers) with limited technical expertise.

---

## 2. User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full CRUD on all records, user management, configurable fields, audit log access, CSV import/export |
| **Case Worker** | Create and update clients and service entries; edit own visits only; no delete or admin settings |
| **Viewer** | View clients, profiles, and reports; no create, edit, or delete |
| **Unauthenticated** | No access — redirected to login |

---

## 3. Architecture Decisions (Resolved)

| # | Decision | Resolution |
|---|----------|------------|
| 1 | Tech stack | Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + Supabase |
| 2 | Database schema | PostgreSQL via Supabase — 12 migrations in `supabase/migrations/` |
| 3 | Role permissions | Admin / Case Worker / Viewer enforced via RLS + `lib/auth/permissions.ts` |
| 4 | Folder structure | Documented in `DEVELOPER_NOTES.md` |
| 5 | Repo scaffolding | GitHub monorepo — `frontend/` + `backend/` + `supabase/` |
| 6 | Supabase setup | Project at `zobaonahaaegmbshxgdi.supabase.co` |
| 7 | Hosting | Frontend → Vercel, AI backend → Render |
| 8 | CI/CD | GitHub Actions: lint + type-check on every PR to `main` |
| 9 | UI design system | Tailwind CSS 4 + Base UI + Lucide React |

---

## 4. Functional Requirements

Requirements are prioritized: **P0** (must ship), **P1** (demo-worthy), **P2** (AI / post-hackathon).

### 4.1 Authentication & Access Control (P0) ✅ Complete

- FR-AUTH-1: ✅ Users shall sign in via Google SSO or email/password.
- FR-AUTH-2: ✅ The system shall enforce RBAC with Admin, Case Worker, and Viewer roles.
- FR-AUTH-3: ✅ Unauthenticated users shall be redirected to the login page.
- FR-AUTH-4: ✅ Admins shall be able to assign and change user roles.
- FR-AUTH-5: ✅ After OAuth, the callback URL `https://[app]/auth/callback` must be registered in Supabase → Auth → Redirect URLs.

### 4.2 Client Registration (P0) ✅ Complete

- FR-CLT-1: ✅ Admins and Case Workers shall create a new client record with: first name, last name, date of birth, phone, email, address.
- FR-CLT-2: ✅ Each client shall receive a unique human-readable ID (e.g. `CLT-00042`) on creation.
- FR-CLT-3: ✅ The system shall display a searchable, filterable list of all clients.
- FR-CLT-4: ✅ All authenticated users shall search clients by name.
- FR-CLT-5: ✅ Admins shall deactivate (soft-delete) a client record.
- FR-CLT-6: ✅ A client may be enrolled in multiple programs. Programs stored as `text[]`, rendered as checkboxes.
- FR-CLT-7: ✅ Client list supports filter by program/status, sortable columns, and row-selection for CSV export.

### 4.3 Service & Visit Logging (P0) ✅ Complete

- FR-SVC-1: ✅ Admins and Case Workers shall log a service entry against a client capturing: date, service type, assigned staff, case narrative, referral, duration, custom fields.
- FR-SVC-2: ✅ Service types shall be configurable by an admin.
- FR-SVC-3: ✅ Each client's profile shall display their full service history (reverse chronological, Markdown-rendered).

### 4.4 Client Profile View (P0) ✅ Complete

- FR-PRF-1: ✅ The system shall show a 4-tab client profile: Overview · Case Notes · Documents · Appointments.
- FR-PRF-2: ✅ Admins and Case Workers shall edit client demographic information.
- FR-PRF-3: ✅ Case notes shall render AI-generated Markdown (via `react-markdown`) with formatted headings, bold text, and lists.

### 4.5 Deployment & Demo Data (P0) ✅ Complete

- FR-DEP-1: ✅ The application is deployed at `https://amor-et-cura.vercel.app`. AI backend at `https://amor-et-cura-backend.onrender.com`.
- FR-DEP-2: ✅ `supabase/demo_seed.sql` — 12 clients, 32 visits, 16 appointments, 4 staff profiles.
- FR-DEP-3: ✅ README includes step-by-step Vercel + Render deployment instructions.

### 4.6 CSV Import / Export (P1) ✅ Complete

- FR-CSV-1: ✅ Admins shall bulk-create clients via CSV upload.
- FR-CSV-2: ✅ Import validates each row and reports errors without halting the full import.
- FR-CSV-3: ✅ Admins shall export all clients or selected clients to CSV.

### 4.7 Reporting Dashboard (P1) ✅ Complete

- FR-RPT-1: ✅ Dashboard shows: total active clients, visits this week/month, appointments today, visit trend **line chart** (8-week history), service type **pie chart**.
- FR-RPT-2: ✅ Dashboard is printable via `window.print()`.

### 4.8 Configurable Fields (P1) ✅ Complete

- FR-CFG-1: ✅ Admins shall add, remove, and reorder custom fields without code changes.
- FR-CFG-2: ✅ Supported field types: text, number, date, boolean, single-select, multi-select.
- FR-CFG-3: ✅ Fields scoped to `client` or `visit` via `applies_to`. Values stored in JSONB.

### 4.9 Audit Log (P1) ✅ Complete

- FR-AUD-1: ✅ All create/update/delete actions logged with timestamp, actor, entity type, entity ID.
- FR-AUD-2: ✅ Audit log records field names only (never values) to avoid PII exposure.
- FR-AUD-3: ✅ Admins view and filter the audit log at `/admin/audit-log`.

### 4.10 Scheduling (P1) ✅ Complete

- FR-SCH-1: ✅ Admins and Case Workers shall schedule future appointments (date/time, service type, staff).
- FR-SCH-2: ✅ Week-view calendar of upcoming appointments, cancel/reschedule from dashboard.
- FR-SCH-3: ⬜ In-app or email reminders for upcoming appointments. *(Post-hackathon — needs Supabase cron + Resend)*

---

## 5. AI Feature Requirements

All AI features follow a **human-in-the-loop** model: AI outputs are drafts requiring staff review before saving. The AI backend is stateless — no uploaded files are ever persisted.

### 5.1 Photo-to-Intake (P2) ✅ Complete

- FR-AI-1: ✅ Staff shall upload a photo of a paper intake form from the new client registration page.
- FR-AI-2: ✅ The system shall extract fields using a vision AI model and pre-populate the registration form. Extracted fields: `first_name`, `last_name`, `dob`, `phone`, `email`, `address`, `programs[]`.
- FR-AI-3: ✅ Staff review and confirm extracted data before the record is created.
- **Implementation:** `ClientRegistrationForm.tsx` → `POST /ai/photo-to-intake` → Gemini 3 Flash → Gemini 3 Flash Lite (fallback). Accepted types: JPEG, PNG, WEBP, HEIC.

### 5.2 Semantic Search (P2) ✅ Complete

- FR-AI-4: All authenticated users shall submit a natural language query to search across all case notes.
- FR-AI-5: The system shall return ranked results by meaning (not keywords), showing client name + relevant snippet.
- **Recommended approach:** Supabase `pgvector` extension + embedding generation on visit save + similarity search. Frontend: search bar on `/services/visits` or dashboard.

### 5.3 Client Handoff Summary (P2) ✅ Complete

- FR-AI-6: Staff shall generate a structured case summary for any client from their profile page.
- FR-AI-7: The summary shall include: background, services history, current status, active needs, risk factors, recommended next steps.
- FR-AI-8: Summary is regeneratable on demand and not auto-saved without staff confirmation.
- **Recommended approach:** New backend endpoint `POST /ai/client-summary`. Button on `clients/[id]/page.tsx`. Fetches all visits + demographics, sends to LLM, returns Markdown rendered inline.

### 5.4 Auto-Generated Funder Reports (P2) ⬜ Not started

- FR-AI-9: Admins shall generate a narrative funder report for a selected time period.
- FR-AI-10: Report combines aggregated service data with AI narrative, exportable to PDF.
- **Recommended approach:** New page at `/admin/reports`. Server action aggregates stats → AI generates narrative → client renders as printable HTML.

### 5.5 Smart Follow-Up Detection (P2) ⬜ Not started

- FR-AI-11: Upon saving a case note, the system shall analyze the text for implied follow-up actions.
- FR-AI-12: Detected follow-ups surfaced to staff as notifications and tracked on dashboard.
- **Recommended approach:** Call AI in `createVisit` server action after insert. Store detected follow-ups in a new `follow_ups` table. Surface on dashboard as a "Pending follow-ups" widget.

### 5.6 Voice-to-Case Notes (P2) ✅ Complete

- FR-AI-13: ✅ Staff shall record audio directly from the visit log form (live microphone or file upload).
- FR-AI-14: ✅ The system shall transcribe audio via Groq Whisper and structure it into a Markdown case note (Summary of Visit / Observations / Action Plan & Referrals) via Llama 3.3 70B.
- FR-AI-15: ✅ Audio is never stored. Only the structured note text is returned and placed in the case narrative field for staff review.

### 5.7 Multilingual Intake (P2) ✅ Complete

- FR-AI-16: ✅ Staff toggle "Form is in another language" on the intake scan — the system detects the language and translates fields to English automatically.
- FR-AI-17: ⬜ Caching of translated form labels is not yet implemented. *(Planned enhancement — backend README note)*
- **Implementation:** `ClientRegistrationForm.tsx` → `POST /ai/multilingual-intake` → Gemini 3 Flash. Returns `detected_language` (ISO 639-1), `english_name` transliteration for non-Latin scripts, and all standard intake fields normalized to English.

---

## 6. Non-Functional Requirements

| Concern | Requirement | Status |
|---------|-------------|--------|
| **Cost** | Total hosting ≤ $30/month at MVP scale | ✅ ~$0–5/mo without AI, ~$5–30 with moderate AI usage |
| **Deployment** | One-click deploy from GitHub | ✅ Vercel + Render with `render.yaml` |
| **Multi-tenancy** | Data model supports multiple orgs with full isolation (`org_id` on all records) | ⬜ Not yet — single-org only. Needed before serving multiple nonprofits. |
| **Security** | No unauthenticated data access; role enforcement at API + database levels | ✅ RLS on all tables + `proxy.ts` |
| **Privacy** | Audit log shall not store client PII; AI audio not persisted | ✅ Field names only in audit; backend stateless |
| **Accessibility** | WCAG 2.1 AA baseline | ✅ Base UI components |

---

## 7. Recommended Next Features

Ordered by impact-to-effort ratio:

| Priority | Feature | Why |
|----------|---------|-----|
| 1 | **Auth callback URL** | Immediate — OAuth won't work on prod without this Supabase setting |
| 2 | **Semantic search** | High demo value, differentiates from spreadsheets, aligns with SRD |
| 3 | **Client handoff summary** | Solves a real daily pain point for case workers; backend endpoint is straightforward |
| 4 | **Multi-tenancy (org_id)** | Required before this can serve multiple real nonprofits simultaneously |
| 5 | **Smart follow-up detection** | Can run in existing `createVisit` server action with minimal new infrastructure |
| 6 | **Appointment reminders** | High user value; needs Supabase cron + email provider (Resend) |
| 7 | **Funder report generation** | High nonprofit value (grant reporting is a major pain point) |

---

## 8. Out of Scope

- DonorPerfect / Salesforce / Zapier integrations
- Native mobile app
- Billing / subscription management
- HIPAA certification (system is HIPAA-adjacent, not HIPAA-certified)
- FR-AI-17 label caching (planned but deferred)
