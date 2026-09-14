import React from 'react';
import {
  BookOpen,
  GraduationCap,
  Layers,
  CheckCircle2,
  Users,
  ArrowRight,
  Plus,
  Clock,
  Award
} from 'lucide-react';
import { Student } from '../types';

interface CoursesViewProps {
  students: Student[];
  onFilterByCourse: (course: 'BSIT' | 'DIT') => void;
  onOpenAddModal: () => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  students,
  onFilterByCourse,
  onOpenAddModal,
}) => {
  const bsitStudents = students.filter((s) => s.course === 'BSIT');
  const ditStudents = students.filter((s) => s.course === 'DIT');

  return (
    <div id="courses-view-container" className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Academic Degree Programs
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Curriculum overview for Information Technology &amp; Technical Diploma departments
            </p>
          </div>
        </div>

        <button
          id="courses-add-student-btn"
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Student</span>
        </button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BSIT Program Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    Undergraduate Degree
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    BSIT
                  </h3>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                4 Years
              </span>
            </div>

            <p className="text-sm text-slate-700 font-semibold mt-4">
              Bachelor of Science in Information Technology
            </p>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Equips students with comprehensive skills in enterprise software architecture, full-stack web engineering, cyber infrastructure, database administration, and modern cloud deployment.
            </p>

            {/* Specialization Tracks */}
            <div className="mt-5 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Specialization Tracks
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-700 font-medium">
                  • Software &amp; Mobile Dev
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-700 font-medium">
                  • Network &amp; Cloud Security
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-700 font-medium">
                  • Database Systems
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-700 font-medium">
                  • UI/UX Systems Design
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="mt-5 p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-indigo-700 font-medium">Current Enrollment</span>
                <p className="text-xl font-bold text-indigo-950">{bsitStudents.length} Students</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-indigo-700 font-medium">Available Sections</span>
                <p className="text-xl font-bold text-indigo-950">12 Sections</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => onFilterByCourse('BSIT')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
            >
              <span>View All BSIT Students</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-400 font-medium">CHED Compliant</span>
          </div>
        </div>

        {/* DIT Program Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
                    Diploma Technical Track
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    DIT
                  </h3>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                3 Years Ladderized
              </span>
            </div>

            <p className="text-sm text-slate-700 font-semibold mt-4">
              Diploma in Information Technology
            </p>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Provides practical vocational and hands-on technical computing competencies, hardware diagnosis, system maintenance, and ladderized pathways straight into the 3rd year of the BSIT degree.
            </p>

            {/* Core Competencies */}
            <div className="mt-5 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Technical Competencies
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-700 font-medium">
                  • Computer Systems Servicing
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-700 font-medium">
                  • Client-Side Programming
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-700 font-medium">
                  • Technical Support
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-700 font-medium">
                  • Ladderized Transfer to BSIT
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="mt-5 p-4 rounded-xl bg-teal-50/50 border border-teal-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-teal-700 font-medium">Current Enrollment</span>
                <p className="text-xl font-bold text-teal-950">{ditStudents.length} Students</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-teal-700 font-medium">Available Sections</span>
                <p className="text-xl font-bold text-teal-950">9 Sections</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => onFilterByCourse('DIT')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-teal-700 hover:text-teal-900 transition-colors cursor-pointer"
            >
              <span>View All DIT Students</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-400 font-medium">Ladderized Track</span>
          </div>
        </div>
      </div>
    </div>
  );
};
