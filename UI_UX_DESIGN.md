# Global Theme
Apply the following design system globally across the entire Amor et Cura Next.js app. Do not change any functionality — only update visual styles.

Design system (apply to ALL changes):
- Sidebar: bg #0a1e52 (deep navy). Logo icon + active nav item: #00bd8e (teal). Nav text idle: #c5d0e4. Nav hover: bg #1f3e80. Section labels: #4a62a0, 9px uppercase.
- Page background: #f4fbf9 (teal-tint). All cards: white bg, 1px #e2e8f0 border, 14px border-radius.
- Primary action buttons: bg #00bd8e, white text, 8px radius. Secondary/accent buttons: bg #fce4f0, text #eb3690.
- Headings: #0a1e52. Body text: #1f2937. Muted text: #6b7280.
- Trend badges — up: bg #e0f7f4 text #007b58. Alert/accent badges: bg #fce4f0 text #eb3690.
- Stat card icons: 32px circle icon container, teal icon on #e0f7f4 or pink icon on #fce4f0.
- Topbar: white bg, 1px bottom border #e2e8f0, 48px height. Contains breadcrumb (left) and action buttons (right).
- Use Lucide icons via lucide-react (already installed) for all icons — no emoji, no placeholder boxes.
- Sidebar bottom: user avatar (28px circle, #00bd8e bg, white initials), name 11px #c5d0e4, role 9px #4a62a0.
- Use Tailwind CSS for all styling (already configured).

Specific changes needed:

1. SIDEBAR (components/AppNav.tsx + components/nav-bar.tsx):
   - Set sidebar background to #0a1e52
   - Logo area: add a 30×30px teal (#00bd8e) rounded square icon with a white heart SVG, followed by "Amor Et Cura" in white 12px semibold and "Case Management" in #7890c4 9px below
   - Nav items: idle text #c5d0e4, active item gets bg #00bd8e and white text, hover gets bg #1f3e80
   - Add section labels "Main" and "Admin" in #4a62a0, 9px uppercase, above their respective nav groups
   - Bottom of sidebar: show logged-in user's initials in a 28px #00bd8e circle, name in #c5d0e4 11px, role in #4a62a0 9px

2. TOPBAR (wherever the top navigation bar lives):
   - White background, 48px height, 1px bottom border #e2e8f0
   - Left side: breadcrumb showing current section / page name
   - Right side: global client search input (bg #f4fbf9, border #e2e8f0, 8px radius, placeholder "Search clients…") + primary action button(s) relevant to current page

3. PAGE BACKGROUND: Set to #f4fbf9 on all (app) route pages

4. CARDS: All cards get white background, 1px solid #e2e8f0 border, 14px border-radius, no box-shadow

5. BUTTONS:
   - Primary (create/save): bg #00bd8e, white text, 8px radius, hover bg #009e77
   - Secondary/destructive-accent: bg #fce4f0, text #eb3690, 8px radius
   - Outline/cancel: transparent bg, 1px #e2e8f0 border

6. Update globals.css (or tailwind.config) so these colors are available as Tailwind custom tokens: navy: #0a1e52, teal: #00bd8e, pink-accent: #eb3690, teal-tint: #f4fbf9

Make no database or server action changes. If shadcn/ui components are used, override only their surface-level CSS classes, not their internals.
---
# Dashboard
Redesign the Dashboard page (app/(app)/dashboard/page.tsx and related components) to match the following layout. Do not change any data-fetching logic or Supabase queries.

Design system (apply to ALL changes):
- Sidebar: bg #0a1e52 (deep navy). Logo icon + active nav item: #00bd8e (teal). Nav text idle: #c5d0e4. Nav hover: bg #1f3e80. Section labels: #4a62a0, 9px uppercase.
- Page background: #f4fbf9 (teal-tint). All cards: white bg, 1px #e2e8f0 border, 14px border-radius.
- Primary action buttons: bg #00bd8e, white text, 8px radius. Secondary/accent buttons: bg #fce4f0, text #eb3690.
- Headings: #0a1e52. Body text: #1f2937. Muted text: #6b7280.
- Trend badges — up: bg #e0f7f4 text #007b58. Alert/accent badges: bg #fce4f0 text #eb3690.
- Stat card icons: 32px circle icon container, teal icon on #e0f7f4 or pink icon on #fce4f0.
- Topbar: white bg, 1px bottom border #e2e8f0, 48px height. Contains breadcrumb (left) and action buttons (right).
- Use Lucide icons via lucide-react (already installed) for all icons — no emoji, no placeholder boxes.
- Sidebar bottom: user avatar (28px circle, #00bd8e bg, white initials), name 11px #c5d0e4, role 9px #4a62a0.
- Use Tailwind CSS for all styling (already configured).

LAYOUT — top to bottom:

1. GREETING SECTION
   - "Good morning, [first name] 👋" in #0a1e52, 18px semibold
   - Subtext: "Here's what's happening at Chandler CARE Center today — [day, Month date]." in #6b7280, 12px
   - No card wrapper — sits directly on the teal-tint page bg

2. STAT CARDS (4-column grid, gap 10px)
   Each card: white bg, 1px #e2e8f0 border, 14px radius, 14px padding
   - Card 1: Active clients — teal icon (person silhouette) on #e0f7f4 circle, trend badge "+N this mo." (bg #e0f7f4 text #007b58), large number, label
   - Card 2: Visits this week — teal calendar icon, trend badge "↑ 12%" teal
   - Card 3: Appointments today — pink clock icon on #fce4f0 circle, badge "Today" (bg #fce4f0 text #eb3690)
   - Card 4: Visits this month — teal monitor icon, badge "Q1 2026" teal

3. CHARTS ROW (2 columns, gap 10px)
   - Left card: "Visit trend — last 7 weeks" — keep the existing Recharts VisitTrendChart but style bars in teal gradient (#b3ecdf → #00bd8e). Card title: 13px #0a1e52 semibold.
   - Right card: "Services breakdown" — keep the existing Recharts ServiceBreakdownChart. Use colors: #00bd8e, #eb3690, #3960a3, #d1d5db for segments. Add a legend with dot + label below or to the right.

4. BOTTOM ROW (2 columns, gap 10px)
   - Left card: "Today's appointments" — list each appointment with: time (12px #6b7280), a 8px colored dot (teal/pink/navy based on service type), client name (13px #0a1e52 semibold), service type (11px #6b7280), and a status badge (Confirmed: bg #e0f7f4 text #007b58 / Pending: bg #fce4f0 text #eb3690). If no appointments, show empty state.
   - Right card: "Recently added clients" — last 4 clients, each row: 28px avatar circle (initials, colored), client name (13px semibold), programs (11px #6b7280), status badge. Avatar colors cycle through #00bd8e, #eb3690, #3960a3, #7b3fa8.

Keep all existing data logic. Only restyle the presentation layer.
---
# Client List
Restyle the Clients list page (app/(app)/clients/page.tsx and ClientsTable.tsx) to match the design system below. Do not change search, filter, sort, export, or row-selection logic.

Design system (apply to ALL changes):
- Sidebar: bg #0a1e52 (deep navy). Logo icon + active nav item: #00bd8e (teal). Nav text idle: #c5d0e4. Nav hover: bg #1f3e80. Section labels: #4a62a0, 9px uppercase.
- Page background: #f4fbf9 (teal-tint). All cards: white bg, 1px #e2e8f0 border, 14px border-radius.
- Primary action buttons: bg #00bd8e, white text, 8px radius. Secondary/accent buttons: bg #fce4f0, text #eb3690.
- Headings: #0a1e52. Body text: #1f2937. Muted text: #6b7280.
- Trend badges — up: bg #e0f7f4 text #007b58. Alert/accent badges: bg #fce4f0 text #eb3690.
- Stat card icons: 32px circle icon container, teal icon on #e0f7f4 or pink icon on #fce4f0.
- Topbar: white bg, 1px bottom border #e2e8f0, 48px height. Contains breadcrumb (left) and action buttons (right).
- Use Lucide icons via lucide-react (already installed) for all icons — no emoji, no placeholder boxes.
- Sidebar bottom: user avatar (28px circle, #00bd8e bg, white initials), name 11px #c5d0e4, role 9px #4a62a0.
- Use Tailwind CSS for all styling (already configured).

TOPBAR (page-level):
- Breadcrumb: "Clients / All clients"
- Right side: search input (already exists — restyle only), "+ Import CSV" button (accent: bg #fce4f0 text #eb3690), "+ New Client" button (primary: bg #00bd8e white text)

TABLE REDESIGN:
- Outer wrapper: white card, 1px #e2e8f0 border, 14px radius
- Table header row: bg #f4fbf9, text #6b7280 11px uppercase 0.05em letter-spacing, 0.5px bottom border
- Table rows: 44px height, hover bg #f4fbf9, 0.5px bottom border #f1f5f9
- Columns: [ ] checkbox | Client (avatar + name + DOB) | Programs (pill badges) | Status | Date added | Actions
- Client cell: 32px avatar circle (initials, bg cycles #00bd8e/#eb3690/#3960a3/#7b3fa8), then name in 13px #0a1e52 semibold + DOB in 11px #6b7280 below
- Programs: each program as a small pill (bg #e0f7f4 text #007b58, 10px, 4px radius). If more than 2, show "N more"
- Status badge: Active → bg #e0f7f4 text #007b58 / Inactive → bg #f3f4f6 text #6b7280
- Actions column: icon buttons (view eye icon, edit pencil icon) in #6b7280, hover #0a1e52

EMPTY STATE (no results):
- Centered in table body, 80px tall: "No clients found" in #6b7280, 13px + "+ Add your first client" link in #00bd8e

PAGINATION (if present): Keep functional logic, restyle: page numbers in #0a1e52, current page bg #00bd8e white text, prev/next arrows in #6b7280
---
# New Client Form
Restyle the New Client registration form (app/(app)/clients/new/page.tsx and ClientRegistrationForm.tsx). Do not change server actions, field definitions fetching, or form submission logic.

Design system (apply to ALL changes):
- Sidebar: bg #0a1e52 (deep navy). Logo icon + active nav item: #00bd8e (teal). Nav text idle: #c5d0e4. Nav hover: bg #1f3e80. Section labels: #4a62a0, 9px uppercase.
- Page background: #f4fbf9 (teal-tint). All cards: white bg, 1px #e2e8f0 border, 14px border-radius.
- Primary action buttons: bg #00bd8e, white text, 8px radius. Secondary/accent buttons: bg #fce4f0, text #eb3690.
- Headings: #0a1e52. Body text: #1f2937. Muted text: #6b7280.
- Trend badges — up: bg #e0f7f4 text #007b58. Alert/accent badges: bg #fce4f0 text #eb3690.
- Stat card icons: 32px circle icon container, teal icon on #e0f7f4 or pink icon on #fce4f0.
- Topbar: white bg, 1px bottom border #e2e8f0, 48px height. Contains breadcrumb (left) and action buttons (right).
- Use Lucide icons via lucide-react (already installed) for all icons — no emoji, no placeholder boxes.
- Sidebar bottom: user avatar (28px circle, #00bd8e bg, white initials), name 11px #c5d0e4, role 9px #4a62a0.
- Use Tailwind CSS for all styling (already configured).

TOPBAR:
- Breadcrumb: "Clients / New client"
- No action buttons on right (save is in form)

FORM LAYOUT — single centered column, max-width 680px, auto margin:

1. SECTION: "Basic information" — card (white, 14px radius, 1px border, 20px padding)
   Section title: 13px #0a1e52 semibold uppercase tracking-wide, 1px bottom border #e2e8f0 mb-12
   Fields in 2-column grid: First name, Last name | Date of birth, Language | Phone, Email | Address (full width)

2. SECTION: "Programs" — card below
   Multi-checkbox list. Each program: checkbox + label inline, 36px row height, hover bg #f4fbf9, 0.5px bottom border.
   Checked row: checkbox teal (#00bd8e), label #0a1e52 semibold.

3. SECTION: "Additional information" (custom fields) — card below, only shown if field_definitions exist
   Render each custom field with its label (12px #6b7280) above and input below. Same 2-col grid.

FIELD STYLE (all inputs):
- 36px height, 8px radius, 1px #e2e8f0 border, bg white, 13px text #0a1e52
- Focus: 2px teal outline (#00bd8e), border-color #00bd8e
- Label above: 11px #6b7280, mb-4

FORM FOOTER (outside cards, sticky bottom or inline):
- Left: "Cancel" outline button → /clients
- Right: "Register client" primary button (bg #00bd8e white text)

Keep all existing validation and server action wiring.
---
# Client Profile
Restyle the Client Profile page (app/(app)/clients/[id]/page.tsx and ClientActions.tsx) to match the design system. Do not change any data fetching, server actions, or role-gating logic.

Design system (apply to ALL changes):
- Sidebar: bg #0a1e52 (deep navy). Logo icon + active nav item: #00bd8e (teal). Nav text idle: #c5d0e4. Nav hover: bg #1f3e80. Section labels: #4a62a0, 9px uppercase.
- Page background: #f4fbf9 (teal-tint). All cards: white bg, 1px #e2e8f0 border, 14px border-radius.
- Primary action buttons: bg #00bd8e, white text, 8px radius. Secondary/accent buttons: bg #fce4f0, text #eb3690.
- Headings: #0a1e52. Body text: #1f2937. Muted text: #6b7280.
- Trend badges — up: bg #e0f7f4 text #007b58. Alert/accent badges: bg #fce4f0 text #eb3690.
- Stat card icons: 32px circle icon container, teal icon on #e0f7f4 or pink icon on #fce4f0.
- Topbar: white bg, 1px bottom border #e2e8f0, 48px height. Contains breadcrumb (left) and action buttons (right).
- Use Lucide icons via lucide-react (already installed) for all icons — no emoji, no placeholder boxes.
- Sidebar bottom: user avatar (28px circle, #00bd8e bg, white initials), name 11px #c5d0e4, role 9px #4a62a0.
- Use Tailwind CSS for all styling (already configured).

TOPBAR:
- Breadcrumb: "Clients / [Client Full Name]"
- Right side: "Edit" button (outline style), "Deactivate" button (bg #fce4f0 text #eb3690) — both role-gated as before

PAGE LAYOUT (2-column grid: left 2/3, right 1/3):

LEFT COLUMN:
1. Profile header card (white, 14px radius, 1px border):
   - 56px avatar circle (initials, bg #00bd8e), name in 20px #0a1e52 semibold, DOB + status badge inline
   - Below: programs as teal pills (bg #e0f7f4 text #007b58)

2. Demographics card below — label/value rows (label: #6b7280 12px, value: #0a1e52 13px semibold), 1px #f1f5f9 dividers between rows. Fields: Date of Birth, Address, Phone, Email, Language, Emergency Contact.

3. Custom fields card (if any) — same label/value row style, title "Additional information" in 13px #0a1e52 semibold

RIGHT COLUMN:
1. "Visit history" card:
   - Title "Visit history" 13px semibold + "Log new visit →" link in #00bd8e on the right
   - Each visit: date in #6b7280 11px, service type name in #0a1e52 13px semibold, notes in #6b7280 12px (truncated 1 line), small teal dot
   - Divider between visits
   - If no visits: "No visits recorded yet." muted text

2. "Upcoming appointments" card (if appointments data is available):
   - Same list style as visit history but with appointment time and status badge

Keep all existing data queries and role-based action visibility. Only restyle.
---
# Visit Log
Restyle the Visit log pages: all visits table (services/visits/page.tsx) and new visit form (services/visits/new/). Do not change server actions or data logic.

Design system (apply to ALL changes):
- Sidebar: bg #0a1e52 (deep navy). Logo icon + active nav item: #00bd8e (teal). Nav text idle: #c5d0e4. Nav hover: bg #1f3e80. Section labels: #4a62a0, 9px uppercase.
- Page background: #f4fbf9 (teal-tint). All cards: white bg, 1px #e2e8f0 border, 14px border-radius.
- Primary action buttons: bg #00bd8e, white text, 8px radius. Secondary/accent buttons: bg #fce4f0, text #eb3690.
- Headings: #0a1e52. Body text: #1f2937. Muted text: #6b7280.
- Trend badges — up: bg #e0f7f4 text #007b58. Alert/accent badges: bg #fce4f0 text #eb3690.
- Stat card icons: 32px circle icon container, teal icon on #e0f7f4 or pink icon on #fce4f0.
- Topbar: white bg, 1px bottom border #e2e8f0, 48px height. Contains breadcrumb (left) and action buttons (right).
- Use Lucide icons via lucide-react (already installed) for all icons — no emoji, no placeholder boxes.
- Sidebar bottom: user avatar (28px circle, #00bd8e bg, white initials), name 11px #c5d0e4, role 9px #4a62a0.
- Use Tailwind CSS for all styling (already configured).

ALL VISITS PAGE:
- Topbar breadcrumb: "Services / Visits"
- Topbar right: date range filter (optional, style as outlined inputs), "+ Log visit" primary button (bg #00bd8e)
- Table card: same style as Clients table
- Columns: Date | Client (avatar + name) | Service type (teal pill) | Duration (if present) | Staff | Notes (truncated) | Actions
- Row hover: bg #f4fbf9
- Service type pills: bg #e0f7f4 text #007b58, 10px, 4px radius
- Staff cell: small 24px avatar circle + name
- Empty state: "No visits recorded yet. Log your first visit →" with teal link

NEW VISIT FORM PAGE:
- Topbar breadcrumb: "Services / Visits / Log visit"
- Form: single card, max-width 600px centered
- Fields in logical groups:
  * Client (searchable select — style dropdown with avatar rows matching Clients table)
  * Service type (dropdown, styled pills in options)
  * Date + Time (2-col)
  * Duration in minutes (number input)
  * Notes (textarea, 4 rows, same border/focus style)
- Footer: Cancel (outline) + "Save visit" (primary teal) buttons

Input styles same as New Client form (36px, 8px radius, teal focus ring).
---
# Schedule/Calendar
Restyle the Schedule/Calendar pages (services/schedule/page.tsx and AppointmentForm.tsx). Do not change week navigation logic, appointment data queries, or server actions.

Design system (apply to ALL changes):
- Sidebar: bg #0a1e52 (deep navy). Logo icon + active nav item: #00bd8e (teal). Nav text idle: #c5d0e4. Nav hover: bg #1f3e80. Section labels: #4a62a0, 9px uppercase.
- Page background: #f4fbf9 (teal-tint). All cards: white bg, 1px #e2e8f0 border, 14px border-radius.
- Primary action buttons: bg #00bd8e, white text, 8px radius. Secondary/accent buttons: bg #fce4f0, text #eb3690.
- Headings: #0a1e52. Body text: #1f2937. Muted text: #6b7280.
- Trend badges — up: bg #e0f7f4 text #007b58. Alert/accent badges: bg #fce4f0 text #eb3690.
- Stat card icons: 32px circle icon container, teal icon on #e0f7f4 or pink icon on #fce4f0.
- Topbar: white bg, 1px bottom border #e2e8f0, 48px height. Contains breadcrumb (left) and action buttons (right).
- Use Lucide icons via lucide-react (already installed) for all icons — no emoji, no placeholder boxes.
- Sidebar bottom: user avatar (28px circle, #00bd8e bg, white initials), name 11px #c5d0e4, role 9px #4a62a0.
- Use Tailwind CSS for all styling (already configured).

SCHEDULE PAGE:
- Topbar breadcrumb: "Services / Schedule"
- Topbar right: "← Prev week" and "Next week →" buttons (outline, 8px radius), current week label "Mar 24 – Mar 30, 2026" in #0a1e52 13px semibold, "+ New appointment" primary teal button

CALENDAR GRID (white card, 14px radius):
- 7-column grid: Mon–Sun header row, bg #f4fbf9, 11px #6b7280 text
- Today's column: header bg #e0f7f4, light teal tint on cells
- Appointment blocks within day cells:
  - Rounded pill/card: 8px radius, colored by service category
  - Colors: Food assistance → #e0f7f4 text #007b58 / Case mgmt → #fce4f0 text #eb3690 / Counseling → #e8ecf6 text #0a1e52 / Default → #f3f4f6 text #6b7280
  - Shows: time (10px) + client name (11px semibold) + status dot (8px circle)
- Empty day cell: dashed 1px #e2e8f0 border on hover, showing "+ Add" in #9ca3af on hover

NEW APPOINTMENT FORM:
- Topbar breadcrumb: "Services / Schedule / New appointment"
- Card form, max-width 560px centered
- Fields: Client (searchable select), Service type (dropdown), Date (date picker), Time (time input), Duration, Notes (textarea)
- Footer: Cancel + "Book appointment" teal primary
- Input focus ring: 2px solid #00bd8e
---
# Admin Pages
Restyle all Admin pages (admin/page.tsx, admin/users/, admin/audit-log/, admin/settings/). Do not change role guards, server actions, or data logic.

Design system (apply to ALL changes):
- Sidebar: bg #0a1e52 (deep navy). Logo icon + active nav item: #00bd8e (teal). Nav text idle: #c5d0e4. Nav hover: bg #1f3e80. Section labels: #4a62a0, 9px uppercase.
- Page background: #f4fbf9 (teal-tint). All cards: white bg, 1px #e2e8f0 border, 14px border-radius.
- Primary action buttons: bg #00bd8e, white text, 8px radius. Secondary/accent buttons: bg #fce4f0, text #eb3690.
- Headings: #0a1e52. Body text: #1f2937. Muted text: #6b7280.
- Trend badges — up: bg #e0f7f4 text #007b58. Alert/accent badges: bg #fce4f0 text #eb3690.
- Stat card icons: 32px circle icon container, teal icon on #e0f7f4 or pink icon on #fce4f0.
- Topbar: white bg, 1px bottom border #e2e8f0, 48px height. Contains breadcrumb (left) and action buttons (right).
- Use Lucide icons via lucide-react (already installed) for all icons — no emoji, no placeholder boxes.
- Sidebar bottom: user avatar (28px circle, #00bd8e bg, white initials), name 11px #c5d0e4, role 9px #4a62a0.
- Use Tailwind CSS for all styling (already configured).

ADMIN OVERVIEW PAGE (admin/page.tsx):
- Topbar breadcrumb: "Admin / Overview"
- 3-column stat cards: Total users, Active clients, Audit events this week — same stat card style as Dashboard
- Below: 3 section link cards (Users, Audit Log, Settings) — each white card with icon (Lucide), title, short description, and "Go →" teal link on the right

USER MANAGEMENT PAGE (admin/users/):
- Topbar breadcrumb: "Admin / Users"
- Table card: columns — Avatar+Name | Email | Role (dropdown inline) | Joined | Actions
- Role dropdown: styled select, options Admin/Case Worker/Viewer, teal border when focused
- Role badge colors: Admin → bg #fce4f0 text #eb3690 / Case Worker → bg #e0f7f4 text #007b58 / Viewer → bg #e8ecf6 text #0a1e52

AUDIT LOG PAGE (admin/audit-log/page.tsx):
- Topbar breadcrumb: "Admin / Audit log"
- Filter bar (white card row): dropdowns for Table, Action, and User — all inline on one row, 36px height, 8px radius, #e2e8f0 border
- Table: columns — Timestamp | Actor (avatar+name) | Action badge | Table | Record ID | Changed fields
- Action badges: CREATE → teal / UPDATE → navy / DELETE → pink-accent
- 50/page pagination: same style as Clients table

SETTINGS PAGE (admin/settings/):
- Topbar breadcrumb: "Admin / Settings"
- Field definitions card: table with columns — Field label | Applies to | Type | Active (toggle) | Delete
- Active toggle: use a proper toggle switch (CSS-only or shadcn Switch), teal when on
- "+ Add field" button: primary teal, opens inline form row at bottom of table (or a simple modal-less expand)
- Add field inline form: label input + applies-to select + type select + "Save" teal button + "Cancel" outline

Keep all existing server actions, FieldManager client component logic, and form submissions.
---
# Auth Pages
Restyle the Login and Signup pages (app/login/page.tsx, app/signup/page.tsx) to match the Amor et Cura brand. Do not change server actions, Google SSO flow, or redirect logic.

Design system (apply to ALL changes):
- Sidebar: bg #0a1e52 (deep navy). Logo icon + active nav item: #00bd8e (teal). Nav text idle: #c5d0e4. Nav hover: bg #1f3e80. Section labels: #4a62a0, 9px uppercase.
- Page background: #f4fbf9 (teal-tint). All cards: white bg, 1px #e2e8f0 border, 14px border-radius.
- Primary action buttons: bg #00bd8e, white text, 8px radius. Secondary/accent buttons: bg #fce4f0, text #eb3690.
- Headings: #0a1e52. Body text: #1f2937. Muted text: #6b7280.
- Trend badges — up: bg #e0f7f4 text #007b58. Alert/accent badges: bg #fce4f0 text #eb3690.
- Stat card icons: 32px circle icon container, teal icon on #e0f7f4 or pink icon on #fce4f0.
- Topbar: white bg, 1px bottom border #e2e8f0, 48px height. Contains breadcrumb (left) and action buttons (right).
- Use Lucide icons via lucide-react (already installed) for all icons — no emoji, no placeholder boxes.
- Sidebar bottom: user avatar (28px circle, #00bd8e bg, white initials), name 11px #c5d0e4, role 9px #4a62a0.
- Use Tailwind CSS for all styling (already configured).

LAYOUT: Full-height page split into two columns (desktop) / single column (mobile):
- LEFT PANEL (40% width, bg #0a1e52):
  * Centered vertically: logo icon (40px teal rounded square with white heart SVG), "Amor Et Cura" in white 24px semibold, "Case Management" in #7890c4 14px
  * Below: short tagline "Built for nonprofits that care." in #c5d0e4 14px
  * Bottom: "Powered by Chandler CARE Center" in #4a62a0 11px
- RIGHT PANEL (60% width, bg #f4fbf9):
  * White card centered (max-width 400px, 14px radius, 1px #e2e8f0 border, 32px padding)
  * Card title: "Welcome back" (login) or "Create your account" (signup) — 20px #0a1e52 semibold
  * Subtitle: "Sign in to Amor Et Cura" or "Join your team" — 13px #6b7280

FORM FIELDS (inside white card):
- Email label (11px #6b7280) + input (36px, 8px radius, 1px #e2e8f0, teal focus ring)
- Password label + input (with show/hide toggle icon — eye icon from Lucide)
- For signup: also First name, Last name (2-col grid), Confirm password
- Submit button: full-width, bg #00bd8e, white text, 36px height, 8px radius, "Sign in" or "Create account"
- Divider: "or" with 1px lines either side, #e2e8f0
- Google SSO button: white bg, 1px #e2e8f0 border, Google logo (inline SVG), "Continue with Google" — keep existing GoogleSignInButton component, just restyle wrapper
- Footer link: "Don't have an account? Sign up" or "Already have one? Sign in" — link text in #00bd8e

Error messages: red text #dc2626, 12px, below the relevant field. Keep existing error handling.