import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Menu,
  CheckCircle2,
  Calendar,
  ShieldCheck
} from 'lucide-react';
import { AdminUser } from '../types';

interface HeaderProps {
  onOpenAddModal: () => void;
  onToggleMobileSidebar: () => void;
  onOpenSettings?: () => void;
  currentAdmin?: AdminUser | null;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddModal,
  onToggleMobileSidebar,
  onOpenSettings,
  currentAdmin,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  // Derive admin display info
  const adminInitials = currentAdmin
    ? currentAdmin.fullName
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : 'AD';
  const adminDisplayName = currentAdmin?.fullName ?? 'Administrator';
  const adminRole = currentAdmin?.role ?? 'College Admin';

  const notifications = [
    {
      id: 1,
      title: 'Enrollment Sync Complete',
      time: '10m ago',
      read: false,
    },
    {
      id: 2,
      title: 'BSIT 3B Section Roster Updated',
      time: '1h ago',
      read: true,
    },
    {
      id: 3,
      title: 'DIT 2nd Year Verification Notice',
      time: '3h ago',
      read: true,
    },
  ];

  return (
    <header
      id="main-app-header"
      className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-4"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle + Title & Subtitle */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-sidebar-toggle-btn"
            onClick={onToggleMobileSidebar}
            className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                User Management
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Database
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage BSIT and DIT student records
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification Button */}
          <div className="relative">
            <button
              id="notification-bell-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-transparent hover:border-slate-200"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white" />
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div
                  id="notifications-dropdown-menu"
                  className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-indigo-600" />
                      <span className="font-semibold text-sm text-slate-900">
                        System Notifications
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      1 New
                    </span>
                  </div>

                  <div className="mt-2 space-y-2">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-xl text-xs transition-colors flex items-start gap-2.5 ${
                          n.read
                            ? 'bg-white hover:bg-slate-50'
                            : 'bg-indigo-50/50 border border-indigo-100/80 hover:bg-indigo-50'
                        }`}
                      >
                        <CheckCircle2
                          className={`w-4 h-4 mt-0.5 shrink-0 ${
                            n.read ? 'text-slate-400' : 'text-indigo-600'
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-800 leading-snug">
                            {n.title}
                          </p>
                          <span className="text-[10px] text-slate-600 font-medium">
                            {n.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      All services online
                    </span>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-indigo-600 font-medium hover:underline text-xs"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Administrator Profile Pill */}
          <button
            type="button"
            id="admin-header-profile"
            onClick={onOpenSettings}
            title="Administrator Settings & Preferences"
            className="hidden sm:flex items-center gap-2.5 pl-2 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl transition-colors cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-900 text-indigo-100 font-bold text-xs flex items-center justify-center shadow-xs">
              {adminInitials}
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-slate-900 leading-none">
                {adminDisplayName}
              </p>
              <p className="text-[10px] text-slate-600 font-medium leading-none mt-1">
                {adminRole}
              </p>
            </div>
          </button>

          {/* Primary Action Button: + Add Student */}
          <button
            id="header-add-student-btn"
            onClick={onOpenAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm shadow-sm shadow-indigo-600/20 hover:shadow-md hover:shadow-indigo-600/30 transition-all duration-150 focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Student</span>
          </button>
        </div>
      </div>
    </header>
  );
};
