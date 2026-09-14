import React, { useState } from 'react';
import {
  Layers,
  Users,
  Search,
  ArrowRight,
  Filter,
  GraduationCap,
  Plus
} from 'lucide-react';
import { Student } from '../types';
import { AVAILABLE_SECTIONS, getFullName } from '../data/mockStudents';

interface SectionsViewProps {
  students: Student[];
  onSelectSection: (section: string) => void;
  onOpenAddModal: () => void;
}

export const SectionsView: React.FC<SectionsViewProps> = ({
  students,
  onSelectSection,
  onOpenAddModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<'All' | 'BSIT' | 'DIT'>('All');

  const validSections = AVAILABLE_SECTIONS.filter((s) => s !== 'All Sections');

  const filteredSections = validSections.filter((sec) => {
    if (selectedProgram !== 'All' && !sec.startsWith(selectedProgram)) {
      return false;
    }
    if (searchQuery.trim() !== '' && !sec.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div id="sections-view-container" className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Class Sections &amp; Rosters
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Classroom blocks and section cohorts for BSIT &amp; DIT majors
            </p>
          </div>
        </div>

        <button
          id="sections-add-student-btn"
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Student to Section</span>
        </button>
      </div>

      {/* Filter and Search Bar for Sections */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search section (e.g. BSIT 3B)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Program Filter Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-center">
          {(['All', 'BSIT', 'DIT'] as const).map((prog) => (
            <button
              key={prog}
              onClick={() => setSelectedProgram(prog)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedProgram === prog
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {prog === 'All' ? 'All Programs' : prog}
            </button>
          ))}
        </div>
      </div>

      {/* Sections Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSections.map((sectionName) => {
          const enrolledStudents = students.filter((s) => s.section === sectionName);
          const isBSIT = sectionName.startsWith('BSIT');

          return (
            <div
              key={sectionName}
              id={`section-card-${sectionName.replace(/\s+/g, '-')}`}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isBSIT
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-teal-50 text-teal-700 border border-teal-200'
                      }`}
                    >
                      {isBSIT ? 'IT' : 'DT'}
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{sectionName}</h3>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {isBSIT ? 'Undergraduate Block' : 'Diploma Block'}
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                    <Users className="w-3 h-3 text-slate-500" />
                    {enrolledStudents.length} Students
                  </span>
                </div>

                {/* Sample students preview */}
                <div className="mt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Enrolled Roster
                  </span>
                  {enrolledStudents.length > 0 ? (
                    <div className="space-y-1">
                      {enrolledStudents.slice(0, 3).map((std) => (
                        <div
                          key={std.id}
                          className="text-xs text-slate-700 truncate font-medium flex items-center gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          <span>{getFullName(std)}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({std.studentId})</span>
                        </div>
                      ))}
                      {enrolledStudents.length > 3 && (
                        <p className="text-[11px] text-slate-400 italic">
                          +{enrolledStudents.length - 3} more student(s)
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No students currently assigned</p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onSelectSection(sectionName)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                >
                  <span>Filter this Section</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] text-slate-400">AY 2024–2025</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
