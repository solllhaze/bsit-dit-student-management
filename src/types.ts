export type DegreeProgram = 'BSIT' | 'DIT';

export type YearLevel = '1st Year' | '2nd Year' | '3rd Year' | '4th Year';

export type StudentStatus = 'Regular' | 'Irregular' | 'On Leave' | 'Graduated';

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
