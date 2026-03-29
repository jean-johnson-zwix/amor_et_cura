# Amor et Cura
### *Case management built for nonprofits that care*

A lightweight, open-source client and case management web application that any nonprofit can deploy for under $20/month.

Built at [ASU WiCS x OHack Hackathon](https://www.ohack.dev) — March 28–29, 2026. Generalizable to any human-services nonprofit.

---

## Problem

92% of nonprofits operate on budgets under $1M and manage clients using spreadsheets and paper forms. Enterprise solutions like Bonterra Apricot cost $50–150+/user/month. Across 7 OHack hackathons (2016–2024), 9+ nonprofits submitted the same core problem:

> "We need to register clients, record what we do for them, and report on it."

Amor et Cura solves that problem once, for everyone.

---

## What's Built

**Core (P0) — all shipped**
- Auth with role-based access (Admin / Case Worker / Viewer)
- Client registration with custom fields, search, sort, filter, and CSV import/export
- Client profiles — 4-tab view: Overview, Case Notes timeline, Documents, Appointments
- Visit logging with case narrative, referral tracking, and custom fields
- Client profile editing, deactivate/reactivate
- Household member linking across client records

**Demo-worthy (P1) — all shipped**
- Reporting dashboard — stat cards, visit trend bar chart, service breakdown pie chart, quick actions
- Weekly appointment calendar with cancel/reschedule from dashboard
- Configurable intake fields via Admin UI (no code changes required)
- Document uploads and downloads via Supabase Storage
- Audit log with filters and pagination

**AI features (P2) — shipped**
- AI client handoff summary
- AI funder report generator
- Smart follow-up detection on dashboard
- Multilingual intake form (English / Spanish toggle)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Server Components, Server Actions) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS 4 |
| UI | shadcn/ui, Base UI, Lucide React icons |
| Charts | Recharts |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (email + Google SSO) |
| Storage | Supabase Storage (`client-documents` bucket) |
| Hosting | Vercel |
| CI | GitHub Actions (lint + type-check on every PR) |

---

## Getting Started

**Prerequisites:** Node.js 20+, a Supabase account, a Vercel account.

```bash
git clone https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management.git
cd nonprofit_client_and_case_management/frontend
npm install

# Copy env template and fill in Supabase credentials
cp ../.env.example .env.local

npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Bootstrap first admin** (run once in Supabase SQL Editor after signing up):
```sql
update public.profiles set role = 'admin' where id = '<your-user-uuid>';
```

> See [DEVELOPER_NOTES.md](./DEVELOPER_NOTES.md) for a full breakdown of what's built, conventions, and deployment steps.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-side only — never commit |
| `NEXT_PUBLIC_ORG_NAME` | No | Org name shown in UI (default: "our organization") |
| `ANTHROPIC_API_KEY` | No | Enables AI features |

---

## Project Board

All work is tracked on the [OHack GitHub Project board](https://github.com/users/jean-johnson-zwix/projects/3).

| Label | Meaning |
|---|---|
| `P0` | Must ship for a working demo |
| `P1` | Demo-worthy features |
| `P2` | AI stretch goals |

---

## Contributing

1. Pick an issue from the [project board](https://github.com/users/jean-johnson-zwix/projects/3)
2. Branch from `maitridev`: `feature/short-description` or `fix/short-description`
3. Open a PR targeting `main` — CI runs lint and type-check automatically

See [DEVELOPER_NOTES.md](./DEVELOPER_NOTES.md) for conventions and architecture details.

---

## Nonprofit Partners

Built to generalize the problems of: NMTSA, Chandler CARE Center, Will2Walk, ICM Food & Clothing Bank, Sunshine Acres, Lost Our Home Pet Rescue, Tranquility Trail, Seed Spot.
