import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Bell,
  Database,
  RefreshCw,
  Download,
  Save,
  CheckCircle2,
  Sliders,
  Sparkles
} from 'lucide-react';
import { Student } from '../types';
import { INITIAL_STUDENTS } from '../data/mockStudents';

interface SettingsViewProps {
  students: Student[];
  onResetToDefaults: () => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  students,
  onResetToDefaults,
  onShowToast,
}) => {
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [semester, setSemester] = useState('1st Semester');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoSectionSync, setAutoSectionSync] = useState(true);
  const [auditLogging, setAuditLogging] = useState(true);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onShowToast('System settings and preferences saved successfully.', 'success');
  };

  const handleBackupDatabase = () => {
    const dataStr = JSON.stringify(students, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BSIT_DIT_Database_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast(`Exported full database backup (${students.length} records).`, 'success');
  };

  const handleRestoreSample = () => {
    onResetToDefaults();
    onShowToast('Restored default official mock dataset.', 'info');
  };

  return (
    <div id="settings-view-container" className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              System Settings &amp; Preferences
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Configure academic year terms, automated notifications, and database backups
            </p>
          </div>
        </div>

        <button
          onClick={handleBackupDatabase}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Backup JSON</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Controls */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                Academic Term Parameters
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Sets default registration session headers across student records
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Academic Year
                </label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="2024-2025">2024–2025 (Current)</option>
                  <option value="2025-2026">2025–2026</option>
                  <option value="2023-2024">2023–2024</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Semester Term
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="1st Semester">1st Semester (Active)</option>
                  <option value="2nd Semester">2nd Semester</option>
                  <option value="Summer Term">Mid-Year / Summer Term</option>
                </select>
              </div>
            </div>

            {/* Notification & Automation Toggles */}
            <div className="pt-4 border-t border-slate-100 space-y-3.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Automated System Policies
              </span>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 cursor-pointer transition-colors">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Auto-Section Synchronization</p>
                  <p className="text-xs text-slate-500">
                    Automatically filter section choices according to selected degree program &amp; year
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoSectionSync}
                  onChange={(e) => setAutoSectionSync(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 cursor-pointer transition-colors">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Institutional Audit Logging</p>
                  <p className="text-xs text-slate-500">
                    Log administrator additions, modifications, and removals of student records
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={auditLogging}
                  onChange={(e) => setAuditLogging(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 cursor-pointer transition-colors">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Enrollment Notifications</p>
                  <p className="text-xs text-slate-500">
                    Display notification banner when new students are admitted
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                id="btn-save-settings"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Database & Backup Management */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <Database className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">Database Utilities</h3>
            </div>

            <div className="mt-4 space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-xs text-slate-500 block">Total Records in Store</span>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{students.length} Records</p>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Database Synchronized
                </span>
              </div>

              <button
                type="button"
                onClick={handleBackupDatabase}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Database (JSON)</span>
              </button>

              <button
                type="button"
                onClick={handleRestoreSample}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset to Sample Dataset</span>
              </button>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-indigo-900">
              <Shield className="w-4 h-4 text-indigo-600" />
              <span>Role-Based Access Guard</span>
            </div>
            <p className="leading-relaxed text-slate-600">
              Session is authenticated under College Administrator role. All record updates are locally persisted during this runtime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
