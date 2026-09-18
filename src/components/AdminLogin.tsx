import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Lock,
  Eye,
  EyeOff,
  User,
  LogIn,
  ShieldCheck,
  Database,
  Copy,
  Check,
  AlertCircle,
  ChevronDown,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { LoginCredentials, AuthResponse } from '../types';
import { loginAdmin, ADMIN_PROFILES_SQL } from '../services/authService';
import { getSupabaseAnonKey } from '../lib/supabase';

interface AdminLoginProps {
  onLoginSuccess: (user: import('../types').AdminUser) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authResponse, setAuthResponse] = useState<AuthResponse | null>(null);
  const [showSqlHelper, setShowSqlHelper] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);

  useEffect(() => {
    // Check if Supabase key is present
    setDbConnected(!!getSupabaseAnonKey());
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error on input change
    if (authResponse?.error) setAuthResponse(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthResponse(null);

    try {
      const result = await loginAdmin(credentials);
      setAuthResponse(result);

      if (result.success && result.user) {
        // Small delay for a polished feel
        setTimeout(() => {
          onLoginSuccess(result.user!);
        }, 400);
      } else if (result.isTableMissing) {
        setShowSqlHelper(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = () => {
    setCredentials({ username: 'admin@dssc.edu.ph', password: 'admin123', rememberMe: false });
    setAuthResponse(null);
  };

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(ADMIN_PROFILES_SQL);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    } catch {
      // Clipboard not available
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Ambient background blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-5%] w-[600px] h-[600px] rounded-full bg-blue-600/8 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] rounded-full bg-violet-600/6 blur-[100px] pointer-events-none" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Main Card */}
      <div className="relative w-full max-w-md z-10">

        {/* University Branding Header */}
        <div className="text-center mb-8">
          {/* Logo Mark */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-600 shadow-2xl shadow-indigo-500/40 mb-4 relative">
            <GraduationCap className="w-9 h-9 text-white drop-shadow-sm" />
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-slate-950 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white animate-ping" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
            Student Management System
          </h1>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-xs font-bold tracking-widest text-indigo-300 uppercase px-2.5 py-0.5 rounded-full border border-indigo-500/30 bg-indigo-500/10">
              BSIT &amp; DIT Portal
            </span>
          </div>
          <p className="text-slate-400 text-sm">Administrator Access Only</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">

          {/* Card Header Strip */}
          <div className="px-6 pt-6 pb-4 border-b border-white/8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/20 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-indigo-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white leading-none">Administrator Login</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Authorized personnel only</p>
                </div>
              </div>

              {/* DB Status Pill */}
              <div
                className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${dbConnected
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                  }`}
              >
                <Database className="w-3 h-3" />
                {dbConnected ? 'DB Connected' : 'No DB Key'}
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">

            {/* Quick Demo Fill */}
            <button
              type="button"
              id="demo-admin-autofill-btn"
              onClick={handleQuickFill}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/15 hover:border-indigo-500/30 transition-all text-left group cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300 shrink-0 transition-colors" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-indigo-300 group-hover:text-indigo-200 leading-none transition-colors">
                  Quick Demo Fill
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-none">
                  admin@dssc.edu.ph / admin123 — click to autofill
                </p>
              </div>
            </button>

            {/* Error / Info Banner */}
            {authResponse && !authResponse.success && (
              <div
                id="login-error-banner"
                className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{authResponse.error}</p>
              </div>
            )}

            {/* Username Field */}
            <div>
              <label
                htmlFor="login-username"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                Username or Email
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  id="login-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  autoFocus
                  value={credentials.username}
                  onChange={handleChange}
                  placeholder="admin or admin@dssc.edu.ph"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 transition-all"
                />
                <button
                  type="button"
                  id="toggle-password-visibility-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2.5">
              <input
                id="remember-me"
                name="rememberMe"
                type="checkbox"
                checked={credentials.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/50 cursor-pointer accent-indigo-500"
              />
              <label htmlFor="remember-me" className="text-xs text-slate-400 cursor-pointer select-none">
                Remember this workstation
              </label>
            </div>

            {/* Submit Button */}
            <button
              id="admin-login-submit-btn"
              type="submit"
              disabled={isLoading || !credentials.username || !credentials.password}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-transparent cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating…
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In to Dashboard
                </>
              )}
            </button>
          </form>

          {/* SQL Setup Helper Toggle */}
          {(authResponse?.isTableMissing || showSqlHelper) && (
            <div className="px-6 pb-6">
              <button
                type="button"
                id="sql-setup-toggle-btn"
                onClick={() => setShowSqlHelper((v) => !v)}
                className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold hover:bg-amber-500/15 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5" />
                  Database Setup Required — View SQL Script
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${showSqlHelper ? 'rotate-180' : ''}`}
                />
              </button>

              {showSqlHelper && (
                <div className="mt-3 rounded-xl overflow-hidden border border-white/10">
                  <div className="flex items-center justify-between px-3.5 py-2.5 bg-white/5 border-b border-white/8">
                    <span className="text-[11px] font-semibold text-slate-300">
                      Paste in Supabase → SQL Editor → New Query
                    </span>
                    <button
                      type="button"
                      id="copy-sql-setup-btn"
                      onClick={handleCopySql}
                      className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-300 hover:text-indigo-200 cursor-pointer transition-colors"
                    >
                      {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedSql ? 'Copied!' : 'Copy SQL'}
                    </button>
                  </div>
                  <pre className="text-[10px] text-slate-400 p-3.5 bg-slate-950/50 overflow-x-auto max-h-48 leading-relaxed whitespace-pre-wrap font-mono">
                    {ADMIN_PROFILES_SQL}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="px-6 pb-5 flex items-center justify-center gap-2 text-[11px] text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
            <span>Restricted access — BSIT &amp; DIT Administrative Unit</span>
          </div>
        </div>

        {/* Security Notice */}
        <p className="text-center text-[11px] text-slate-600 mt-5">
          Unauthorized access is prohibited and subject to disciplinary action.
        </p>
      </div>
    </div>
  );
};
