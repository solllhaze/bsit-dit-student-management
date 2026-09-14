import React from 'react';
import { ExternalLink, ChevronRight } from 'lucide-react';
import { Student } from '../types';
import { formatSectionShort } from '../data/mockStudents';

interface RecentStudentsProps {
  students: Student[];
  onViewStudent: (student: Student) => void;
  onViewAll: () => void;
}

export const RecentStudents: React.FC<RecentStudentsProps> = ({
  students,
  onViewStudent,
  onViewAll,
}) => {
  // Vibrant gradients/background color themes matching the 4 cards in the user image
  // Card 1: Solid Royal Blue #2563eb / #1d4ed8
  // Card 2: Deep Purple/Violet #7c3aed / #6d28d9
  // Card 3: Crimson Rose/Red #e11d48 / #f43f5e
  // Card 4: Bright Sky/Cyan Blue #0284c7 / #0ea5e9
  const cardThemes = [
    {
      bgClass: 'bg-gradient-to-br from-blue-600 to-blue-700 text-white',
      avatarBg: 'bg-white/20 text-white',
      openBtnBg: 'bg-white/20 hover:bg-white/30 text-white',
      badgeYearBg: 'bg-white/20 text-white',
      badgeSectionBg: 'bg-white/20 text-white',
      badgeStatusBg: 'bg-white text-slate-900 font-bold',
    },
    {
      bgClass: 'bg-gradient-to-br from-purple-600 to-purple-700 text-white',
      avatarBg: 'bg-white/20 text-white',
      openBtnBg: 'bg-white/20 hover:bg-white/30 text-white',
      badgeYearBg: 'bg-white/20 text-white',
      badgeSectionBg: 'bg-white/20 text-white',
      badgeStatusBg: 'bg-white text-slate-900 font-bold',
    },
    {
      bgClass: 'bg-gradient-to-br from-rose-600 to-rose-700 text-white',
      avatarBg: 'bg-white/20 text-white',
      openBtnBg: 'bg-white/20 hover:bg-white/30 text-white',
      badgeYearBg: 'bg-white/20 text-white',
      badgeSectionBg: 'bg-white/20 text-white',
      badgeStatusBg: 'bg-white text-slate-900 font-bold',
    },
    {
      bgClass: 'bg-gradient-to-br from-sky-500 to-sky-600 text-white',
      avatarBg: 'bg-white/20 text-white',
      openBtnBg: 'bg-white/20 hover:bg-white/30 text-white',
      badgeYearBg: 'bg-white/20 text-white',
      badgeSectionBg: 'bg-white/20 text-white',
      badgeStatusBg: 'bg-white text-slate-900 font-bold',
    },
  ];

  // Helper to get 2 initials
  const getInitials = (student: Student) => {
    const f = student.firstName.trim().charAt(0) || '';
    const l = student.lastName.trim().charAt(0) || '';
    return `${f}${l}`.toUpperCase();
  };

  // Select up to 4 recent students (prioritizing Dolly, Dennis, Francis, Ella or latest)
  const displayStudents = students.slice(0, 4);

  return (
    <section id="recent-students-section" className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Recent Students
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
            Newly enrolled and active BSIT students
          </p>
        </div>

        <button
          id="btn-recent-students-view-all"
          onClick={onViewAll}
          className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors group cursor-pointer"
        >
          <span>View All</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* 4 Vibrant Student Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {displayStudents.map((student, index) => {
          const theme = cardThemes[index % cardThemes.length];
          const initials = getInitials(student);
          // Format section badge to only show year and section (e.g. 3A, 4A)
          const sectionBadge = formatSectionShort(student.section);

          return (
            <div
              key={student.id}
              id={`recent-student-card-${student.id}`}
              onClick={() => onViewStudent(student)}
              className={`rounded-3xl p-5 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between ${theme.bgClass}`}
            >
              {/* Top Bar: Avatar initials & external view button */}
              <div className="flex items-center justify-between mb-5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shadow-xs backdrop-blur-xs ${theme.avatarBg}`}
                >
                  {initials}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewStudent(student);
                  }}
                  title="View Student Details"
                  className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer ${theme.openBtnBg}`}
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>

              {/* Middle: Student Name & Student ID */}
              <div className="mb-6">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white line-clamp-1 mb-1">
                  {student.firstName} {student.lastName}
                </h3>
                <p className="text-xs sm:text-sm font-medium text-white/80 tracking-wide font-mono">
                  {student.studentId}
                </p>
              </div>

              {/* Bottom: 3 Rounded Badges: Year, Section, Status */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`text-[11px] font-semibold px-3 py-1 rounded-full backdrop-blur-xs ${theme.badgeYearBg}`}
                >
                  {student.yearLevel}
                </span>
                <span
                  className={`text-[11px] font-semibold px-3 py-1 rounded-full backdrop-blur-xs ${theme.badgeSectionBg}`}
                >
                  {sectionBadge}
                </span>
                <span
                  className={`text-[11px] font-bold px-3 py-1 rounded-full shadow-2xs ${theme.badgeStatusBg}`}
                >
                  {student.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
