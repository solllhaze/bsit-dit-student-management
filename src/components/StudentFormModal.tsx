import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  Edit3,
  AlertCircle,
  GraduationCap,
  Layers,
  Check,
  Mail,
  Phone
} from 'lucide-react';
import { Student, DegreeProgram, YearLevel, StudentStatus } from '../types';
import { ALL_BSIT_SECTIONS, ALL_DIT_SECTIONS } from '../data/mockStudents';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentData: Omit<Student, 'id'>, existingId?: string) => void;
  initialData?: Student | null;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const isEditing = Boolean(initialData);

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [course, setCourse] = useState<DegreeProgram>('BSIT');
  const [yearLevel, setYearLevel] = useState<YearLevel>('1st Year');
  const [section, setSection] = useState('BSIT 1A');
  const [status, setStatus] = useState<StudentStatus>('Regular');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    studentId?: string;
    section?: string;
  }>({});

  useEffect(() => {
    if (initialData) {
      setFirstName(initialData.firstName);
      setMiddleName(initialData.middleName || '');
      setLastName(initialData.lastName);
      setStudentId(initialData.studentId);
      setCourse(initialData.course);
      setYearLevel(initialData.yearLevel);
      setSection(initialData.section);
      setStatus(initialData.status);
      setEmail(initialData.email || '');
      setContactNumber(initialData.contactNumber || '');
    } else {
      // Default initial state for Add Student (default to BSIT 1A)
      setFirstName('');
      setMiddleName('');
      setLastName('');
      setStudentId('2024-');
      setCourse('BSIT');
      setYearLevel('1st Year');
      setSection('BSIT 1A');
      setStatus('Regular');
      setEmail('');
      setContactNumber('');
    }
    setErrors({});
  }, [initialData, isOpen]);

  // When Course or YearLevel changes, update candidate section
  const handleCourseChange = (newCourse: DegreeProgram) => {
    setCourse(newCourse);
    const yrNum = yearLevel.charAt(0);
    const candidate = `${newCourse} ${yrNum}A`;
    const available = newCourse === 'BSIT' ? ALL_BSIT_SECTIONS : ALL_DIT_SECTIONS;
    if (available.includes(candidate)) {
      setSection(candidate);
    } else {
      setSection(available[0]);
    }
  };

  const handleYearChange = (newYear: YearLevel) => {
    setYearLevel(newYear);
    const yrNum = newYear.charAt(0);
    const candidate = `${course} ${yrNum}A`;
    const available = course === 'BSIT' ? ALL_BSIT_SECTIONS : ALL_DIT_SECTIONS;
    if (available.includes(candidate)) {
      setSection(candidate);
    } else if (available.includes(`${course} ${yrNum}B`)) {
      setSection(`${course} ${yrNum}B`);
    } else {
      setSection(available[0]);
    }
  };

  // When user selects a section, automatically sync Course & Year Level
  const handleSectionSelect = (newSection: string) => {
    setSection(newSection);
    // Sync Course
    if (newSection.startsWith('BSIT')) {
      setCourse('BSIT');
    } else if (newSection.startsWith('DIT')) {
      setCourse('DIT');
    }
    // Sync Year
    if (newSection.includes(' 1')) {
      setYearLevel('1st Year');
    } else if (newSection.includes(' 2')) {
      setYearLevel('2nd Year');
    } else if (newSection.includes(' 3')) {
      setYearLevel('3rd Year');
    } else if (newSection.includes(' 4')) {
      setYearLevel('4th Year');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: {
      firstName?: string;
      lastName?: string;
      studentId?: string;
      section?: string;
    } = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First Name is required.';
    }
    if (!lastName.trim()) {
      newErrors.lastName = 'Last Name is required.';
    }
    if (!studentId.trim()) {
      newErrors.studentId = 'Student ID is required.';
    }
    if (!section.trim()) {
      newErrors.section = 'Section is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(
      {
        firstName: firstName.trim(),
        middleName: middleName.trim() || undefined,
        lastName: lastName.trim(),
        studentId: studentId.trim(),
        course,
        yearLevel,
        section: section.trim(),
        status,
        email: email.trim() || undefined,
        contactNumber: contactNumber.trim() || undefined,
      },
      initialData?.id
    );

    onClose();
  };

  const currentProgramSections = course === 'BSIT' ? ALL_BSIT_SECTIONS : ALL_DIT_SECTIONS;
  const otherProgramSections = course === 'BSIT' ? ALL_DIT_SECTIONS : ALL_BSIT_SECTIONS;

  return (
    <div
      id="student-form-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="student-form-modal-container"
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isEditing
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-indigo-100 text-indigo-700'
              }`}
            >
              {isEditing ? (
                <Edit3 className="w-5 h-5" />
              ) : (
                <UserPlus className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isEditing ? 'Edit Student Information' : 'Add New Student'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEditing
                  ? 'Update verified academic registry record'
                  : 'Enroll and register a new BSIT or DIT student'}
              </p>
            </div>
          </div>
          <button
            id="btn-close-student-form"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Degree Program Selector (BSIT vs DIT) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Degree Program <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                id="btn-form-select-bsit"
                onClick={() => handleCourseChange('BSIT')}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  course === 'BSIT'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 text-indigo-950 font-bold'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 text-slate-700 font-medium'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    course === 'BSIT'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm">BSIT</div>
                  <div className="text-[11px] text-slate-500 font-normal">
                    Bachelor of Science in IT
                  </div>
                </div>
                {course === 'BSIT' && (
                  <Check className="w-4 h-4 text-indigo-600 ml-auto" />
                )}
              </button>

              <button
                type="button"
                id="btn-form-select-dit"
                onClick={() => handleCourseChange('DIT')}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  course === 'DIT'
                    ? 'border-teal-600 bg-teal-50/60 ring-2 ring-teal-500/20 text-teal-950 font-bold'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 text-slate-700 font-medium'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    course === 'DIT'
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm">DIT</div>
                  <div className="text-[11px] text-slate-500 font-normal">
                    Diploma in IT (3-Year Track)
                  </div>
                </div>
                {course === 'DIT' && (
                  <Check className="w-4 h-4 text-teal-600 ml-auto" />
                )}
              </button>
            </div>
          </div>

          {/* Student ID Field */}
          <div>
            <label
              htmlFor="field-student-id"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Student ID <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="field-student-id"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="e.g. 2024-01402"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 transition-all font-mono ${
                errors.studentId
                  ? 'border-rose-400 focus:ring-rose-400/20'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
              }`}
            />
            {errors.studentId && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.studentId}
              </p>
            )}
          </div>

          {/* Name Fields: First, Middle, Last */}
          <div className="space-y-3">
            <div>
              <label
                htmlFor="field-first-name"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                First Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="field-first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Hazel Jane"
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 transition-all ${
                  errors.firstName
                    ? 'border-rose-400 focus:ring-rose-400/20'
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                }`}
              />
              {errors.firstName && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.firstName}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="field-middle-name"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Middle Name
                </label>
                <input
                  type="text"
                  id="field-middle-name"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  placeholder="e.g. Cabanilla"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="field-last-name"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="field-last-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Cabanting"
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 transition-all ${
                    errors.lastName
                      ? 'border-rose-400 focus:ring-rose-400/20'
                      : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                  }`}
                />
                {errors.lastName && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Academic Placement: Year Level, Section Dropdown, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            {/* Year Level */}
            <div>
              <label
                htmlFor="field-year-level"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Year Level <span className="text-rose-500">*</span>
              </label>
              <select
                id="field-year-level"
                value={yearLevel}
                onChange={(e) => handleYearChange(e.target.value as YearLevel)}
                className="w-full px-3 py-2.5 text-sm font-medium rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>

            {/* Section DROPDOWN (BSIT 1A, 1B, 1C, etc.) */}
            <div>
              <label
                htmlFor="field-section-select"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Section <span className="text-rose-500">*</span>
              </label>
              <select
                id="field-section-select"
                value={section}
                onChange={(e) => handleSectionSelect(e.target.value)}
                className={`w-full px-3 py-2.5 text-sm font-medium rounded-xl border bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 transition-all ${
                  errors.section
                    ? 'border-rose-400 focus:ring-rose-400/20'
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                }`}
              >
                <optgroup label={`${course} Sections`}>
                  {currentProgramSections.map((secOpt) => (
                    <option key={secOpt} value={secOpt}>
                      {secOpt}
                    </option>
                  ))}
                </optgroup>
                <optgroup label={`Other Sections (${course === 'BSIT' ? 'DIT' : 'BSIT'})`}>
                  {otherProgramSections.map((secOpt) => (
                    <option key={secOpt} value={secOpt}>
                      {secOpt}
                    </option>
                  ))}
                </optgroup>
              </select>
              {errors.section && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.section}
                </p>
              )}
            </div>

            {/* Student Status */}
            <div>
              <label
                htmlFor="field-status"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Student Status <span className="text-rose-500">*</span>
              </label>
              <select
                id="field-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as StudentStatus)}
                className="w-full px-3 py-2.5 text-sm font-medium rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              >
                <option value="Regular">Regular</option>
                <option value="Irregular">Irregular</option>
                <option value="On Leave">On Leave</option>
                <option value="Graduated">Graduated</option>
              </select>
            </div>
          </div>

          {/* Contact Information (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label
                htmlFor="field-email"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email Address</span>
                <span className="text-slate-400 font-normal text-[10px] lowercase">(optional)</span>
              </label>
              <input
                type="email"
                id="field-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. hazel.cabanting@student.college.edu"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="field-contact-number"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Contact Number</span>
                <span className="text-slate-400 font-normal text-[10px] lowercase">(optional)</span>
              </label>
              <input
                type="tel"
                id="field-contact-number"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="e.g. 0917-123-4567"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              id="btn-cancel-student-form"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-save-student-record"
              className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Save Changes' : 'Register Student'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
