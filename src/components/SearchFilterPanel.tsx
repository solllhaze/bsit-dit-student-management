import React from 'react';
import {
  Search,
  RotateCcw,
  SlidersHorizontal,
  X,
  Filter
} from 'lucide-react';
import { FilterState, DegreeProgram, YearLevel, StudentStatus } from '../types';

interface SearchFilterPanelProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  availableSections: string[];
  totalResultsCount: number;
}

export const SearchFilterPanel: React.FC<SearchFilterPanelProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  availableSections,
  totalResultsCount,
}) => {
  const degreePrograms: { label: string; value: 'All' | DegreeProgram }[] = [
    { label: 'All Courses', value: 'All' },
    { label: 'BSIT', value: 'BSIT' },
    { label: 'DIT', value: 'DIT' },
  ];

  const quickYears: YearLevel[] = [
    '1st Year',
    '2nd Year',
    '3rd Year',
    '4th Year',
  ];

  const yearLevelOptions: { label: string; value: 'All' | YearLevel }[] = [
    { label: 'All', value: 'All' },
    { label: '1st', value: '1st Year' },
    { label: '2nd', value: '2nd Year' },
    { label: '3rd', value: '3rd Year' },
    { label: '4th', value: '4th Year' },
  ];

  const statuses: { label: string; value: 'All' | StudentStatus }[] = [
    { label: 'All', value: 'All' },
    { label: 'Regular', value: 'Regular' },
    { label: 'Irregular', value: 'Irregular' },
    { label: 'On Leave', value: 'On Leave' },
    { label: 'Graduated', value: 'Graduated' },
  ];

  // Dynamically filter available sections according to course and year if selected
  const filteredSections = availableSections.filter((section) => {
    if (section === 'All Sections') return true;
    if (filters.course !== 'All' && !section.startsWith(filters.course)) {
      return false;
    }
    if (filters.year !== 'All') {
      const yearDigit = filters.year.charAt(0);
      // e.g. "BSIT 3B" -> contains " 3"
      if (!section.includes(` ${yearDigit}`)) {
        return false;
      }
    }
    return true;
  });

  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.course !== 'All' ||
    filters.year !== 'All' ||
    filters.section !== 'All Sections' ||
    filters.status !== 'All';

  return (
    <div
      id="search-students-panel"
      className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 mb-6"
    >
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Search Students
              {hasActiveFilters && (
                <span className="text-[11px] font-semibold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                  Filtered
                </span>
              )}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Find BSIT and DIT student records
            </p>
          </div>
        </div>

        {/* Reset Button */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            id="reset-filters-btn"
            onClick={onResetFilters}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              hasActiveFilters
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 shadow-xs'
                : 'bg-slate-50 text-slate-400 border border-slate-200 cursor-default'
            }`}
            title="Clear all search queries and active filters"
          >
            <RotateCcw
              className={`w-3.5 h-3.5 ${hasActiveFilters ? 'text-slate-700' : 'text-slate-400'}`}
            />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Search Bar */}
      <div className="mt-5">
        <label
          htmlFor="student-search-input"
          className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
        >
          Search Student
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            id="student-search-input"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search by name or student ID"
            className="w-full pl-10 pr-10 py-3 bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-3 focus:ring-indigo-500/10 transition-all shadow-2xs"
          />
          {filters.search && (
            <button
              id="clear-search-input-btn"
              onClick={() => onFilterChange({ search: '' })}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-[11px] text-slate-600 mt-1.5 flex items-center gap-1.5">
          <span>Tip:</span>
          <span>
            Search by student name (e.g.{' '}
            <strong className="text-slate-700 font-semibold cursor-pointer hover:underline" onClick={() => onFilterChange({ search: 'Hazel' })}>Hazel</strong>) or student ID (e.g.{' '}
            <strong className="text-slate-700 font-semibold cursor-pointer hover:underline" onClick={() => onFilterChange({ search: '2024-01402' })}>2024-01402</strong>).
          </span>
        </p>
      </div>

      {/* Filters Grid */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pt-4 border-t border-slate-100">
        {/* 1. Degree Program / Course Segmented Control */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Degree Program / Course
          </label>
          <div
            id="degree-program-segmented-control"
            className="flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/70"
          >
            {degreePrograms.map((prog) => {
              const isSelected = filters.course === prog.value;
              return (
                <button
                  key={prog.value}
                  id={`filter-course-${prog.value.toLowerCase()}`}
                  onClick={() => onFilterChange({ course: prog.value })}
                  className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg transition-all text-center whitespace-nowrap ${
                    isSelected
                      ? 'bg-white text-indigo-900 shadow-xs border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  {prog.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Year Level Segmented Control */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Year Level
          </label>
          <div
            id="year-level-segmented-control"
            className="flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/70"
          >
            {yearLevelOptions.map((opt) => {
              const isSelected = filters.year === opt.value;
              return (
                <button
                  key={opt.value}
                  id={`filter-year-${opt.label.toLowerCase()}`}
                  onClick={() => onFilterChange({ year: opt.value })}
                  className={`flex-1 py-1.5 px-1 text-xs font-semibold rounded-lg transition-all text-center ${
                    isSelected
                      ? 'bg-white text-indigo-900 shadow-xs border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Section Dropdown */}
        <div>
          <label
            htmlFor="section-filter-select"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
          >
            Section
          </label>
          <select
            id="section-filter-select"
            value={filters.section}
            onChange={(e) => onFilterChange({ section: e.target.value })}
            className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/15 transition-all shadow-2xs"
          >
            {filteredSections.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Quick Year Filters (Section 9) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Quick Filters
          </label>
          <div id="quick-year-filters-group" className="flex items-center gap-1.5 flex-wrap">
            {quickYears.map((qy) => {
              const isSelected = filters.year === qy;
              return (
                <button
                  key={qy}
                  id={`quick-filter-${qy.toLowerCase().replace(' ', '-')}`}
                  onClick={() => {
                    // Toggle if already selected, or set
                    onFilterChange({ year: isSelected ? 'All' : qy });
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {qy}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Student Status Filter Pills (Section 12) */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-600" />
            Status:
          </span>
          {statuses.map((st) => {
            const isSelected = filters.status === st.value;
            let activeStyle = 'bg-indigo-900 text-white border-indigo-900';
            if (st.value === 'Regular') activeStyle = 'bg-emerald-600 text-white border-emerald-600';
            if (st.value === 'Irregular') activeStyle = 'bg-amber-600 text-white border-amber-600';
            if (st.value === 'On Leave') activeStyle = 'bg-rose-600 text-white border-rose-600';
            if (st.value === 'Graduated') activeStyle = 'bg-blue-600 text-white border-blue-600';

            return (
              <button
                key={st.value}
                id={`status-filter-${st.value.toLowerCase().replace(' ', '-')}`}
                onClick={() => onFilterChange({ status: st.value })}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                  isSelected
                    ? `${activeStyle} shadow-xs`
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-slate-200'
                }`}
              >
                {st.label}
              </button>
            );
          })}
        </div>

        {/* Current Active Filter Badges */}
        {hasActiveFilters && (
          <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-500">
            <span>Active query:</span>
            {filters.course !== 'All' && (
              <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-semibold border border-indigo-100">
                {filters.course}
                <button
                  onClick={() => onFilterChange({ course: 'All' })}
                  className="hover:text-indigo-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.year !== 'All' && (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-semibold border border-blue-100">
                {filters.year}
                <button
                  onClick={() => onFilterChange({ year: 'All' })}
                  className="hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.section !== 'All Sections' && (
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold border border-slate-200">
                {filters.section}
                <button
                  onClick={() => onFilterChange({ section: 'All Sections' })}
                  className="hover:text-slate-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.status !== 'All' && (
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold border border-slate-200">
                {filters.status}
                <button
                  onClick={() => onFilterChange({ status: 'All' })}
                  className="hover:text-slate-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
