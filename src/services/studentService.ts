import { getSupabaseClient } from '../lib/supabase';
import {
  Student,
  DegreeProgram,
  YearLevel,
  StudentStatus,
  ProgramRecord,
  YearLevelRecord,
  SectionRecord
} from '../types';

// ──────────────────────────────────────────────
// EXACT DB ROW SHAPES (matching your SQL schema)
// ──────────────────────────────────────────────

interface ProgramRow {
  id: string;
  program_code: string; // 'BSIT' | 'DIT'
  program_name: string;
}

interface YearLevelRow {
  id: string;
  name: string;      // '1st Year' | '2nd Year' ...
  level_order: number;
}

interface SectionRow {
  id: string;
  program_id: string;
  year_level_id: string;
  section_name: string; // e.g. 'BSIT 3B'
  programs?: ProgramRow | null;
  year_levels?: YearLevelRow | null;
}

interface StudentRow {
  id: string;
  student_id: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  section_id: string;
  email?: string | null;
  contact_number?: string | null;
  status: string;
  created_at?: string;
  updated_at?: string;
  // Joined nested objects
  sections?: SectionRow | null;
}

// ──────────────────────────────────────────────
// IN-MEMORY LOOKUP CACHE
// ──────────────────────────────────────────────

let cachedPrograms: ProgramRow[] = [];
let cachedYearLevels: YearLevelRow[] = [];
let cachedSections: SectionRow[] = [];
let lookupsLoaded = false;

/**
 * Reset the in-memory lookup cache. Called when Supabase credentials change
 * so the next operation fetches fresh data with the new key.
 */
export function resetLookupCache(): void {
  cachedPrograms = [];
  cachedYearLevels = [];
  cachedSections = [];
  lookupsLoaded = false;
}

/**
 * Load programs, year_levels, and sections from Supabase.
 * Cached in memory after first load.
 */
export async function fetchLookupData(force = false): Promise<{
  programs: ProgramRecord[];
  yearLevels: YearLevelRecord[];
  sections: SectionRecord[];
}> {
  const client = getSupabaseClient();

  if ((!lookupsLoaded || force) && client) {
    try {
      const [progRes, yearRes, secRes] = await Promise.all([
        client.from('programs').select('id, program_code, program_name'),
        client.from('year_levels').select('id, name, level_order').order('level_order'),
        client
          .from('sections')
          .select('id, program_id, year_level_id, section_name, programs(id, program_code, program_name), year_levels(id, name, level_order)')
          .order('section_name'),
      ]);

      if (!progRes.error && progRes.data) cachedPrograms = progRes.data as ProgramRow[];
      if (!yearRes.error && yearRes.data) cachedYearLevels = yearRes.data as YearLevelRow[];
      if (!secRes.error && secRes.data) cachedSections = secRes.data as unknown as SectionRow[];

      // Only mark as loaded if we successfully loaded sections
      if (!progRes.error && !yearRes.error && !secRes.error && cachedSections.length > 0) {
        lookupsLoaded = true;
      }
    } catch (err) {
      console.warn('Could not fetch lookup tables:', err);
    }
  }

  return {
    programs: cachedPrograms.map((p) => ({
      id: p.id,
      program_code: p.program_code,
      program_name: p.program_name,
    })),
    yearLevels: cachedYearLevels.map((y) => ({
      id: y.id,
      name: y.name,
      level_order: y.level_order,
    })),
    sections: cachedSections.map((s) => ({
      id: s.id,
      program_id: s.program_id,
      year_level_id: s.year_level_id,
      section_name: s.section_name,
    })),
  };
}

/**
 * Map a StudentRow (with nested sections > programs & year_levels) to the UI Student model.
 * students → section_id → sections → (programs, year_levels)
 */
function mapRowToStudent(row: StudentRow): Student {
  const sec = row.sections;
  const prog = sec?.programs;
  const yr = sec?.year_levels;

  // Derive course from programs.program_code
  const rawCode = prog?.program_code?.toUpperCase() ?? '';
  const course: DegreeProgram = rawCode === 'DIT' ? 'DIT' : 'BSIT';

  // Derive yearLevel from year_levels.name
  const yearName = yr?.name ?? '';
  const validYears: YearLevel[] = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const yearLevel: YearLevel = validYears.includes(yearName as YearLevel)
    ? (yearName as YearLevel)
    : '1st Year';

  // Section display name from sections.section_name
  const section = sec?.section_name ?? `${course} 1A`;

  // Status
  const validStatuses: StudentStatus[] = ['Regular', 'Irregular', 'On Leave', 'Graduated'];
  const status: StudentStatus = validStatuses.includes(row.status as StudentStatus)
    ? (row.status as StudentStatus)
    : 'Regular';

  return {
    id: row.id,
    studentId: row.student_id,
    firstName: row.first_name,
    middleName: row.middle_name ?? undefined,
    lastName: row.last_name,
    course,
    yearLevel,
    section,
    status,
    email: row.email ?? undefined,
    contactNumber: row.contact_number ?? undefined,
    sectionId: row.section_id,
    programId: prog?.id,
    yearLevelId: yr?.id,
  };
}

/**
 * Resolve the UUID for a section by matching section_name in the sections cache.
 * If not found in cache, refetch from Supabase.
 */
async function resolveSectionId(sectionName: string): Promise<string | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  // Ensure lookups are loaded
  await fetchLookupData();

  const cleanInput = sectionName.trim().toLowerCase();

  // Search by exact or case-insensitive section_name (e.g. 'BSIT 3B')
  let match = cachedSections.find(
    (s) => s.section_name.trim().toLowerCase() === cleanInput
  );

  if (!match) {
    // Force a fresh fetch
    await fetchLookupData(true);
    match = cachedSections.find(
      (s) => s.section_name.trim().toLowerCase() === cleanInput
    );
  }

  return match?.id ?? null;
}

// ──────────────────────────────────────────────
// CRUD OPERATIONS
// ──────────────────────────────────────────────

/**
 * Fetch all students with full joins:
 * students → sections → programs, year_levels
 */
export async function fetchStudents(): Promise<{
  data: Student[];
  error: string | null;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      data: [],
      error: 'Unable to connect to the database. Please check your Supabase credentials in Settings.',
    };
  }

  try {
    // Pre-load lookups
    await fetchLookupData();

    const { data, error } = await client
      .from('students')
      .select(`
        id,
        student_id,
        first_name,
        middle_name,
        last_name,
        section_id,
        email,
        contact_number,
        status,
        created_at,
        sections (
          id,
          section_name,
          program_id,
          year_level_id,
          programs (
            id,
            program_code,
            program_name
          ),
          year_levels (
            id,
            name,
            level_order
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetchStudents error:', error);
      if (error.code === '42P01') {
        return {
          data: [],
          error: 'The "students" table does not exist in Supabase yet. Please run the SQL schema.',
        };
      }
      return {
        data: [],
        error: 'Unable to connect to the database. Please try again.',
      };
    }

    const students = (data as unknown as StudentRow[]).map(mapRowToStudent);
    return { data: students, error: null };
  } catch (err: any) {
    console.error('fetchStudents exception:', err);
    return {
      data: [],
      error: 'Unable to connect to the database. Please try again.',
    };
  }
}

/**
 * Add a new student record.
 * Resolves section_id from the sections table using the section name.
 */
export async function addStudent(
  studentData: Omit<Student, 'id'>
): Promise<{
  data: Student | null;
  error: string | null;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      data: null,
      error: 'Unable to connect to the database. Please configure Supabase in Settings.',
    };
  }

  try {
    const sectionId = await resolveSectionId(studentData.section);
    if (!sectionId) {
      return {
        data: null,
        error: `Section "${studentData.section}" was not found in the database. Please check the Sections table.`,
      };
    }

    const payload = {
      student_id: studentData.studentId,
      first_name: studentData.firstName,
      middle_name: studentData.middleName || null,
      last_name: studentData.lastName,
      section_id: sectionId,
      email: studentData.email || null,
      contact_number: studentData.contactNumber || null,
      status: studentData.status,
    };

    const { data, error } = await client
      .from('students')
      .insert([payload])
      .select(`
        id, student_id, first_name, middle_name, last_name,
        section_id, email, contact_number, status, created_at,
        sections (
          id, section_name, program_id, year_level_id,
          programs ( id, program_code, program_name ),
          year_levels ( id, name, level_order )
        )
      `)
      .single();

    if (error) {
      console.error('Supabase addStudent error:', error);
      if (error.code === '23505') {
        return {
          data: null,
          error: `Student ID "${studentData.studentId}" is already registered.`,
        };
      }
      return { data: null, error: 'Unable to add student.' };
    }

    return { data: mapRowToStudent(data as unknown as StudentRow), error: null };
  } catch (err: any) {
    console.error('addStudent exception:', err);
    return { data: null, error: 'Unable to add student.' };
  }
}

/**
 * Update an existing student record.
 * Re-resolves section_id if section changed.
 */
export async function updateStudent(
  id: string,
  studentData: Omit<Student, 'id'>
): Promise<{
  data: Student | null;
  error: string | null;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      data: null,
      error: 'Unable to connect to the database. Please check your connection.',
    };
  }

  try {
    const sectionId = await resolveSectionId(studentData.section);
    if (!sectionId) {
      return {
        data: null,
        error: `Section "${studentData.section}" was not found in the database.`,
      };
    }

    const payload = {
      student_id: studentData.studentId,
      first_name: studentData.firstName,
      middle_name: studentData.middleName || null,
      last_name: studentData.lastName,
      section_id: sectionId,
      email: studentData.email || null,
      contact_number: studentData.contactNumber || null,
      status: studentData.status,
    };

    const { data, error } = await client
      .from('students')
      .update(payload)
      .eq('id', id)
      .select(`
        id, student_id, first_name, middle_name, last_name,
        section_id, email, contact_number, status, created_at,
        sections (
          id, section_name, program_id, year_level_id,
          programs ( id, program_code, program_name ),
          year_levels ( id, name, level_order )
        )
      `)
      .single();

    if (error) {
      console.error('Supabase updateStudent error:', error);
      return { data: null, error: 'Unable to update student.' };
    }

    return { data: mapRowToStudent(data as unknown as StudentRow), error: null };
  } catch (err: any) {
    console.error('updateStudent exception:', err);
    return { data: null, error: 'Unable to update student.' };
  }
}

/**
 * Delete a single student record by id.
 */
export async function deleteStudent(id: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      error: 'Unable to connect to the database. Please check your connection.',
    };
  }

  try {
    const { error } = await client.from('students').delete().eq('id', id);
    if (error) {
      console.error('Supabase deleteStudent error:', error);
      return { success: false, error: 'Unable to delete student.' };
    }
    return { success: true, error: null };
  } catch (err: any) {
    console.error('deleteStudent exception:', err);
    return { success: false, error: 'Unable to delete student.' };
  }
}

/**
 * Delete ALL student records (used by the "Reset Database" button in Settings).
 */
export async function deleteAllStudents(): Promise<{
  success: boolean;
  count: number;
  error: string | null;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      count: 0,
      error: 'Unable to connect to the database. Please check your connection.',
    };
  }

  try {
    // PostgREST requires a filter to allow DELETE without a WHERE clause
    const { data, error } = await client
      .from('students')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
      .select('id');

    if (error) {
      console.error('Supabase deleteAllStudents error:', error);
      return {
        success: false,
        count: 0,
        error: error.message || 'Unable to delete all student records.',
      };
    }

    return {
      success: true,
      count: Array.isArray(data) ? data.length : 0,
      error: null,
    };
  } catch (err: any) {
    console.error('deleteAllStudents exception:', err);
    return {
      success: false,
      count: 0,
      error: err?.message || 'Unable to delete all student records.',
    };
  }
}
