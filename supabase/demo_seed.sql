-- ============================================================
-- Amor et Cura — Complete Demo Seed
-- ============================================================
-- Run this AFTER all 8 migrations in supabase/migrations/.
--
-- BEFORE running:
--   1. Create 4 demo accounts in Supabase Auth dashboard (or use Auth > Users > Invite):
--        admin@demo.amoretcura.org    password: Demo1234!
--        jordan@demo.amoretcura.org   password: Demo1234!
--        taylor@demo.amoretcura.org   password: Demo1234!
--        viewer@demo.amoretcura.org   password: Demo1234!
--   2. Copy the UUIDs from Auth > Users and replace the 4 placeholder UUIDs below.
--   3. Paste this entire file into Supabase SQL Editor → Run.
--
-- OR (faster): run in SQL Editor as the service role — the placeholder UUIDs
-- below are valid as long as you inserted matching rows into auth.users first.
-- ============================================================

-- ── 1. Profiles (demo staff) ─────────────────────────────────
-- Replace these UUIDs with real auth.users UUIDs from your Supabase project.
-- The names and roles stay the same; only the id column needs to match auth.users.

insert into public.profiles (id, full_name, role) values
  ('00000000-0000-0000-0000-000000000001', 'Alex Rivera',   'admin'),
  ('00000000-0000-0000-0000-000000000002', 'Jordan Kim',    'case_worker'),
  ('00000000-0000-0000-0000-000000000003', 'Taylor Brooks', 'case_worker'),
  ('00000000-0000-0000-0000-000000000004', 'Sam Patel',     'read_only')
on conflict (id) do update
  set full_name = excluded.full_name,
      role      = excluded.role;

-- ── 2. Clients (12 demo records) ─────────────────────────────
insert into public.clients
  (id, first_name, last_name, dob, phone, email, address, program, created_by)
values
  ('c0000001-0000-0000-0000-000000000001', 'Maria',  'Garcia',    '1985-04-12', '(602) 555-0101', 'mgarcia@example.com',   '123 Main St, Chandler, AZ 85224',   'Family Services',         '00000000-0000-0000-0000-000000000002'),
  ('c0000001-0000-0000-0000-000000000002', 'James',  'Thompson',  '1972-09-30', '(602) 555-0102', null,                    '456 Oak Ave, Chandler, AZ 85225',   'Housing Support',         '00000000-0000-0000-0000-000000000002'),
  ('c0000001-0000-0000-0000-000000000003', 'Aisha',  'Patel',     '1991-02-18', '(602) 555-0103', 'apatel@example.com',    '789 Elm Blvd, Gilbert, AZ 85234',   'Food Assistance',         '00000000-0000-0000-0000-000000000003'),
  ('c0000001-0000-0000-0000-000000000004', 'Carlos', 'Rivera',    '1968-11-05', null,             'crivera@example.com',   '321 Pine St, Mesa, AZ 85201',       'Employment Support',      '00000000-0000-0000-0000-000000000002'),
  ('c0000001-0000-0000-0000-000000000005', 'Linda',  'Nguyen',    '1999-07-22', '(602) 555-0105', 'lnguyen@example.com',   '654 Cedar Rd, Tempe, AZ 85281',     'Mental Health Services',  '00000000-0000-0000-0000-000000000003'),
  ('c0000001-0000-0000-0000-000000000006', 'David',  'Okonkwo',   '1983-03-14', '(602) 555-0106', 'dokonkwo@example.com',  '99 Birch Ln, Chandler, AZ 85226',   'Case Management',         '00000000-0000-0000-0000-000000000002'),
  ('c0000001-0000-0000-0000-000000000007', 'Rosa',   'Mendez',    '2001-12-01', '(602) 555-0107', null,                    '200 Maple Dr, Gilbert, AZ 85296',   'Child & Family Services', '00000000-0000-0000-0000-000000000003'),
  ('c0000001-0000-0000-0000-000000000008', 'Kevin',  'Johnson',   '1975-06-19', '(602) 555-0108', 'kjohnson@example.com',  '550 Spruce Way, Mesa, AZ 85202',    'Housing Support',         '00000000-0000-0000-0000-000000000002'),
  ('c0000001-0000-0000-0000-000000000009', 'Fatima', 'Al-Hassan', '1994-08-27', '(602) 555-0109', 'falhassan@example.com', '17 Willow Ct, Tempe, AZ 85282',     'Medical Referral',        '00000000-0000-0000-0000-000000000003'),
  ('c0000001-0000-0000-0000-000000000010', 'Marcus', 'Williams',  '1989-01-08', null,             'mwilliams@example.com', '403 Aspen Ave, Chandler, AZ 85224', 'Employment Support',      '00000000-0000-0000-0000-000000000002'),
  ('c0000001-0000-0000-0000-000000000011', 'Priya',  'Sharma',    '2003-05-30', '(602) 555-0111', 'psharma@example.com',   '88 Sycamore St, Gilbert, AZ 85233', 'Education Support',       '00000000-0000-0000-0000-000000000003'),
  ('c0000001-0000-0000-0000-000000000012', 'Darius', 'Mitchell',  '1960-10-22', '(602) 555-0112', null,                    '77 Juniper Pl, Mesa, AZ 85203',     'Food Assistance',         '00000000-0000-0000-0000-000000000002')
on conflict (id) do nothing;

-- ── 3. Visits (32 demo entries) ──────────────────────────────
insert into public.visits
  (client_id, case_worker_id, service_type_id, visit_date, duration_minutes, notes)
values
  -- Maria Garcia
  ('c0000001-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Case Management'),       '2026-03-20', 45, 'Initial intake completed. Client seeking housing assistance for family of 3. Referred to housing coordinator.'),
  ('c0000001-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', (select id from public.service_types where name = 'Food Assistance'),       '2026-03-14', 30, 'Provided 2-week emergency food box. Client scheduled for follow-up pantry visit next week.'),
  ('c0000001-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Mental Health Services'),'2026-02-28', 60, 'Counseling session on stress management. Client reported feeling overwhelmed after recent job loss.'),

  -- James Thompson
  ('c0000001-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Housing Support'),       '2026-03-18', 50, 'Reviewed housing application status. Documents submitted to county. Awaiting response in 2–3 weeks.'),
  ('c0000001-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Case Management'),       '2026-03-05', 40, 'Follow-up on outstanding utility bills. Connected client with emergency assistance fund.'),
  ('c0000001-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', (select id from public.service_types where name = 'Food Assistance'),       '2026-02-15', 20, 'Monthly food box pickup. Client reported dietary restrictions updated.'),

  -- Aisha Patel
  ('c0000001-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', (select id from public.service_types where name = 'Food Assistance'),        '2026-03-22', 20, 'Monthly food box pickup. Client requested no-pork accommodation. Updated record.'),
  ('c0000001-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Employment Support'),     '2026-03-10', 55, 'Resume review and mock interview practice. Submitted applications to 3 local employers.'),
  ('c0000001-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', (select id from public.service_types where name = 'Child & Family Services'),'2026-02-20', 45, 'Child care referral provided. Client connected with subsidized daycare program.'),

  -- Carlos Rivera
  ('c0000001-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Employment Support'),    '2026-03-19', 60, 'Job readiness workshop completed. Client expressed interest in construction trade programs.'),
  ('c0000001-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', (select id from public.service_types where name = 'Case Management'),       '2026-03-01', 35, 'Updated contact information. Discussed goals for Q2. Client motivated and engaged.'),

  -- Linda Nguyen
  ('c0000001-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', (select id from public.service_types where name = 'Mental Health Services'),'2026-03-21', 50, 'Weekly counseling session. Client making progress with anxiety management techniques.'),
  ('c0000001-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', (select id from public.service_types where name = 'Mental Health Services'),'2026-03-07', 50, 'Discussed coping strategies. Client reports improved sleep. Continuing weekly sessions.'),
  ('c0000001-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Education Support'),     '2026-02-18', 30, 'College application assistance. Helped client complete FAFSA and two scholarship applications.'),

  -- David Okonkwo
  ('c0000001-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Case Management'),       '2026-03-17', 45, 'Quarterly case review. All goals on track. Discussed transition plan for program exit in June.'),
  ('c0000001-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', (select id from public.service_types where name = 'Legal Aid Referral'),    '2026-03-03', 30, 'Referred to legal aid for landlord dispute. Provided contact info and intake instructions.'),
  ('c0000001-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Food Assistance'),       '2026-02-10', 20, 'Emergency food assistance provided. 1-week supply. Client will return to pantry schedule next month.'),

  -- Rosa Mendez
  ('c0000001-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000003', (select id from public.service_types where name = 'Child & Family Services'),'2026-03-23', 60, 'Initial family assessment. Single parent with two children aged 4 and 7. School enrollment support needed.'),
  ('c0000001-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000003', (select id from public.service_types where name = 'Education Support'),     '2026-03-12', 40, 'Assisted with school enrollment paperwork for both children. Follow-up with district office scheduled.'),

  -- Kevin Johnson
  ('c0000001-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Housing Support'),       '2026-03-16', 55, 'Emergency shelter referral provided. Client lost housing after building fire. Coordinating with Red Cross.'),
  ('c0000001-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Housing Support'),       '2026-03-09', 40, 'Reviewed transitional housing options. Client approved for 90-day program at Crossroads shelter.'),
  ('c0000001-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000003', (select id from public.service_types where name = 'Case Management'),       '2026-02-25', 30, 'First contact. Client self-referred. Completed intake paperwork and service assessment.'),

  -- Fatima Al-Hassan
  ('c0000001-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000003', (select id from public.service_types where name = 'Medical Referral'),         '2026-03-20', 25, 'Referred to Maricopa County FQHC for primary care. Client uninsured. Assisted with enrollment in AHCCCS.'),
  ('c0000001-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Transportation Assistance'),'2026-03-08', 15, 'Bus pass issued for medical appointments. 30-day pass provided.'),
  ('c0000001-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000003', (select id from public.service_types where name = 'Case Management'),          '2026-02-22', 40, 'Intake and assessment. Client recently relocated. Language support (Arabic) arranged for next visit.'),

  -- Marcus Williams
  ('c0000001-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Employment Support'),    '2026-03-18', 50, 'Skills assessment completed. Client has 10 years warehouse experience. Referred to staffing agency.'),
  ('c0000001-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Employment Support'),    '2026-03-04', 45, 'Interview coaching session. Worked on answering behavioral questions. Client feeling more confident.'),

  -- Priya Sharma
  ('c0000001-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000003', (select id from public.service_types where name = 'Education Support'),     '2026-03-25', 60, 'SAT prep resources provided. Discussed college options. Client interested in nursing program at MCC.'),
  ('c0000001-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000003', (select id from public.service_types where name = 'Education Support'),     '2026-03-11', 45, 'Scholarship research session. Identified 4 applicable scholarships. Application deadlines tracked.'),

  -- Darius Mitchell
  ('c0000001-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Food Assistance'),       '2026-03-24', 20, 'Monthly pantry visit. Client noted interest in cooking classes. Referred to community center program.'),
  ('c0000001-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000003', (select id from public.service_types where name = 'Medical Referral'),      '2026-03-13', 30, 'Assisted with prescription cost assistance program enrollment. Savings of ~$180/month on medications.'),
  ('c0000001-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Case Management'),       '2026-02-28', 35, 'Initial intake. Client referred by local food bank. Assessed for full range of services.');

-- ── 4. Appointments (upcoming scheduled) ─────────────────────
-- Dates are relative to demo date 2026-03-28.
-- This week: 2026-03-28 (Sat) is today; next business week starts 2026-03-30.
insert into public.appointments
  (client_id, case_worker_id, service_type_id, scheduled_at, duration_minutes, notes, status)
values
  -- Monday 2026-03-30
  ('c0000001-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Case Management'),       '2026-03-30T09:00:00', 45, 'Follow-up on housing application submitted last week.',                               'scheduled'),
  ('c0000001-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', (select id from public.service_types where name = 'Mental Health Services'),'2026-03-30T10:00:00', 50, 'Weekly session — continue anxiety coping plan.',                                      'scheduled'),
  ('c0000001-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Housing Support'),       '2026-03-30T14:00:00', 30, 'Check-in on Crossroads shelter transition. First week review.',                       'scheduled'),

  -- Tuesday 2026-03-31
  ('c0000001-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Employment Support'),    '2026-03-31T10:30:00', 60, 'Mock interview #2 before Thursday employer meeting.',                                 'scheduled'),
  ('c0000001-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000003', (select id from public.service_types where name = 'Medical Referral'),      '2026-03-31T13:00:00', 30, 'Review AHCCCS enrollment confirmation. Confirm FQHC appointment is scheduled.',        'scheduled'),
  ('c0000001-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000003', (select id from public.service_types where name = 'Education Support'),     '2026-03-31T15:00:00', 45, 'Scholarship application review — deadline April 1 for two applications.',             'scheduled'),

  -- Wednesday 2026-04-01
  ('c0000001-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000003', (select id from public.service_types where name = 'Child & Family Services'),'2026-04-01T09:00:00', 60, 'Second family assessment session. Follow up on school district enrollment response.',  'scheduled'),
  ('c0000001-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Employment Support'),    '2026-04-01T11:00:00', 45, 'Review construction trade program options identified last session.',                  'scheduled'),
  ('c0000001-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Employment Support'),    '2026-04-01T14:30:00', 30, 'Staffing agency referral follow-up. Review any job offers received.',                 'scheduled'),

  -- Thursday 2026-04-02
  ('c0000001-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Housing Support'),       '2026-04-02T09:30:00', 45, 'County housing application — expecting response this week. Review status together.',  'scheduled'),
  ('c0000001-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Legal Aid Referral'),    '2026-04-02T13:00:00', 30, 'Check on legal aid intake status for landlord dispute.',                              'scheduled'),
  ('c0000001-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000003', (select id from public.service_types where name = 'Food Assistance'),       '2026-04-02T15:00:00', 20, 'Monthly pantry pickup — confirm cooking class referral was received.',                'scheduled'),

  -- Friday 2026-04-03
  ('c0000001-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', (select id from public.service_types where name = 'Mental Health Services'),'2026-04-03T10:00:00', 50, 'Bi-weekly extended session — review coping log and set goals for next two weeks.',    'scheduled'),
  ('c0000001-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Transportation Assistance'),'2026-04-03T11:30:00', 15,'Issue second bus pass for upcoming medical appointments.',                           'scheduled'),

  -- Following week (2026-04-07)
  ('c0000001-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', (select id from public.service_types where name = 'Food Assistance'),       '2026-04-07T10:00:00', 20, 'Scheduled pantry pickup — bi-weekly cadence.',                                        'scheduled'),
  ('c0000001-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', (select id from public.service_types where name = 'Case Management'),       '2026-04-07T14:00:00', 45, 'Mid-quarter review. Discuss June program exit plan in detail.',                       'scheduled');
