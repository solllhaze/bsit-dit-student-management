import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  TrendingUp,
  Users,
  GraduationCap,
  Layers,
  CheckCircle2,
  Calendar,
  PieChart as PieIcon,
  BarChart3,
  ArrowRight,
  FileSpreadsheet,
  FileCode,
  ChevronDown
} from 'lucide-react';
import { Student } from '../types';
import { ALL_BSIT_SECTIONS, ALL_DIT_SECTIONS } from '../data/mockStudents';

interface ReportsViewProps {
  students: Student[];
  onNavigateToStudents: (filter?: { course?: string; year?: string; status?: string }) => void;
  onExportCSV: () => void;
  onExport?: (format: 'csv' | 'pdf' | 'docx') => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  students,
  onNavigateToStudents,
  onExportCSV,
  onExport,
  onShowToast,
}) => {
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const total = students.length;
  const bsitCount = students.filter((s) => s.course === 'BSIT').length;
  const ditCount = students.filter((s) => s.course === 'DIT').length;

  const regularCount = students.filter((s) => s.status === 'Regular').length;
  const irregularCount = students.filter((s) => s.status === 'Irregular').length;
  const onLeaveCount = students.filter((s) => s.status === 'On Leave').length;
  const graduatedCount = students.filter((s) => s.status === 'Graduated').length;

  const y1Count = students.filter((s) => s.yearLevel === '1st Year').length;
  const y2Count = students.filter((s) => s.yearLevel === '2nd Year').length;
  const y3Count = students.filter((s) => s.yearLevel === '3rd Year').length;
  const y4Count = students.filter((s) => s.yearLevel === '4th Year').length;

  const regularPercent = total > 0 ? Math.round((regularCount / total) * 100) : 0;
  const bsitPercent = total > 0 ? Math.round((bsitCount / total) * 100) : 0;
  const ditPercent = total > 0 ? Math.round((ditCount / total) * 100) : 0;

  const handlePrint = () => {
    onShowToast('Preparing printer-friendly academic report summary...', 'info');
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div id="reports-view-container" className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Academic Reports &amp; Analytics
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Generated Live
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Official institutional summary for BSIT &amp; DIT department registries
            </p>
          </div>
        </div>

        {/* Action Buttons: Export & Print */}
        <div className="flex items-center gap-2.5">
          <button
            id="btn-print-report"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Report</span>
          </button>

          <div className="relative">
            <button
              id="btn-export-report-dropdown"
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Roster</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${exportDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {exportDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Format
                </div>
                <button
                  id="btn-report-export-csv"
                  onClick={() => {
                    setExportDropdownOpen(false);
                    if (onExport) onExport('csv');
                    else onExportCSV();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors text-left cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>CSV Spreadsheet</span>
                </button>
                <button
                  id="btn-report-export-pdf"
                  onClick={() => {
                    setExportDropdownOpen(false);
                    if (onExport) onExport('pdf');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-800 transition-colors text-left cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-rose-600" />
                  <span>PDF Document</span>
                </button>
                <button
                  id="btn-report-export-docx"
                  onClick={() => {
                    setExportDropdownOpen(false);
                    if (onExport) onExport('docx');
                  }}
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

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Enrolled
            </span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{total}</p>
          <p className="text-xs text-slate-500 mt-1">Active student database</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Regular Standing
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{regularPercent}%</p>
          <p className="text-xs text-slate-500 mt-1">{regularCount} students on track</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              BSIT Share
            </span>
            <GraduationCap className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-3xl font-extrabold text-indigo-700">{bsitPercent}%</p>
          <p className="text-xs text-slate-500 mt-1">{bsitCount} BSIT students</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              DIT Share
            </span>
            <Layers className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-3xl font-extrabold text-teal-700">{ditPercent}%</p>
          <p className="text-xs text-slate-500 mt-1">{ditCount} DIT students</p>
        </div>
      </div>

      {/* Program Breakdown & Year Level Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Degree Program Comparison */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-indigo-600" />
              Degree Program Breakdown
            </h3>
            <span className="text-xs text-slate-500">AY 2024–2025</span>
          </div>

          <div className="mt-5 space-y-4">
            {/* BSIT */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-800 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  BSIT (Bachelor of Science in IT)
                </span>
                <span className="text-slate-700">{bsitCount} students ({bsitPercent}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${bsitPercent}%` }}
                />
              </div>
            </div>

            {/* DIT */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-800 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                  DIT (Diploma in Information Technology)
                </span>
                <span className="text-slate-700">{ditCount} students ({ditPercent}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-teal-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${ditPercent}%` }}
                />
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>Looking for student roster?</span>
              <button
                onClick={() => onNavigateToStudents({ course: 'BSIT' })}
                className="text-indigo-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Filter BSIT Records</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Year Level Cohort Enrollment */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              Year Level Distribution
            </h3>
            <span className="text-xs text-slate-500">4 Academic Levels</span>
          </div>

          <div className="mt-5 space-y-3.5">
            {[
              { label: '1st Year (Freshmen)', count: y1Count, color: 'bg-blue-500', yr: '1st Year' },
              { label: '2nd Year (Sophomores)', count: y2Count, color: 'bg-pink-500', yr: '2nd Year' },
              { label: '3rd Year (Juniors)', count: y3Count, color: 'bg-amber-500', yr: '3rd Year' },
              { label: '4th Year (Seniors)', count: y4Count, color: 'bg-emerald-500', yr: '4th Year' },
            ].map((cohort) => {
              const pct = total > 0 ? Math.round((cohort.count / total) * 100) : 0;
              return (
                <div key={cohort.label}>
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-800">{cohort.label}</span>
                    <span className="text-slate-600">
                      {cohort.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`${cohort.color} h-2.5 rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Academic Status Audit Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Student Academic Status Audit</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown of Regular, Irregular, On Leave, and Graduated standings
            </p>
          </div>
          <button
            onClick={() => onNavigateToStudents()}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Roster</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => onNavigateToStudents({ status: 'Regular' })}
            className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 cursor-pointer hover:bg-emerald-50 transition-colors"
          >
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              Regular Standing
            </span>
            <p className="text-2xl font-extrabold text-emerald-900 mt-1">{regularCount}</p>
            <p className="text-xs text-emerald-700 mt-0.5">Fully enrolled in required curriculum</p>
          </div>

          <div
            onClick={() => onNavigateToStudents({ status: 'Irregular' })}
            className="p-4 rounded-xl bg-amber-50/60 border border-amber-100 cursor-pointer hover:bg-amber-50 transition-colors"
          >
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
              Irregular Standing
            </span>
            <p className="text-2xl font-extrabold text-amber-900 mt-1">{irregularCount}</p>
            <p className="text-xs text-amber-700 mt-0.5">Retaking or cross-enrolled subjects</p>
          </div>

          <div
            onClick={() => onNavigateToStudents({ status: 'On Leave' })}
            className="p-4 rounded-xl bg-rose-50/60 border border-rose-100 cursor-pointer hover:bg-rose-50 transition-colors"
          >
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">
              On Leave of Absence
            </span>
            <p className="text-2xl font-extrabold text-rose-900 mt-1">{onLeaveCount}</p>
            <p className="text-xs text-rose-700 mt-0.5">Approved academic suspension</p>
          </div>

          <div
            onClick={() => onNavigateToStudents({ status: 'Graduated' })}
            className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 cursor-pointer hover:bg-blue-50 transition-colors"
          >
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block">
              Graduated Alumni
            </span>
            <p className="text-2xl font-extrabold text-blue-900 mt-1">{graduatedCount}</p>
            <p className="text-xs text-blue-700 mt-0.5">Completed degree certification</p>
          </div>
        </div>
      </div>
    </div>
  );
};
