import React from 'react';
import {
  X,
  Edit2,
  GraduationCap,
  Layers,
  IdCard,
  Calendar,
  BookmarkCheck,
  CheckCircle2,
  Mail,
  Phone
} from 'lucide-react';
import { Student } from '../types';
import { getFullName, formatSectionShort } from '../data/mockStudents';
import { getStudentEmail, getStudentContact } from '../utils/exportUtils';

interface StudentDetailsModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (student: Student) => void;
}

export const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({
  student,
  isOpen,
  onClose,
  onEdit,
}) => {
  if (!isOpen || !student) return null;

  const fullName = getFullName(student);

  return (
    <div
      id="student-details-drawer-wrapper"
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-details-heading"
    >
      {/* Backdrop */}
      <div
        id="details-backdrop"
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        {/* Right-Side Slide-Over Panel (Desktop max-w-md, doesn't take over full screen) */}
        <div
          id="student-details-panel"
          className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200"
        >
          {/* Header */}
          <div>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h2
                    id="student-details-heading"
                    className="text-base font-bold text-slate-900 tracking-tight"
                  >
                    Student Details
                  </h2>
                  <p className="text-xs text-slate-500">
                    Official BSIT / DIT Student Profile
                  </p>
                </div>
              </div>

              <button
                id="close-details-btn"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Close details panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Header Card */}
            <div className="p-6 pb-2">
              <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/80 shadow-xs text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-900 text-white font-bold text-xl flex items-center justify-center shadow-md shadow-indigo-900/10 mb-3">
                  {student.firstName.charAt(0)}
                  {student.lastName.charAt(0)}
                </div>
                <h3
                  id="student-details-fullname"
                  className="text-lg font-extrabold text-slate-900 tracking-tight"
                >
                  {fullName}
                </h3>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <IdCard className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Student ID: {student.studentId}</span>
                </div>
              </div>
            </div>

            {/* Display Fields - Strictly Only Provided Information (Section 18 & 16) */}
            <div className="px-6 py-4 space-y-4">
              {/* Field 1: Student ID */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                  Student ID
                </span>
                <span className="text-sm font-semibold font-mono text-slate-900 mt-0.5 block">
                  {student.studentId}
                </span>
              </div>

              {/* Field 2: Course */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                  Course
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold ${
                      student.course === 'BSIT'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-teal-100 text-teal-800'
                    }`}
                  >
                    {student.course === 'BSIT' ? (
                      <GraduationCap className="w-3.5 h-3.5" />
                    ) : (
                      <Layers className="w-3.5 h-3.5" />
                    )}
                    {student.course}
                  </span>
                  <span className="text-xs text-slate-600">
                    {student.course === 'BSIT'
                      ? 'Bachelor of Science in Information Technology'
                      : 'Diploma in Information Technology'}
                  </span>
                </div>
              </div>

              {/* Field 3: Year Level */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                  Year Level
                </span>
                <span className="text-sm font-semibold text-slate-900 mt-0.5 block">
                  {student.yearLevel}
                </span>
              </div>

              {/* Field 4: Section - Only shows year and section (e.g. 3A) */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                  Section
                </span>
                <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block">
                  {formatSectionShort(student.section)}
                </span>
              </div>

              {/* Field 5: Status */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                  Status
                </span>
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {student.status}
                  </span>
                </div>
              </div>

              {/* Field 6: Institutional Email */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 sm:col-span-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Institutional Email</span>
                </span>
                <span className="text-sm font-semibold text-slate-900 mt-0.5 block font-mono">
                  {getStudentEmail(student)}
                </span>
              </div>

              {/* Field 7: Contact Number */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Contact Number</span>
                </span>
                <span className="text-sm font-semibold text-slate-900 mt-0.5 block font-mono">
                  {getStudentContact(student)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Actions (Section 18): Edit Student and Close */}
          <div className="p-6 border-t border-slate-200 bg-slate-50/70 flex items-center justify-end gap-3">
            <button
              id="details-close-btn"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              Close
            </button>
            <button
              id="details-edit-student-btn"
              onClick={() => {
                onClose();
                onEdit(student);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-all"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Student</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
