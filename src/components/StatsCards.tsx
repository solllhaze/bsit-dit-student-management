import React from 'react';
import { Users, Clock, BookOpen, Calendar, GraduationCap } from 'lucide-react';
import { YearLevel } from '../types';

interface StatsCardsProps {
  totalStudents?: number;
  firstYearCount?: number;
  secondYearCount?: number;
  thirdYearCount?: number;
  fourthYearCount?: number;
  selectedYear?: string;
  onSelectYear?: (year: YearLevel | 'All') => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  totalStudents = 34,
  firstYearCount = 8,
  secondYearCount = 10,
  thirdYearCount = 10,
  fourthYearCount = 6,
  selectedYear = 'All',
  onSelectYear,
}) => {
  const cards = [
    {
      id: 'stat-total-students',
      label: 'TOTAL STUDENTS',
      value: totalStudents,
      subtext: 'Registered BSIT majors',
      icon: Users,
      iconBg: 'bg-[#ede9fe] text-[#7c3aed]', // soft purple
      pillText: '+8% sem',
      pillBg: 'bg-[#f3e8ff] text-[#7e22ce]',
      filterYear: 'All' as const,
    },
    {
      id: 'stat-1st-year',
      label: '1ST YEAR',
      value: firstYearCount,
      subtext: 'Sections 1A, 1B & 1C',
      icon: Clock,
      iconBg: 'bg-[#e0f2fe] text-[#0284c7]', // soft blue
      pillText: 'Freshmen',
      pillBg: 'bg-[#e0f2fe] text-[#0369a1]',
      filterYear: '1st Year' as const,
    },
    {
      id: 'stat-2nd-year',
      label: '2ND YEAR',
      value: secondYearCount,
      subtext: 'Sections 2A & 2B',
      icon: BookOpen,
      iconBg: 'bg-[#fce7f3] text-[#db2777]', // soft pink
      pillText: 'Sophomores',
      pillBg: 'bg-[#fce7f3] text-[#be185d]',
      filterYear: '2nd Year' as const,
    },
    {
      id: 'stat-3rd-year',
      label: '3RD YEAR',
      value: thirdYearCount,
      subtext: 'Sections 3A & 3B',
      icon: Calendar,
      iconBg: 'bg-[#ffedd5] text-[#ea580c]', // soft orange
      pillText: 'Juniors',
      pillBg: 'bg-[#ffedd5] text-[#c2410c]',
      filterYear: '3rd Year' as const,
    },
    {
      id: 'stat-4th-year',
      label: '4TH YEAR',
      value: fourthYearCount,
      subtext: 'Graduating Batch',
      icon: GraduationCap,
      iconBg: 'bg-[#ccfbf1] text-[#0d9488]', // soft teal/mint
      pillText: 'Seniors',
      pillBg: 'bg-[#ccfbf1] text-[#0f766e]',
      filterYear: '4th Year' as const,
    },
  ];

  return (
    <section id="statistics-overview" className="mb-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const isSelected = selectedYear === card.filterYear;
          return (
            <div
              key={card.id}
              id={card.id}
              onClick={() => onSelectYear && onSelectYear(card.filterYear)}
              className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all duration-200 flex flex-col justify-between cursor-pointer group shadow-xs hover:shadow-md ${
                isSelected
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                  : 'border-slate-100 hover:border-slate-300/80'
              }`}
            >
              {/* Header: Icon & Pill */}
              <div className="flex items-start justify-between gap-2 mb-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${card.iconBg}`}
                >
                  <Icon className="w-5 h-5" strokeWidth={2.2} />
                </div>
                <span
                  className={`text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${card.pillBg}`}
                >
                  {card.pillText}
                </span>
              </div>

              {/* Stat Body */}
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {card.label}
                </p>
                <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-none mb-2">
                  {card.value}
                </p>
                <p className="text-xs text-slate-500 font-medium truncate">
                  {card.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
