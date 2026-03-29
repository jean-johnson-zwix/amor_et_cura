-- ============================================================
-- Amor et Cura — Professional JJK Seed (Schema Corrected)
-- ============================================================

-- ── 0. Clear Existing Data ──────────────────────────────────
truncate public.appointments, public.visits, public.clients, public.profiles restart identity cascade;

-- ── 1. Profiles (Staff) ─────────────────────────────────────
insert into public.profiles (id, full_name, role) values
  ('30d5c435-a7c9-4e38-ae3f-be5a054b5b7c', 'Joel Johnson',   'admin'),
  ('6115480a-236d-4de0-952f-cbe50796c089', 'Jean Johnson',   'case_worker'),
  ('4e3c4edb-7cc3-45e7-b808-8c685d144ba1', 'Maitreyee Atul Deshmukh',  'case_worker')
on conflict (id) do update
  set full_name = excluded.full_name,
      role      = excluded.role;

-- ── 2. Clients (12 Demo Records) ─────────────────────────────
insert into public.clients
  (id, first_name, last_name, dob, phone, email, address, created_by)
values
  ('c0000001-0000-0000-0000-000000000001', 'Nobara',  'Kugisaki',  '1985-04-12', '(602) 555-0101', 'nkugisaki@example.com',  '123 Main St, Chandler, AZ 85224',   '6115480a-236d-4de0-952f-cbe50796c089'),
  ('c0000001-0000-0000-0000-000000000002', 'Yuji',    'Itadori',   '1972-09-30', '(602) 555-0102', null,                    '456 Oak Ave, Chandler, AZ 85225',   '6115480a-236d-4de0-952f-cbe50796c089'),
  ('c0000001-0000-0000-0000-000000000003', 'Megumi',  'Fushiguro', '1991-02-18', '(602) 555-0103', 'mfushiguro@example.com', '789 Elm Blvd, Gilbert, AZ 85234',   '4e3c4edb-7cc3-45e7-b808-8c685d144ba1'),
  ('c0000001-0000-0000-0000-000000000004', 'Maki',    'Zen''in',   '1968-11-05', null,             'mzenin@example.com',     '321 Pine St, Mesa, AZ 85201',       '6115480a-236d-4de0-952f-cbe50796c089'),
  ('c0000001-0000-0000-0000-000000000005', 'Toge',    'Inumaki',   '1999-07-22', '(602) 555-0105', 'tinumaki@example.com',   '654 Cedar Rd, Tempe, AZ 85281',     '4e3c4edb-7cc3-45e7-b808-8c685d144ba1'),
  ('c0000001-0000-0000-0000-000000000006', 'Panda',   'Senpai',    '1983-03-14', '(602) 555-0106', 'panda@example.com',      '99 Birch Ln, Chandler, AZ 85226',   '6115480a-236d-4de0-952f-cbe50796c089'),
  ('c0000001-0000-0000-0000-000000000007', 'Utahime', 'Iori',      '2001-12-01', '(602) 555-0107', null,                    '200 Maple Dr, Gilbert, AZ 85296',   '4e3c4edb-7cc3-45e7-b808-8c685d144ba1'),
  ('c0000001-0000-0000-0000-000000000008', 'Aoi',     'Todo',      '1975-06-19', '(602) 555-0108', 'atodo@example.com',      '550 Spruce Way, Mesa, AZ 85202',    '6115480a-236d-4de0-952f-cbe50796c089'),
  ('c0000001-0000-0000-0000-000000000009', 'Mei',     'Mei',       '1994-08-27', '(602) 555-0109', 'mmei@example.com',       '17 Willow Ct, Tempe, AZ 85282',     '4e3c4edb-7cc3-45e7-b808-8c685d144ba1'),
  ('c0000001-0000-0000-0000-000000000010', 'Choso',   'Kamo',      '1989-01-08', null,             'ckamo@example.com',      '403 Aspen Ave, Chandler, AZ 85224', '6115480a-236d-4de0-952f-cbe50796c089'),
  ('c0000001-0000-0000-0000-000000000011', 'Kasumi',  'Miwa',      '2003-05-30', '(602) 555-0111', 'kmiwa@example.com',      '88 Sycamore St, Gilbert, AZ 85233', '4e3c4edb-7cc3-45e7-b808-8c685d144ba1'),
  ('c0000001-0000-0000-0000-000000000012', 'Suguru',  'Geto',      '1960-10-22', '(602) 555-0112', null,                    '77 Juniper Pl, Mesa, AZ 85203',     '6115480a-236d-4de0-952f-cbe50796c089')
on conflict (id) do nothing;

-- ── 3. Visits (History) ─────────────────────────────────────
insert into public.visits
  (client_id, case_worker_id, service_type_id, visit_date, duration_minutes, notes)
values
  -- Nobara Kugisaki
  ('c0000001-0000-0000-0000-000000000001', '6115480a-236d-4de0-952f-cbe50796c089', (select id from public.service_types where name = 'Case Management'),       '2026-03-20', 45, 'Initial intake completed. Client seeking housing assistance for family of 3. Referred to housing coordinator.'),
  ('c0000001-0000-0000-0000-000000000001', '4e3c4edb-7cc3-45e7-b808-8c685d144ba1', (select id from public.service_types where name = 'Food Assistance'),       '2026-03-14', 30, 'Provided 2-week emergency food box. Client scheduled for follow-up pantry visit next week.'),
  
  -- Yuji Itadori
  ('c0000001-0000-0000-0000-000000000002', '6115480a-236d-4de0-952f-cbe50796c089', (select id from public.service_types where name = 'Housing Support'),       '2026-03-18', 50, 'Reviewed housing application status. Documents submitted to county. Awaiting response in 2–3 weeks.'),
  
  -- Megumi Fushiguro
  ('c0000001-0000-0000-0000-000000000003', '4e3c4edb-7cc3-45e7-b808-8c685d144ba1', (select id from public.service_types where name = 'Food Assistance'),        '2026-03-22', 20, 'Monthly food box pickup. Client requested no-pork accommodation. Updated record.'),
  
  -- Toge Inumaki
  ('c0000001-0000-0000-0000-000000000005', '4e3c4edb-7cc3-45e7-b808-8c685d144ba1', (select id from public.service_types where name = 'Mental Health Services'),'2026-03-21', 50, 'Weekly counseling session. Client making progress with anxiety management techniques.');

-- ── 4. Appointments (Future Scheduled) ─────────────────────
insert into public.appointments
  (client_id, case_worker_id, service_type_id, scheduled_at, duration_minutes, notes, status)
values
  -- Monday 2026-03-30
  ('c0000001-0000-0000-0000-000000000001', '6115480a-236d-4de0-952f-cbe50796c089', (select id from public.service_types where name = 'Case Management'),       '2026-03-30T09:00:00', 45, 'Follow-up on housing application submitted last week.',          'scheduled'),
  ('c0000001-0000-0000-0000-000000000005', '4e3c4edb-7cc3-45e7-b808-8c685d144ba1', (select id from public.service_types where name = 'Mental Health Services'),'2026-03-30T10:00:00', 50, 'Weekly session — continue anxiety coping plan.',               'scheduled'),
  
  -- Tuesday 2026-03-31
  ('c0000001-0000-0000-0000-000000000003', '6115480a-236d-4de0-952f-cbe50796c089', (select id from public.service_types where name = 'Employment Support'),     '2026-03-31T10:30:00', 45, 'Job readiness session — resume review and mock interview practice.',   'scheduled'),
  ('c0000001-0000-0000-0000-000000000002', '6115480a-236d-4de0-952f-cbe50796c089', (select id from public.service_types where name = 'Housing Support'),         '2026-03-31T14:00:00', 50, 'County housing application follow-up call.',                           'scheduled'),

  -- Wednesday 2026-04-01
  ('c0000001-0000-0000-0000-000000000004', '6115480a-236d-4de0-952f-cbe50796c089', (select id from public.service_types where name = 'Case Management'),         '2026-04-01T09:30:00', 45, 'Quarterly case review — update service plan.',                         'scheduled'),
  ('c0000001-0000-0000-0000-000000000006', '4e3c4edb-7cc3-45e7-b808-8c685d144ba1', (select id from public.service_types where name = 'Food Assistance'),         '2026-04-01T11:00:00', 20, 'Monthly food box pickup.',                                             'scheduled'),

  -- Thursday 2026-04-02
  ('c0000001-0000-0000-0000-000000000009', '4e3c4edb-7cc3-45e7-b808-8c685d144ba1', (select id from public.service_types where name = 'Mental Health Services'),  '2026-04-02T10:00:00', 50, 'Initial mental health intake assessment.',                             'scheduled'),
  ('c0000001-0000-0000-0000-000000000011', '6115480a-236d-4de0-952f-cbe50796c089', (select id from public.service_types where name = 'Employment Support'),      '2026-04-02T13:30:00', 30, 'Career counseling — explore job training programs.',                   'scheduled');
