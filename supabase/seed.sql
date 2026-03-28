-- ============================================================
-- Amor et Cura — Demo Seed Data
-- Run this AFTER the migration (20260328000001_init.sql)
-- in Supabase: SQL Editor → paste → Run
-- ============================================================

-- ── Profiles (demo staff accounts) ──────────────────────────
-- Note: auth.users rows must be created first via Supabase Auth dashboard
-- or via supabase auth admin. These UUIDs are placeholders — replace with
-- real auth.users UUIDs after creating demo accounts.

insert into public.profiles (id, full_name, role) values
  ('00000000-0000-0000-0000-000000000001', 'Alex Rivera',   'admin'),
  ('00000000-0000-0000-0000-000000000002', 'Jordan Kim',    'case_worker'),
  ('00000000-0000-0000-0000-000000000003', 'Taylor Brooks', 'case_worker'),
  ('00000000-0000-0000-0000-000000000004', 'Sam Patel',     'read_only')
on conflict (id) do nothing;

-- ── Clients ──────────────────────────────────────────────────
insert into public.clients
  (id, first_name, last_name, dob, phone, email, address, program, created_by)
values
  ('c0000001-0000-0000-0000-000000000001', 'Maria',     'Garcia',     '1985-04-12', '(602) 555-0101', 'mgarcia@example.com',    '123 Main St, Chandler, AZ 85224',   'Family Services',         '00000000-0000-0000-0000-000000000002'),
  ('c0000001-0000-0000-0000-000000000002', 'James',     'Thompson',   '1972-09-30', '(602) 555-0102', null,                     '456 Oak Ave, Chandler, AZ 85225',   'Housing Support',         '00000000-0000-0000-0000-000000000002'),
  ('c0000001-0000-0000-0000-000000000003', 'Aisha',     'Patel',      '1991-02-18', '(602) 555-0103', 'apatel@example.com',     '789 Elm Blvd, Gilbert, AZ 85234',   'Food Assistance',         '00000000-0000-0000-0000-000000000003'),
  ('c0000001-0000-0000-0000-000000000004', 'Carlos',    'Rivera',     '1968-11-05', null,             'crivera@example.com',    '321 Pine St, Mesa, AZ 85201',       'Employment Support',      '00000000-0000-0000-0000-000000000002'),
  ('c0000001-0000-0000-0000-000000000005', 'Linda',     'Nguyen',     '1999-07-22', '(602) 555-0105', 'lnguyen@example.com',    '654 Cedar Rd, Tempe, AZ 85281',     'Mental Health Services',  '00000000-0000-0000-0000-000000000003'),
  ('c0000001-0000-0000-0000-000000000006', 'David',     'Okonkwo',    '1983-03-14', '(602) 555-0106', 'dokonkwo@example.com',   '99 Birch Ln, Chandler, AZ 85226',   'Case Management',         '00000000-0000-0000-0000-000000000002'),
  ('c0000001-0000-0000-0000-000000000007', 'Rosa',      'Mendez',     '2001-12-01', '(602) 555-0107', null,                     '200 Maple Dr, Gilbert, AZ 85296',   'Child & Family Services', '00000000-0000-0000-0000-000000000003'),
  ('c0000001-0000-0000-0000-000000000008', 'Kevin',     'Johnson',    '1975-06-19', '(602) 555-0108', 'kjohnson@example.com',   '550 Spruce Way, Mesa, AZ 85202',    'Housing Support',         '00000000-0000-0000-0000-000000000002'),
  ('c0000001-0000-0000-0000-000000000009', 'Fatima',    'Al-Hassan',  '1994-08-27', '(602) 555-0109', 'falhassan@example.com',  '17 Willow Ct, Tempe, AZ 85282',     'Medical Referral',        '00000000-0000-0000-0000-000000000003'),
  ('c0000001-0000-0000-0000-000000000010', 'Marcus',    'Williams',   '1989-01-08', null,             'mwilliams@example.com',  '403 Aspen Ave, Chandler, AZ 85224', 'Employment Support',      '00000000-0000-0000-0000-000000000002'),
  ('c0000001-0000-0000-0000-000000000011', 'Priya',     'Sharma',     '2003-05-30', '(602) 555-0111', 'psharma@example.com',    '88 Sycamore St, Gilbert, AZ 85233', 'Education Support',       '00000000-0000-0000-0000-000000000003'),
  ('c0000001-0000-0000-0000-000000000012', 'Darius',    'Mitchell',   '1960-10-22', '(602) 555-0112', null,                     '77 Juniper Pl, Mesa, AZ 85203',     'Food Assistance',         '00000000-0000-0000-0000-000000000002')
on conflict (id) do nothing;

-- ── Visits ───────────────────────────────────────────────────
-- Uses service_type names to look up IDs dynamically

insert into public.visits
  (client_id, case_worker_id, service_type_id, visit_date, duration_minutes, notes)
values
  -- Maria Garcia (c01)
  ('c0000001-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Case Management'),       '2026-03-20', 45,  'Initial intake completed. Client seeking housing assistance for family of 3. Referred to housing coordinator.'),
  ('c0000001-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', (select id from public.service_types where name = 'Food Assistance'),       '2026-03-14', 30,  'Provided 2-week emergency food box. Client scheduled for follow-up pantry visit next week.'),
  ('c0000001-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Mental Health Services'),'2026-02-28', 60,  'Counseling session on stress management. Client reported feeling overwhelmed after recent job loss.'),

  -- James Thompson (c02)
  ('c0000001-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Housing Support'),       '2026-03-18', 50,  'Reviewed housing application status. Documents submitted to county. Awaiting response in 2–3 weeks.'),
  ('c0000001-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Case Management'),       '2026-03-05', 40,  'Follow-up on outstanding utility bills. Connected client with emergency assistance fund.'),
  ('c0000001-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', (select id from public.service_types where name = 'Food Assistance'),       '2026-02-15', 20,  'Monthly food box pickup. Client reported dietary restrictions updated.'),

  -- Aisha Patel (c03)
  ('c0000001-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', (select id from public.service_types where name = 'Food Assistance'),       '2026-03-22', 20,  'Monthly food box pickup. Client requested no-pork accommodation. Updated record.'),
  ('c0000001-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Employment Support'),    '2026-03-10', 55,  'Resume review and mock interview practice. Submitted applications to 3 local employers.'),
  ('c0000001-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', (select id from public.service_types where name = 'Child & Family Services'),'2026-02-20', 45, 'Child care referral provided. Client connected with subsidized daycare program.'),

  -- Carlos Rivera (c04)
  ('c0000001-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Employment Support'),    '2026-03-19', 60,  'Job readiness workshop completed. Client expressed interest in construction trade programs.'),
  ('c0000001-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', (select id from public.service_types where name = 'Case Management'),       '2026-03-01', 35,  'Updated contact information. Discussed goals for Q2. Client motivated and engaged.'),

  -- Linda Nguyen (c05)
  ('c0000001-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', (select id from public.service_types where name = 'Mental Health Services'),'2026-03-21', 50,  'Weekly counseling session. Client making progress with anxiety management techniques.'),
  ('c0000001-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', (select id from public.service_types where name = 'Mental Health Services'),'2026-03-07', 50,  'Discussed coping strategies. Client reports improved sleep. Continuing weekly sessions.'),
  ('c0000001-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Education Support'),     '2026-02-18', 30,  'College application assistance. Helped client complete FAFSA and two scholarship applications.'),

  -- David Okonkwo (c06)
  ('c0000001-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Case Management'),       '2026-03-17', 45,  'Quarterly case review. All goals on track. Discussed transition plan for program exit in June.'),
  ('c0000001-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', (select id from public.service_types where name = 'Legal Aid Referral'),    '2026-03-03', 30,  'Referred to legal aid for landlord dispute. Provided contact info and intake instructions.'),
  ('c0000001-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Food Assistance'),       '2026-02-10', 20,  'Emergency food assistance provided. 1-week supply. Client will return to pantry schedule next month.'),

  -- Rosa Mendez (c07)
  ('c0000001-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000003', (select id from public.service_types where name = 'Child & Family Services'),'2026-03-23', 60, 'Initial family assessment. Single parent with two children aged 4 and 7. School enrollment support needed.'),
  ('c0000001-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000003', (select id from public.service_types where name = 'Education Support'),     '2026-03-12', 40,  'Assisted with school enrollment paperwork for both children. Follow-up with district office scheduled.'),

  -- Kevin Johnson (c08)
  ('c0000001-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Housing Support'),       '2026-03-16', 55,  'Emergency shelter referral provided. Client lost housing after building fire. Coordinating with Red Cross.'),
  ('c0000001-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Housing Support'),       '2026-03-09', 40,  'Reviewed transitional housing options. Client approved for 90-day program at Crossroads shelter.'),
  ('c0000001-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000003', (select id from public.service_types where name = 'Case Management'),       '2026-02-25', 30,  'First contact. Client self-referred. Completed intake paperwork and service assessment.'),

  -- Fatima Al-Hassan (c09)
  ('c0000001-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000003', (select id from public.service_types where name = 'Medical Referral'),      '2026-03-20', 25,  'Referred to Maricopa County FQHC for primary care. Client uninsured. Assisted with enrollment in AHCCCS.'),
  ('c0000001-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Transportation Assistance'),'2026-03-08', 15,'Bus pass issued for medical appointments. 30-day pass provided.'),
  ('c0000001-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000003', (select id from public.service_types where name = 'Case Management'),       '2026-02-22', 40,  'Intake and assessment. Client recently relocated. Language support (Arabic) arranged for next visit.'),

  -- Marcus Williams (c10)
  ('c0000001-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Employment Support'),    '2026-03-18', 50,  'Skills assessment completed. Client has 10 years warehouse experience. Referred to staffing agency.'),
  ('c0000001-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Employment Support'),    '2026-03-04', 45,  'Interview coaching session. Worked on answering behavioral questions. Client feeling more confident.'),

  -- Priya Sharma (c11)
  ('c0000001-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000003', (select id from public.service_types where name = 'Education Support'),     '2026-03-25', 60,  'SAT prep resources provided. Discussed college options. Client interested in nursing program at MCC.'),
  ('c0000001-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000003', (select id from public.service_types where name = 'Education Support'),     '2026-03-11', 45,  'Scholarship research session. Identified 4 applicable scholarships. Application deadlines tracked.'),

  -- Darius Mitchell (c12)
  ('c0000001-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Food Assistance'),       '2026-03-24', 20,  'Monthly pantry visit. Client noted interest in cooking classes. Referred to community center program.'),
  ('c0000001-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000003', (select id from public.service_types where name = 'Medical Referral'),      '2026-03-13', 30,  'Assisted with prescription cost assistance program enrollment. Savings of ~$180/month on medications.'),
  ('c0000001-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Case Management'),       '2026-02-28', 35,  'Initial intake. Client referred by local food bank. Assessed for full range of services.');
