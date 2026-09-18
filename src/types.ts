export type DegreeProgram = 'BSIT' | 'DIT';

export type YearLevel = '1st Year' | '2nd Year' | '3rd Year' | '4th Year';

export type StudentStatus = 'Regular' | 'Irregular' | 'On Leave' | 'Graduated';

export interface ProgramRecord {
  id: string;
  program_code: string;
  program_name: string;
}

export interface YearLevelRecord {
  id: string;
  name: string;
  level_order: number;
}

export interface SectionRecord {
  id: string;
  program_id: string;
  year_level_id: string;
  section_name: string;
  programs?: ProgramRecord;
  year_levels?: YearLevelRecord;
}

export interface Student {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  studentId: string;
  course: DegreeProgram;
  yearLevel: YearLevel;
  section: string;
  status: StudentStatus;
  email?: string;
  contactNumber?: string;
  sectionId?: string;
  programId?: string;
  yearLevelId?: string;
}

export interface FilterState {
  search: string;
  course: 'All' | DegreeProgram;
  year: 'All' | YearLevel;
  section: string;
  status: 'All' | StudentStatus;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email?: string;
  fullName: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  success: boolean;
  user?: AdminUser;
  error?: string;
  isTableMissing?: boolean;
  sqlToRun?: string;
}

