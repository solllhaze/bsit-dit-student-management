-- ============================================
-- BSIT / DIT STUDENT MANAGEMENT SYSTEM
-- EXACT NORMALIZED DATABASE SCHEMA
-- ============================================

-- 1. Create PROGRAMS table
CREATE TABLE IF NOT EXISTS public.programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_code TEXT NOT NULL UNIQUE,
    program_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create YEAR LEVELS table
CREATE TABLE IF NOT EXISTS public.year_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    level_order INTEGER NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Create SECTIONS table
CREATE TABLE IF NOT EXISTS public.sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL
        REFERENCES public.programs(id)
        ON DELETE RESTRICT,
    year_level_id UUID NOT NULL
        REFERENCES public.year_levels(id)
        ON DELETE RESTRICT,
    section_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    UNIQUE(program_id, year_level_id, section_name)
);

-- 4. Create the normalized STUDENTS table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    middle_name TEXT,
    last_name TEXT NOT NULL,
    section_id UUID NOT NULL
        REFERENCES public.sections(id)
        ON DELETE RESTRICT,
    email TEXT,
    contact_number TEXT,
    status TEXT NOT NULL DEFAULT 'Regular',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_students_student_id ON public.students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_section_id ON public.students(section_id);
CREATE INDEX IF NOT EXISTS idx_sections_program_id ON public.sections(program_id);
CREATE INDEX IF NOT EXISTS idx_sections_year_level_id ON public.sections(year_level_id);

-- 6. Seed Programs
INSERT INTO public.programs (program_code, program_name)
VALUES
    ('BSIT', 'Bachelor of Science in Information Technology'),
    ('DIT', 'Diploma in Information Technology')
ON CONFLICT (program_code) DO NOTHING;

-- 7. Seed Year Levels
INSERT INTO public.year_levels (name, level_order)
VALUES
    ('1st Year', 1),
    ('2nd Year', 2),
    ('3rd Year', 3),
    ('4th Year', 4)
ON CONFLICT (name) DO NOTHING;

-- 8. Seed Sections (Linking Programs and Year Levels)
DO $$
DECLARE
    bsit_id UUID;
    dit_id UUID;
    y1_id UUID;
    y2_id UUID;
    y3_id UUID;
    y4_id UUID;
BEGIN
    SELECT id INTO bsit_id FROM public.programs WHERE program_code = 'BSIT';
    SELECT id INTO dit_id FROM public.programs WHERE program_code = 'DIT';
    SELECT id INTO y1_id FROM public.year_levels WHERE name = '1st Year';
    SELECT id INTO y2_id FROM public.year_levels WHERE name = '2nd Year';
    SELECT id INTO y3_id FROM public.year_levels WHERE name = '3rd Year';
    SELECT id INTO y4_id FROM public.year_levels WHERE name = '4th Year';

    -- BSIT Sections
    IF bsit_id IS NOT NULL THEN
        IF y1_id IS NOT NULL THEN
            INSERT INTO public.sections (program_id, year_level_id, section_name) VALUES
                (bsit_id, y1_id, 'BSIT 1A'), (bsit_id, y1_id, 'BSIT 1B'), (bsit_id, y1_id, 'BSIT 1C')
            ON CONFLICT (program_id, year_level_id, section_name) DO NOTHING;
        END IF;
        IF y2_id IS NOT NULL THEN
            INSERT INTO public.sections (program_id, year_level_id, section_name) VALUES
                (bsit_id, y2_id, 'BSIT 2A'), (bsit_id, y2_id, 'BSIT 2B'), (bsit_id, y2_id, 'BSIT 2C')
            ON CONFLICT (program_id, year_level_id, section_name) DO NOTHING;
        END IF;
        IF y3_id IS NOT NULL THEN
            INSERT INTO public.sections (program_id, year_level_id, section_name) VALUES
                (bsit_id, y3_id, 'BSIT 3A'), (bsit_id, y3_id, 'BSIT 3B'), (bsit_id, y3_id, 'BSIT 3C')
            ON CONFLICT (program_id, year_level_id, section_name) DO NOTHING;
        END IF;
        IF y4_id IS NOT NULL THEN
            INSERT INTO public.sections (program_id, year_level_id, section_name) VALUES
                (bsit_id, y4_id, 'BSIT 4A'), (bsit_id, y4_id, 'BSIT 4B'), (bsit_id, y4_id, 'BSIT 4C')
            ON CONFLICT (program_id, year_level_id, section_name) DO NOTHING;
        END IF;
    END IF;

    -- DIT Sections
    IF dit_id IS NOT NULL THEN
        IF y1_id IS NOT NULL THEN
            INSERT INTO public.sections (program_id, year_level_id, section_name) VALUES
                (dit_id, y1_id, 'DIT 1A'), (dit_id, y1_id, 'DIT 1B'), (dit_id, y1_id, 'DIT 1C')
            ON CONFLICT (program_id, year_level_id, section_name) DO NOTHING;
        END IF;
        IF y2_id IS NOT NULL THEN
            INSERT INTO public.sections (program_id, year_level_id, section_name) VALUES
                (dit_id, y2_id, 'DIT 2A'), (dit_id, y2_id, 'DIT 2B'), (dit_id, y2_id, 'DIT 2C')
            ON CONFLICT (program_id, year_level_id, section_name) DO NOTHING;
        END IF;
        IF y3_id IS NOT NULL THEN
            INSERT INTO public.sections (program_id, year_level_id, section_name) VALUES
                (dit_id, y3_id, 'DIT 3A'), (dit_id, y3_id, 'DIT 3B'), (dit_id, y3_id, 'DIT 3C')
            ON CONFLICT (program_id, year_level_id, section_name) DO NOTHING;
        END IF;
    END IF;
END $$;

-- 9. Row Level Security & Policies
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.year_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Programs policies
DROP POLICY IF EXISTS "Allow anon select on programs" ON public.programs;
CREATE POLICY "Allow anon select on programs" ON public.programs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Allow anon insert on programs" ON public.programs;
CREATE POLICY "Allow anon insert on programs" ON public.programs FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Year levels policies
DROP POLICY IF EXISTS "Allow anon select on year_levels" ON public.year_levels;
CREATE POLICY "Allow anon select on year_levels" ON public.year_levels FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Allow anon insert on year_levels" ON public.year_levels;
CREATE POLICY "Allow anon insert on year_levels" ON public.year_levels FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Sections policies
DROP POLICY IF EXISTS "Allow anon select on sections" ON public.sections;
CREATE POLICY "Allow anon select on sections" ON public.sections FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Allow anon insert on sections" ON public.sections;
CREATE POLICY "Allow anon insert on sections" ON public.sections FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Students policies
DROP POLICY IF EXISTS "Allow anon select on students" ON public.students;
CREATE POLICY "Allow anon select on students" ON public.students FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow anon insert on students" ON public.students;
CREATE POLICY "Allow anon insert on students" ON public.students FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update on students" ON public.students;
CREATE POLICY "Allow anon update on students" ON public.students FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon delete on students" ON public.students;
CREATE POLICY "Allow anon delete on students" ON public.students FOR DELETE TO anon, authenticated USING (true);
