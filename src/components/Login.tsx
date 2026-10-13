import React, { useState } from 'react';
import { api, saveSession } from '../services/api.js';
import { User, UserRole } from '../types/index.js';
import { Shield, User as UserIcon, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [role, setRole] = useState<UserRole>('admin');
  const [email, setEmail] = useState('admin@tasksphere.internal');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePortalSwitch = (newRole: UserRole) => {
    setRole(newRole);
    setError(null);
    if (newRole === 'admin') {
      setEmail('admin@tasksphere.internal');
      setPassword('admin123');
    } else {
      setEmail('alex.rivers@tasksphere.internal');
      setPassword('employee123');
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string, demoRole: UserRole) => {
    setRole(demoRole);
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.login(email, password, role);
      saveSession(response.token, response.user);
      onLoginSuccess(response.user);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-600/10 via-indigo-600/5 to-transparent blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-xl shadow-blue-500/25 ring-4 ring-white/10">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold tracking-tight text-white">
          TaskSphere MERN
        </h2>
        <p className="mt-1 text-center text-sm text-slate-400">
          Role-Based Task Management &amp; Notification System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {/* Portal Switcher Tabs */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => handlePortalSwitch('admin')}
              className={`flex-1 flex items-center justify-center py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
                role === 'admin'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4 mr-2" />
              Admin Portal
            </button>
            <button
              type="button"
              onClick={() => handlePortalSwitch('employee')}
              className={`flex-1 flex items-center justify-center py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
                role === 'employee'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserIcon className="w-4 h-4 mr-2" />
              Employee Portal
            </button>
          </div>

          {/* Quick Demo Pre-fills */}
          <div className="mb-6 bg-slate-950/60 rounded-xl p-3 border border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Quick Demo Accounts</span>
              <span className="text-[10px] text-blue-400 font-normal">Click to fill</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@tasksphere.internal', 'admin123', 'admin')}
                className={`text-left p-2 rounded-lg border text-xs transition ${
                  role === 'admin' && email === 'admin@tasksphere.internal'
                    ? 'bg-blue-950/50 border-blue-500/50 text-blue-200'
                    : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold flex items-center">
                  <Shield className="w-3 h-3 text-blue-400 mr-1" />
                  Sarah Jenkins
                </div>
                <div className="text-[10px] text-slate-400 truncate">Admin / Ops Lead</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('alex.rivers@tasksphere.internal', 'employee123', 'employee')}
                className={`text-left p-2 rounded-lg border text-xs transition ${
                  role === 'employee' && email === 'alex.rivers@tasksphere.internal'
                    ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
                    : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold flex items-center">
                  <UserIcon className="w-3 h-3 text-emerald-400 mr-1" />
                  Alex Rivers
                </div>
                <div className="text-[10px] text-slate-400 truncate">Employee / Frontend</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('maria.chen@tasksphere.internal', 'employee123', 'employee')}
                className={`text-left p-2 rounded-lg border text-xs transition ${
                  role === 'employee' && email === 'maria.chen@tasksphere.internal'
                    ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
                    : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold flex items-center">
                  <UserIcon className="w-3 h-3 text-emerald-400 mr-1" />
                  Maria Chen
                </div>
                <div className="text-[10px] text-slate-400 truncate">Employee / Backend</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('david.kim@tasksphere.internal', 'employee123', 'employee')}
                className={`text-left p-2 rounded-lg border text-xs transition ${
                  role === 'employee' && email === 'david.kim@tasksphere.internal'
                    ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
                    : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold flex items-center">
                  <UserIcon className="w-3 h-3 text-emerald-400 mr-1" />
                  David Kim
                </div>
                <div className="text-[10px] text-slate-400 truncate">Employee / Design</div>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'admin' ? 'admin@company.com' : 'employee@company.com'}
                  className="block w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-semibold text-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                role === 'admin'
                  ? 'bg-blue-600 hover:bg-blue-500 focus:ring-blue-500 shadow-blue-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 focus:ring-emerald-500 shadow-emerald-600/30'
              } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5">
                  <span>Sign In to {role === 'admin' ? 'Admin Portal' : 'Employee Portal'}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              )}
            </button>
          </form>

          {/* Features note */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="flex items-center space-x-2 text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Full Role-Based Access Control (RBAC)</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Automated Email Dispatch on Assign &amp; Status Updates</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>MongoDB Mongoose Architecture with Live Search</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
