import React, { useState, useRef, useEffect } from 'react';
import {
  Eye,
  Edit2,
  Trash2,
  Download,
  Users,
  SearchX,
  RotateCcw,
  Sparkles,
  Layers,
  GraduationCap,
  FileSpreadsheet,
  FileText,
  FileCode,
  ChevronDown,
  Loader2,
  Plus,
  Database
} from 'lucide-react';
import { Student } from '../types';
import { getFullName, formatSectionShort } from '../data/mockStudents';

interface StudentTableProps {
  students: Student[];
  totalDatabaseCount?: number;
  onViewStudent: (student: Student) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (student: Student) => void;
  onClearFilters: () => void;
  onAddStudent?: () => void;
  onExport: (format: 'csv' | 'pdf' | 'docx') => void;
  onExportCSV?: () => void;
  isExporting?: 'csv' | 'pdf' | 'docx' | null;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  totalDatabaseCount,
  onViewStudent,
  onEditStudent,
  onDeleteStudent,
  onClearFilters,
  onAddStudent,
  onExport,
  onExportCSV,
  isExporting = null,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTriggerExport = (format: 'csv' | 'pdf' | 'docx') => {
    setDropdownOpen(false);
    if (onExport) {
      onExport(format);
    } else if (format === 'csv' && onExportCSV) {
      onExportCSV();
    }
  };
  const resultText =
    students.length === 1 ? '1 student found' : `${students.length} students found`;

  const getStatusBadge = (status: Student['status']) => {
    switch (status) {
      case 'Regular':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Regular
          </span>
        );
      case 'Irregular':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Irregular
          </span>
        );
      case 'On Leave':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            On Leave
          </span>
        );
      case 'Graduated':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Graduated
          </span>
        );
    }
  };

  const getCourseBadge = (course: Student['course']) => {
    if (course === 'BSIT') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
          <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
          BSIT
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
        <Layers className="w-3.5 h-3.5 text-teal-600" />
        DIT
      </span>
    );
  };

  // Compute initials for clean university record avatar badge
  const getInitials = (firstName: string, lastName: string) => {
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}`;
  };

  return (
    <div
      id="student-records-container"
      className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden"
    >
      {/* Table Header Card */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Student Records
            </h2>
            <span
              id="student-count-badge"
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200"
            >
              {resultText}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Student List · Official College Roster
          </p>
        </div>

        {/* Action Controls: Export Buttons (CSV, PDF, Word) */}
        <div className="flex items-center gap-2">
          {/* Desktop & Laptop Button Group: [ Export CSV ] [ Export PDF ] [ Export Word ] */}
          <div className="hidden sm:flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 shadow-2xs">
            <button
              id="export-csv-btn"
              onClick={() => handleTriggerExport('csv')}
              disabled={isExporting !== null}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                isExporting === 'csv'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-700 hover:text-emerald-700 bg-white hover:bg-emerald-50/50 border border-slate-200/70 hover:border-emerald-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Export filtered student records as CSV spreadsheet"
            >
              {isExporting === 'csv' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              )}
              <span>Export CSV</span>
            </button>

            <button
              id="export-pdf-btn"
              onClick={() => handleTriggerExport('pdf')}
              disabled={isExporting !== null}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                isExporting === 'pdf'
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-700 hover:text-rose-700 bg-white hover:bg-rose-50/50 border border-slate-200/70 hover:border-rose-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Export filtered student records as PDF document"
            >
              {isExporting === 'pdf' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileText className="w-3.5 h-3.5 text-rose-600" />
              )}
              <span>Export PDF</span>
            </button>

            <button
              id="export-word-btn"
              onClick={() => handleTriggerExport('docx')}
              disabled={isExporting !== null}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                isExporting === 'docx'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-700 hover:text-blue-700 bg-white hover:bg-blue-50/50 border border-slate-200/70 hover:border-blue-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Export filtered student records as Microsoft Word (.DOCX)"
            >
              {isExporting === 'docx' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileCode className="w-3.5 h-3.5 text-blue-600" />
              )}
              <span>Export Word</span>
            </button>
          </div>

          {/* Mobile & Tablet Compact Dropdown: [ Export ▼ ] */}
          <div className="relative sm:hidden" ref={dropdownRef}>
            <button
              id="export-dropdown-mobile-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              disabled={isExporting !== null}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              ) : (
                <Download className="w-4 h-4 text-slate-500" />
              )}
              <span>Export</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Export As
                </div>

                <button
                  id="mobile-export-csv"
                  onClick={() => handleTriggerExport('csv')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors text-left cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>CSV Spreadsheet</span>
                </button>

                <button
                  id="mobile-export-pdf"
                  onClick={() => handleTriggerExport('pdf')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-800 transition-colors text-left cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-rose-600" />
                  <span>PDF Document</span>
                </button>

                <button
                  id="mobile-export-word"
                  onClick={() => handleTriggerExport('docx')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-800 transition-colors text-left cursor-pointer"
                >
                  <FileCode className="w-4 h-4 text-blue-600" />
                  <span>Word (.DOCX)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table Content or Empty State */}
      {students.length === 0 ? (
        totalDatabaseCount === 0 ? (
          /* Empty Database State (Section 15: Clean Database State) */
          <div
            id="student-records-empty-state"
            className="p-12 sm:p-16 text-center flex flex-col items-center justify-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-2xs">
              <Database className="w-7 h-7" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              No student records found.
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm">
              Your Supabase student database is currently clean and empty. Click below to add your first student record.
            </p>
            {onAddStudent && (
              <button
                id="empty-state-add-student-btn"
                onClick={onAddStudent}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Student</span>
              </button>
            )}
          </div>
        ) : (
          /* Filtered Empty State */
          <div
            id="student-records-empty-state"
            className="p-12 sm:p-16 text-center flex flex-col items-center justify-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-4">
              <SearchX className="w-7 h-7" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              No students found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm">
              Try changing your search or filter options to locate matching BSIT or DIT student records.
            </p>
            <button
              id="empty-state-clear-filters-btn"
              onClick={onClearFilters}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs sm:text-sm font-semibold border border-indigo-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear Filters</span>
            </button>
          </div>
        )
      ) : (
        /* Data Table (Section 14 & 15) */
        <div className="overflow-x-auto">
          <table
            id="student-records-data-table"
            className="w-full text-left border-collapse"
          >
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th scope="col" className="py-3.5 pl-5 sm:pl-6 pr-4">
                  Student
                </th>
                <th scope="col" className="py-3.5 px-4">
                  Student ID
                </th>
                <th scope="col" className="py-3.5 px-4">
                  Course
                </th>
                <th scope="col" className="py-3.5 px-4">
                  Year
                </th>
                <th scope="col" className="py-3.5 px-4">
                  Section
                </th>
                <th scope="col" className="py-3.5 px-4">
                  Status
                </th>
                <th scope="col" className="py-3.5 pl-4 pr-5 sm:pr-6 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {students.map((student) => {
                const fullName = getFullName(student);
                const isPrimarySample = student.studentId === '2024-01402';

                return (
                  <tr
                    key={student.id}
                    id={`student-row-${student.id}`}
                    className={`hover:bg-slate-50/90 transition-colors group ${
                      isPrimarySample ? 'bg-indigo-50/20' : ''
                    }`}
                  >
                    {/* Student Column */}
                    <td className="py-4 pl-5 sm:pl-6 pr-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                            student.course === 'BSIT'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-teal-50 text-teal-700 border-teal-200'
                          }`}
                        >
                          {getInitials(student.firstName, student.lastName)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                              {fullName}
                            </span>
                            {isPrimarySample && (
                              <span
                                title="Primary sample student record"
                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200"
                              >
                                <Sparkles className="w-2.5 h-2.5" />
                                Primary Sample
                              </span>
                            )}
                          </div>
                          {/* Program Summary subtext line: BSIT · 3rd Year · Section 3B */}
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {student.course} · {student.yearLevel} · Section {formatSectionShort(student.section)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Student ID Column */}
                    <td className="py-4 px-4 align-middle">
                      <span className="font-mono text-xs font-semibold px-2 py-1 bg-slate-100 rounded-md text-slate-800 border border-slate-200/60">
                        {student.studentId}
                      </span>
                    </td>

                    {/* Course Column */}
                    <td className="py-4 px-4 align-middle">
                      {getCourseBadge(student.course)}
                    </td>

                    {/* Year Column */}
                    <td className="py-4 px-4 align-middle">
                      <span className="text-xs font-medium text-slate-700">
                        {student.yearLevel}
                      </span>
                    </td>

                    {/* Section Column - Only shows year and section (e.g. 3A) */}
                    <td className="py-4 px-4 align-middle">
                      <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/80 font-mono shadow-2xs">
                        {formatSectionShort(student.section)}
                      </span>
                    </td>

                    {/* Status Column */}
                    <td className="py-4 px-4 align-middle">
                      {getStatusBadge(student.status)}
                    </td>

                    {/* Actions Column (Section 17) */}
                    <td className="py-4 pl-4 pr-5 sm:pr-6 align-middle text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* View Button */}
                        <button
                          id={`btn-view-${student.id}`}
                          onClick={() => onViewStudent(student)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="View Student Details"
                          aria-label={`View details for ${fullName}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Button */}
                        <button
                          id={`btn-edit-${student.id}`}
                          onClick={() => onEditStudent(student)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit Student Information"
                          aria-label={`Edit ${fullName}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          id={`btn-delete-${student.id}`}
                          onClick={() => onDeleteStudent(student)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Student Record"
                          aria-label={`Delete ${fullName}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Table Footer Summary */}
      <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <span>
          Showing {students.length} record{students.length === 1 ? '' : 's'} in official BSIT &amp; DIT register
        </span>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            BSIT Program
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            DIT Program
          </span>
        </div>
      </div>
    </div>
  );
};
