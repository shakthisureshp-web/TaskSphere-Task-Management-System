import React from 'react';
import { User } from '../types/index.js';
import { LogOut, Mail, Shield, User as UserIcon, RefreshCw, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  onOpenNotifications: () => void;
  notificationCount: number;
  onSwitchPortal: (role: 'admin' | 'employee') => void;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onOpenNotifications,
  notificationCount,
  onSwitchPortal,
  onRefreshData,
  isRefreshing,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold text-xl">
            TS
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-white">TaskSphere</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                MERN Stack
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Enterprise Task Management &amp; Notification Engine
            </p>
          </div>
        </div>

        {/* Right action items */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {onRefreshData && (
            <button
              onClick={onRefreshData}
              title="Refresh Data"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
            </button>
          )}

          {/* Email Outbox button */}
          <button
            onClick={onOpenNotifications}
            className="relative flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition shadow-sm"
            title="Inspect Email Notification Outbox"
          >
            <Mail className="w-4 h-4 text-indigo-400" />
            <span className="hidden md:inline">Email Outbox</span>
            {notificationCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-blue-600 rounded-full">
                {notificationCount}
              </span>
            )}
          </button>

          {/* User info badge */}
          <div className="flex items-center space-x-3 pl-2 sm:pl-3 border-l border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-full bg-slate-700 overflow-hidden ring-2 ring-slate-600 flex items-center justify-center">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-5 h-5 text-slate-300" />
                )}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-semibold text-slate-100 flex items-center space-x-1.5">
                  <span>{user.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                      user.role === 'admin'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">{user.email}</div>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
