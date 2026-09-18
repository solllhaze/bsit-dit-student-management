import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  BookOpen,
  Layers,
  FileText,
  Settings,
  LogOut,
  GraduationCap,
  Sparkles,
  X
} from 'lucide-react';
import { AdminUser } from '../types';

interface SidebarProps {
  currentNav: string;
  onNavigate: (page: string) => void;
  onOpenAddModal: () => void;
  onLogoutClick?: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  currentAdmin?: AdminUser | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentNav,
  onNavigate,
  onOpenAddModal,
  onLogoutClick,
  mobileOpen,
  onCloseMobile,
  currentAdmin,
}) => {
  // Generate initials from admin full name or fallback to 'AD'
  const adminInitials = currentAdmin
    ? currentAdmin.fullName
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : 'AD';
  const adminName = currentAdmin?.fullName ?? 'Administrator';
  const adminRole = currentAdmin?.role ?? 'System Administrator';
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users, badge: 'Active' },
    { id: 'add-student', label: 'Add Student', icon: UserPlus, action: onOpenAddModal },
    { id: 'courses', label: 'Courses', icon: BookOpen, subtext: 'BSIT & DIT' },
    { id: 'sections', label: 'Sections', icon: Layers },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          id="sidebar-mobile-backdrop"
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        id="main-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: Education & Technology Inspired Logo */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Abstract Tech-Education Symbol */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-700 flex items-center justify-center shadow-md shadow-indigo-900/15 border border-indigo-700/30 text-white relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              {/* Custom abstract emblem: interlocking modern nodes & academic crest */}
              <div className="relative flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-indigo-100 absolute -top-1 -right-0.5 opacity-40 scale-75" />
                <div className="relative">
                  <div className="w-4 h-4 border-2 border-white rounded-sm rotate-45 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-blue-300 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h1 className="font-bold text-slate-900 text-base leading-tight tracking-tight">
                Student Management System
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs font-semibold tracking-wider text-indigo-600 uppercase bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                  BSIT &amp; DIT
                </span>
                <span className="text-[11px] text-slate-600 font-medium">Portal</span>
              </div>
            </div>
          </div>

          <button
            id="close-sidebar-mobile-btn"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Academic Program Banner */}
        <div className="px-6 pt-4 pb-2">
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
              <span className="font-medium text-slate-700">Academic Year 2024–2025</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-600">1st Sem</span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 px-4 py-3 overflow-y-auto space-y-1">
          <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            Main Menu
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentNav === item.id;

            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => {
                  if (item.action) {
                    item.action();
                    onCloseMobile();
                  } else {
                    onNavigate(item.id);
                    onCloseMobile();
                  }
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm shadow-slate-900/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-600 group-hover:text-slate-700'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.id === 'students' && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-indigo-600/80 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    Active
                  </span>
                )}
                {item.id === 'add-student' && (
                  <span className="text-xs text-indigo-600 bg-indigo-50 font-bold px-1.5 py-0.5 rounded border border-indigo-100/80 group-hover:bg-indigo-100">
                    + New
                  </span>
                )}
                {item.id === 'reports' && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                    Analytics
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick System Badge */}
        <div className="px-5 py-3 mx-4 mb-2 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 rounded-xl border border-blue-100/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>BSIT &amp; DIT Admin Unit</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            Authorized portal for university student record administration.
          </p>
        </div>

        {/* Bottom Sidebar: Administrator Profile & Logout */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-700 to-blue-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-xs shrink-0">
              {adminInitials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate leading-tight">
                {adminName}
              </p>
              <p className="text-xs text-slate-500 truncate leading-tight">
                {adminRole}
              </p>
            </div>
          </div>

          <button
            id="sidebar-logout-btn"
            title="Log out"
            onClick={() => {
              if (onLogoutClick) {
                onLogoutClick();
              }
            }}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};
