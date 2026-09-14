import { Student } from '../types';

/**
 * INITIAL_STUDENTS is intentionally empty so the application connects directly
 * to live records in Supabase and displays the clean empty state when no students exist.
 */
export const INITIAL_STUDENTS: Student[] = [];

export const ALL_BSIT_SECTIONS = [
  'BSIT 1A',
  'BSIT 1B',
  'BSIT 1C',
  'BSIT 2A',
  'BSIT 2B',
  'BSIT 2C',
  'BSIT 3A',
  'BSIT 3B',
  'BSIT 3C',
  'BSIT 4A',
  'BSIT 4B',
  'BSIT 4C'
];

export const ALL_DIT_SECTIONS = [
  'DIT 1A',
  'DIT 1B',
  'DIT 1C',
  'DIT 2A',
  'DIT 2B',
  'DIT 2C',
  'DIT 3A',
  'DIT 3B',
  'DIT 3C'
];

export const AVAILABLE_SECTIONS = [
  'All Sections',
  'BSIT 1A',
  'BSIT 1B',
  'BSIT 1C',
  'BSIT 2A',
  'BSIT 2B',
  'BSIT 2C',
  'BSIT 3A',
  'BSIT 3B',
  'BSIT 3C',
  'BSIT 4A',
  'BSIT 4B',
  'BSIT 4C',
  'DIT 1A',
  'DIT 1B',
  'DIT 1C',
  'DIT 2A',
  'DIT 2B',
  'DIT 2C',
  'DIT 3A',
  'DIT 3B',
  'DIT 3C'
];

export const getFullName = (student: { firstName: string; middleName?: string; lastName: string }): string => {
  const parts = [student.firstName.trim()];
  if (student.middleName && student.middleName.trim()) {
    parts.push(student.middleName.trim());
  }
  if (student.lastName && student.lastName.trim()) {
    parts.push(student.lastName.trim());
  }
  return parts.join(' ');
};

/**
 * Formats a section string to only show the year and section (e.g. "BSIT 3A" -> "3A", "DIT 2B" -> "2B")
 */
export const formatSectionShort = (section: string): string => {
  if (!section) return '';
  const match = section.match(/(\d+)[ -]*([A-Za-z]+)/);
  if (match) {
    return `${match[1]}${match[2].toUpperCase()}`;
  }
  return section.replace(/^(BSIT|DIT)[ -]*/i, '').trim() || section;
};

/**
 * Format student name for official masterlists:
 * Lastname, Firstname, Initial
 * e.g. "Cabanting, Hazel Jane C." or "Dizon, Dennis J." or "Fernandez, Dolly"
 */
export const formatOfficialName = (student: {
  firstName: string;
  middleName?: string;
  lastName: string;
}): string => {
  const last = student.lastName ? student.lastName.trim() : '';
  const first = student.firstName ? student.firstName.trim() : '';
  let initial = '';

  if (student.middleName && student.middleName.trim()) {
    const rawMiddle = student.middleName.trim();
    const clean = rawMiddle.replace(/\./g, '').trim();
    if (clean.length > 0) {
      initial = `${clean[0].toUpperCase()}.`;
    }
  }

  if (last && first) {
    return initial ? `${last}, ${first} ${initial}` : `${last}, ${first}`;
  } else if (last) {
    return last;
  } else if (first) {
    return initial ? `${first} ${initial}` : first;
  }
  return '';
};
