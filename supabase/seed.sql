-- ============================================================
-- BSIT / DIT STUDENT MANAGEMENT SYSTEM
-- SEED FILE: programs, year_levels, sections
-- Run this ONCE in Supabase SQL Editor to populate lookup tables
-- ============================================================

-- 1. PROGRAMS
INSERT INTO public.programs (program_code, program_name) VALUES
  ('BSIT', 'Bachelor of Science in Information Technology'),
  ('DIT',  'Diploma in Information Technology')
ON CONFLICT (program_code) DO NOTHING;

-- 2. YEAR LEVELS
INSERT INTO public.year_levels (name, level_order) VALUES
  ('1st Year', 1),
  ('2nd Year', 2),
  ('3rd Year', 3),
  ('4th Year', 4)
ON CONFLICT (name) DO NOTHING;

-- 3. SECTIONS
-- BSIT: 4 years x 3 sections (A, B, C) = 12 sections
INSERT INTO public.sections (program_id, year_level_id, section_name)
SELECT
  p.id,
  y.id,
  p.program_code || ' ' || y.level_order || sec.letter
FROM public.programs p
CROSS JOIN public.year_levels y
CROSS JOIN (VALUES ('A'), ('B'), ('C')) AS sec(letter)
WHERE p.program_code = 'BSIT'
ON CONFLICT DO NOTHING;

-- DIT: 3 years x 3 sections (A, B, C) = 9 sections (DIT is a 3-year diploma)
INSERT INTO public.sections (program_id, year_level_id, section_name)
SELECT
  p.id,
  y.id,
  p.program_code || ' ' || y.level_order || sec.letter
FROM public.programs p
CROSS JOIN public.year_levels y
CROSS JOIN (VALUES ('A'), ('B'), ('C')) AS sec(letter)
WHERE p.program_code = 'DIT'
  AND y.level_order <= 3
ON CONFLICT DO NOTHING;

-- 4. ADMIN USER ACCOUNTS (for System Login)
INSERT INTO public.admin_users (username, email, password_hash, full_name, role, is_active)
VALUES (
  'admin',
  'admin@dssc.edu.ph',
  'bsitdit_2026',
  'System Administrator',
  'Super Admin',
  true
)
ON CONFLICT (username) DO UPDATE
SET email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    is_active = true;

-- VERIFY (should show: programs=2, year_levels=4, sections=21, admin_users>=1)
SELECT 'programs'       AS tbl, COUNT(*) AS rows FROM public.programs
UNION ALL
SELECT 'year_levels',           COUNT(*)         FROM public.year_levels
UNION ALL
SELECT 'sections',              COUNT(*)         FROM public.sections
UNION ALL
SELECT 'students',              COUNT(*)         FROM public.students
UNION ALL
SELECT 'admin_users',           COUNT(*)         FROM public.admin_users;
