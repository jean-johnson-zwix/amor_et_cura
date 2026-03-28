# Functional Requirements
**Project:** Nonprofit Client & Case Management Platform
**Client:** Chandler CARE Center (primary); generalizable to 8+ OHack nonprofits
**Event:** ASU WiCS Hackathon — March 28–29, 2026
**Last Updated:** 2026-03-28
**Auth (P0 #1):** ✅ Complete — see DEVELOPER_NOTES.md for implementation details.

---

## 1. Overview

A lightweight, open-source web application for nonprofit case management. Target deployment cost: under $30/month. Target users: nonprofit staff (case managers, therapists, coordinators, volunteers) with limited technical expertise.

---

## 2. User Roles

| Role | Permissions |
|---|---|
| **Admin** | Full CRUD on all records, user management, configurable fields, audit log access, CSV import/export |
| **Case Worker** | Create and update clients and service entries; edit own visits only; no delete or admin settings |
| **Read-Only** | View clients, profiles, and reports; no create, edit, or delete |
| **Unauthenticated** | No access — redirected to login |

> Role permissions are detailed in [issue #20](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/20). Final matrix to be confirmed before implementation.

---

## 3. Pre-Implementation Decisions

The following architectural decisions must be resolved before feature development begins. Each is tracked as a GitHub issue.

| # | Decision | Issue |
|---|----------|-------|
| 1 | Tech stack | [#18](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/18) |
| 2 | Database schema / ERD | [#19](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/19) |
| 3 | Role permissions matrix | [#20](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/20) |
| 4 | Folder structure and code conventions | [#21](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/21) |
| 5 | Repo scaffolding and tooling | [#22](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/22) |
| 6 | Supabase project setup | [#23](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/23) |
| 7 | Hosting and deployment | [#24](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/24) |
| 8 | CI/CD pipeline | [#25](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/25) |
| 9 | UI design system and wireframes | [#26](https://github.com/jean-johnson-zwix/nonprofit_client_and_case_management/issues/26) |

---

## 4. Functional Requirements

Requirements are prioritized: **P0** (must ship), **P1** (demo-worthy), **P2** (post-hackathon).

### 4.1 Authentication & Access Control (P0) ✅ Complete

- FR-AUTH-1: ✅ Users shall be able to sign in via Google SSO or email/password.
- FR-AUTH-2: ✅ The system shall enforce role-based access control with Admin, Case Worker, and Read-Only roles.
- FR-AUTH-3: ✅ Unauthenticated users shall be redirected to the login page.
- FR-AUTH-4: ✅ Admins shall be able to assign and change user roles.

### 4.2 Client Registration (P0)

- FR-CLT-1: Admins and Case Workers shall be able to create a new client record with: first name, last name, date of birth, phone, email, and address.
- FR-CLT-2: Each client shall be assigned a unique, human-readable system ID upon creation.
- FR-CLT-3: The system shall display a searchable, paginated list of all clients.
- FR-CLT-4: All authenticated users shall be able to search clients by name.
- FR-CLT-5: Admins shall be able to deactivate (soft-delete) a client record.

### 4.3 Service & Visit Logging (P0)

- FR-SVC-1: Admins and Case Workers shall be able to log a service entry against a client, capturing: date, service type, assigned staff member, and free-text notes.
- FR-SVC-2: Service types shall be configurable by an admin via a dropdown list.
- FR-SVC-3: Each client's profile shall display their full service history in reverse chronological order.

### 4.4 Client Profile View (P0)

- FR-PRF-1: The system shall provide a single-page client profile showing demographic information at the top and service history below.
- FR-PRF-2: Admins shall be able to edit client demographic information.

### 4.5 Deployment & Demo Data (P0)

- FR-DEP-1: The application shall be deployed to a publicly accessible URL.
- FR-DEP-2: The system shall be seeded with a minimum of 10 clients and 30 service entries for demonstration.
- FR-DEP-3: The README shall include one-click deployment instructions.

### 4.6 CSV Import / Export (P1)

- FR-CSV-1: Admins shall be able to upload a CSV file to bulk-create client records.
- FR-CSV-2: The import process shall validate each row and report errors without halting the full import.
- FR-CSV-3: Admins shall be able to export all clients or all service entries to CSV.

### 4.7 Reporting Dashboard (P1)

- FR-RPT-1: The system shall display a dashboard with: total active clients, services delivered this week / month / quarter, breakdown of service types (bar chart), and visit trend over time (line chart).
- FR-RPT-2: The dashboard shall be printable or exportable to PDF.

### 4.8 Configurable Fields (P1)

- FR-CFG-1: Admins shall be able to add, remove, and reorder custom fields on the client profile and service entry form without code changes.
- FR-CFG-2: Supported field types: text, number, date, boolean, single-select, multi-select.
- FR-CFG-3: Custom field definitions shall be stored as a JSON schema per organization.

### 4.9 Audit Log (P1)

- FR-AUD-1: The system shall log all create, update, and delete actions with: timestamp, acting user, entity type, and entity ID.
- FR-AUD-2: The audit log shall record which fields were changed — not the field values — to avoid storing PII.
- FR-AUD-3: Admins shall be able to view and filter the audit log.

### 4.10 Scheduling (P1)

- FR-SCH-1: Admins and Case Workers shall be able to schedule a future appointment for a client, capturing: date/time, service type, and assigned staff.
- FR-SCH-2: The system shall display a calendar view of upcoming appointments for the current day and week.
- FR-SCH-3: The system shall surface in-app reminders for upcoming appointments.

---

## 5. AI Feature Requirements

The SRD identifies AI as the primary differentiator against commercial alternatives. All AI features follow a **human-in-the-loop** model: AI outputs are drafts that require staff review before saving.

### 5.1 Photo-to-Intake (P2-AI — High Priority)

- FR-AI-1: Admins and Case Workers shall be able to upload a photo of a paper intake form from the new client registration page.
- FR-AI-2: The system shall extract form fields from the image using a vision AI model and pre-populate the client registration form.
- FR-AI-3: Staff shall review and confirm the extracted data before the record is created.

### 5.2 Semantic Search (P2-AI — High Priority)

- FR-AI-4: All authenticated users shall be able to submit a natural language query to search across all case notes.
- FR-AI-5: The system shall return ranked results matching the meaning of the query, not just keywords, with the client name and a relevant note snippet per result.

### 5.3 Client Handoff Summary (P2-AI)

- FR-AI-6: Admins and Case Workers shall be able to generate a structured case summary for any client from their profile page.
- FR-AI-7: The summary shall include: background, services history, current status, active needs, risk factors, and recommended next steps.
- FR-AI-8: The summary shall be regeneratable on demand and shall not be auto-saved without staff confirmation.

### 5.4 Auto-Generated Funder Reports (P2-AI)

- FR-AI-9: Admins shall be able to generate a narrative funder report for a selected time period.
- FR-AI-10: The report shall combine aggregated service data with AI-generated narrative sections and be exportable to PDF or Word.

### 5.5 Smart Follow-Up Detection (P2-AI)

- FR-AI-11: Upon saving a case note, the system shall automatically analyze the note text for implied follow-up actions.
- FR-AI-12: Detected follow-ups shall be surfaced to staff as a notification and tracked on the dashboard.

### 5.6 Voice-to-Case Notes (P2-AI)

- FR-AI-13: Admins and Case Workers shall be able to record audio directly from the service entry form.
- FR-AI-14: The system shall transcribe the audio and structure it into a formatted case note for staff review.
- FR-AI-15: Audio shall not be stored; only the transcript and structured output shall be retained.

### 5.7 Multilingual Intake (P2-AI)

- FR-AI-16: Staff shall be able to toggle the intake form language (minimum: English and Spanish).
- FR-AI-17: Translated form labels shall be cached to minimize repeated API calls.

---

## 6. Non-Functional Requirements (Summary)

| Concern | Requirement |
|---|---|
| **Cost** | Total hosting cost shall not exceed $30/month at MVP scale |
| **Deployment** | One-click deploy from GitHub to Vercel or Render |
| **Multi-tenancy** | Data model shall support multiple organizations with full isolation (org_id on all records) |
| **Security** | No unauthenticated data access; role enforcement at both API and database levels |
| **Privacy** | Audit log shall not store client PII; AI audio inputs shall not be persisted |
| **Accessibility** | UI components shall meet WCAG 2.1 AA baseline (shadcn/ui default) |

---

## 7. Out of Scope (Hackathon)

- DonorPerfect / Salesforce / Zapier integrations
- Native mobile app
- Billing / subscription management
- HIPAA certification (system is HIPAA-adjacent, not HIPAA-certified)
