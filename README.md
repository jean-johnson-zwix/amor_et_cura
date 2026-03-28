# Amor et Cura
### *Case management built for nonprofits that care*

A lightweight, open-source client and case management web application that any nonprofit can deploy for under $30/month.

Built for the [ASU WiCS x OHack Hackathon](https://www.ohack.dev) — March 28–29, 2026, in partnership with [Chandler CARE Center](https://www.cusd80.com/carecenter).

---

## Problem

92% of nonprofits operate on budgets under $1M and manage clients using spreadsheets and paper forms. Enterprise solutions like Bonterra Apricot cost $50–150+/user/month. Across 7 OHack hackathons (2016–2024), 9+ nonprofits submitted the same core problem:

> "We need to register clients, record what we do for them, and report on it."

Amor et Cura solves that problem once, for everyone.

---

## Features

**P0 — Core (must ship)**
- Auth with role-based access (Admin / Case Worker / Read-Only)
- Client registration with searchable client list
- Service and visit logging per client
- Client profile view (demographics + visit history)
- Deployed with seed data and one-click deploy

**P1 — Demo-worthy**
- CSV import/export
- Reporting dashboard with charts
- Appointment scheduling and calendar view
- Configurable intake fields (no code changes)
- Audit log

**P2 — AI stretch**
- Photo-to-intake (snap a paper form → auto-fill registration)
- Semantic search across case notes
- AI client handoff summary
- Auto-generated funder reports
- Smart follow-up detection from case notes
- Voice-to-structured case notes
- Multilingual intake (English + Spanish)

---

## Tech Stack

- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js Server Actions + API Routes
- **Database, Auth & Storage:** Supabase (PostgreSQL + Auth + Storage)
- **Hosting:** Vercel

---

## Project Board

All work is tracked on the [ohack_dev GitHub Project board](https://github.com/users/jean-johnson-zwix/projects/3).

| Label | Meaning |
|-------|---------|
| `setup` | Pre-implementation decisions |
| `P0` | Must ship for a working demo |
| `P1` | Demo-worthy features |
| `P2` | AI stretch goals |

---

## Getting Started

**Prerequisites:** Node.js 20+, a Supabase account, a Vercel account.

```bash
# Clone the repo
git clone https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management.git
cd nonprofit_client_and_case_management

# Install dependencies
npm install

# Copy env template and fill in your Supabase credentials
cp .env.example .env.local

# Run locally
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Contributing

1. Pick an issue from the [project board](https://github.com/users/jean-johnson-zwix/projects/3)
2. Create a branch: `feature/short-description` or `fix/short-description`
3. Open a PR — CI will run lint and type-check automatically

See [functional_requirements.md](./functional_requirements.md) for full feature specs.

---

## Nonprofit Partners

Primary: [Chandler CARE Center](https://www.cusd80.com/carecenter) — school-based family resource center serving Chandler, AZ since 1995.

Generalizable to: NMTSA, Will2Walk, ICM Food & Clothing Bank, Sunshine Acres, Lost Our Home Pet Rescue, Tranquility Trail, Seed Spot.
