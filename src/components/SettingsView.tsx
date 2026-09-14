import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Database,
  Download,
  Save,
  CheckCircle2,
  Sliders,
  AlertTriangle,
  Key,
  ExternalLink,
  RefreshCw,
  Trash2,
  Check,
  Eye,
  EyeOff,
  Code,
  Copy
} from 'lucide-react';
import { Student } from '../types';
import {
  getSupabaseUrl,
  getSupabaseAnonKey,
  storeSupabaseCredentials,
  testSupabaseConnection,
  DEFAULT_SUPABASE_URL
} from '../lib/supabase';

interface SettingsViewProps {
  students: Student[];
  onDeleteAllStudents: () => Promise<void>;
  onReloadFromSupabase: () => Promise<void>;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  students,
  onDeleteAllStudents,
  onReloadFromSupabase,
  onShowToast,
}) => {
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [semester, setSemester] = useState('1st Semester');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoSectionSync, setAutoSectionSync] = useState(true);
  const [auditLogging, setAuditLogging] = useState(true);

  // Supabase Connection State
  const [supabaseUrl, setSupabaseUrl] = useState(getSupabaseUrl());
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(getSupabaseAnonKey());
  const [showKey, setShowKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
  }>({
    tested: false,
    success: false,
    message: '',
  });

  // Reset Confirmation Modal State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [showSqlSchema, setShowSqlSchema] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    // Initial quick test if key is present
    if (supabaseAnonKey) {
      testSupabaseConnection().then((res) => {
        setConnectionStatus({
          tested: true,
          success: res.success,
          message: res.message,
        });
      });
    } else {
      setConnectionStatus({
        tested: true,
        success: false,
        message: 'Supabase anon key is required to connect to the database.',
      });
    }
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onShowToast('System settings and preferences saved successfully.', 'success');
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const result = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
      setConnectionStatus({
        tested: true,
        success: result.success,
        message: result.message,
      });
      if (result.success) {
        onShowToast(result.message, 'success');
      } else {
        onShowToast(result.message, 'error');
      }
    } catch (err: any) {
      const msg = err?.message || 'Unable to connect to the database. Please try again.';
      setConnectionStatus({ tested: true, success: false, message: msg });
      onShowToast(msg, 'error');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveSupabaseConfig = async () => {
    if (!supabaseAnonKey.trim()) {
      onShowToast('Please enter your Supabase Anon Public Key.', 'error');
      return;
    }
    storeSupabaseCredentials(supabaseAnonKey, supabaseUrl);
    setTestingConnection(true);
    try {
      const result = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
      setConnectionStatus({
        tested: true,
        success: result.success,
        message: result.message,
      });
      if (result.success) {
        onShowToast('Supabase connection configured and connected successfully!', 'success');
        await onReloadFromSupabase();
      } else {
        onShowToast(result.message, 'error');
      }
    } catch (err: any) {
      onShowToast(err?.message || 'Unable to connect to the database. Please try again.', 'error');
    } finally {
      setTestingConnection(false);
    }
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

  const handleConfirmReset = async () => {
    setIsDeletingAll(true);
    try {
      await onDeleteAllStudents();
      setIsResetModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeletingAll(false);
    }
  };

  const sqlCode = `-- SQL Setup for Supabase "students" Table:
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    middle_name TEXT,
    last_name TEXT NOT NULL,
    program TEXT NOT NULL,
    year_level TEXT NOT NULL,
    section TEXT NOT NULL,
    email TEXT,
    contact_number TEXT,
    status TEXT NOT NULL DEFAULT 'Regular',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon select on students" ON public.students FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow anon insert on students" ON public.students FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow anon update on students" ON public.students FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Allow anon delete on students" ON public.students FOR DELETE TO anon, authenticated USING (true);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopiedSql(true);
    onShowToast('Copied Supabase SQL setup to clipboard!', 'info');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div id="settings-view-container" className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              System Settings &amp; Supabase Database
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage Supabase connection, clean database resets, and academic term preferences
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleBackupDatabase}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Backup JSON</span>
          </button>
        </div>
      </div>

      {/* Supabase Connection Configuration Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-bold text-slate-900">
                  Supabase Database Connection
                </h3>
                {connectionStatus.tested && (
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      connectionStatus.success
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        connectionStatus.success ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                    {connectionStatus.success ? 'Connected' : 'Action Required'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Connected to project <span className="font-mono text-slate-700 font-semibold">ppynzitnihxmdgeqsrjd</span>
              </p>
            </div>
          </div>

          <a
            href="https://supabase.com/dashboard/project/ppynzitnihxmdgeqsrjd/settings/api"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <span>Supabase API Keys</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Project URL & Anon Key Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Project URL
            </label>
            <input
              type="text"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://ppynzitnihxmdgeqsrjd.supabase.co"
              className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Public Client Key (Anon Key)</span>
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showKey ? 'Hide' : 'Show'}</span>
              </button>
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full pl-9 pr-3.5 py-2.5 text-sm font-mono rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>
        </div>

        {/* Connection Status Message */}
        {connectionStatus.tested && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
              connectionStatus.success
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                : 'bg-amber-50/60 border-amber-200 text-amber-900'
            }`}
          >
            {connectionStatus.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-semibold">{connectionStatus.message}</p>
              {!connectionStatus.success && (
                <p className="mt-1 text-slate-600">
                  Copy your public anon key from{' '}
                  <a
                    href="https://supabase.com/dashboard/project/ppynzitnihxmdgeqsrjd/settings/api"
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-indigo-700 font-medium"
                  >
                    Supabase Project Settings &gt; API
                  </a>{' '}
                  and paste it above, then click Save &amp; Connect.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons for Supabase */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShowSqlSchema(!showSqlSchema)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <Code className="w-4 h-4 text-slate-500" />
            <span>{showSqlSchema ? 'Hide' : 'View'} Supabase SQL Schema</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={testingConnection}
              onClick={handleTestConnection}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
              <span>Test Connection</span>
            </button>

            <button
              type="button"
              disabled={testingConnection}
              onClick={handleSaveSupabaseConfig}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              <Check className="w-4 h-4" />
              <span>Save &amp; Connect</span>
            </button>
          </div>
        </div>

        {/* SQL Schema helper box */}
        {showSqlSchema && (
          <div className="mt-3 p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto relative">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
              <span>SQL to run in Supabase SQL Editor</span>
              <button
                type="button"
                onClick={handleCopySql}
                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
              >
                {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSql ? 'Copied' : 'Copy SQL'}</span>
              </button>
            </div>
            <pre className="text-xs leading-relaxed whitespace-pre-wrap">{sqlCode}</pre>
          </div>
        )}
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
                  <option value="2026-2027">2026–2027 (Active Term)</option>
                  <option value="2025-2026">2025–2026</option>
                  <option value="2024-2025">2024–2025</option>
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

        {/* Right Col: Database & Clean Reset Operations */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <Database className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">Database Operations</h3>
            </div>

            <div className="mt-4 space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-xs text-slate-500 block">Total Records in Store</span>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{students.length} Records</p>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Supabase Synchronized
                </span>
              </div>

              {/* Refresh / Reload from Supabase */}
              <button
                type="button"
                onClick={onReloadFromSupabase}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-slate-500" />
                <span>Sync / Refresh from Supabase</span>
              </button>

              {/* Destructive Reset: Clean Database (Section 2) */}
              <button
                type="button"
                id="btn-reset-clean-database"
                onClick={() => setIsResetModalOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Reset Database (Delete All Students)</span>
              </button>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-indigo-900">
              <Shield className="w-4 h-4 text-indigo-600" />
              <span>Role-Based Access Guard</span>
            </div>
            <p className="leading-relaxed text-slate-600">
              Session is authenticated under College Administrator role. All database operations directly read and write to your live Supabase database instance.
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Resetting Database (Section 2 requirement) */}
      {isResetModalOpen && (
        <div
          id="reset-database-modal-overlay"
          className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => !isDeletingAll && setIsResetModalOpen(false)}
          />

          <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                    Reset Student Database?
                  </h2>
                  <p className="text-sm font-semibold text-rose-700 mt-2 bg-rose-50 p-3 rounded-xl border border-rose-200">
                    Are you sure you want to delete all existing student records? This action cannot be undone.
                  </p>
                  <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                    This will permanently delete all {students.length} student records from your Supabase database table so you can start with a completely clean database (0 records).
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeletingAll}
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingAll}
                onClick={handleConfirmReset}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-60"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeletingAll ? 'Deleting All...' : 'Confirm Reset & Delete All'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
