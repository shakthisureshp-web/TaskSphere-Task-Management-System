import React, { useState, useEffect, useCallback } from 'react';
import { User, EmailNotification } from './types/index.js';
import { api, getStoredToken, getStoredUser, clearSession, saveSession } from './services/api.js';
import { Navbar } from './components/Navbar.js';
import { Login } from './components/Login.js';
import { AdminDashboard } from './components/AdminDashboard.js';
import { EmployeeDashboard } from './components/EmployeeDashboard.js';
import { NotificationDrawer } from './components/NotificationDrawer.js';
import { Shield, User as UserIcon, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check stored session
  useEffect(() => {
    const initAuth = async () => {
      const token = getStoredToken();
      const cachedUser = getStoredUser();

      if (token && cachedUser) {
        setUser(cachedUser);
        try {
          const res = await api.getMe();
          setUser(res.user);
          saveSession(token, res.user);
        } catch (err) {
          console.warn('Session expired or invalid, clearing local session.');
          clearSession();
          setUser(null);
        }
      }
      setInitializing(false);
    };

    initAuth();
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const res = await api.getNotifications(50);
      setNotifications(res.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll notifications every 30s to stay fresh
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchNotifications]);

  const handleLogout = () => {
    clearSession();
    setUser(null);
  };

  const handleSwitchPortal = async (targetRole: 'admin' | 'employee') => {
    // Quick demo switch between admin and employee for testing ease
    try {
      if (targetRole === 'admin') {
        const res = await api.login('admin@tasksphere.internal', 'admin123', 'admin');
        saveSession(res.token, res.user);
        setUser(res.user);
      } else {
        const res = await api.login('alex.rivers@tasksphere.internal', 'employee123', 'employee');
        saveSession(res.token, res.user);
        setUser(res.user);
      }
      fetchNotifications();
    } catch (err: any) {
      console.error('Portal switch failed:', err);
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-400 font-medium">Initializing TaskSphere System...</p>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        notificationCount={notifications.length}
        onSwitchPortal={handleSwitchPortal}
        onRefreshData={fetchNotifications}
        isRefreshing={isRefreshing}
      />

      {/* Role Switcher Toolbar (Testing Bar) */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-xs gap-2">
          <div className="flex items-center space-x-2 text-slate-400">
            <span className="font-semibold text-slate-300">Active Session:</span>
            <span className="text-white font-medium">{user.name}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                user.role === 'admin'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {user.role} Portal
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-500 hidden sm:inline">Quick Test Switch:</span>
            <button
              onClick={() => handleSwitchPortal('admin')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition flex items-center space-x-1 ${
                user.role === 'admin'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              <Shield className="w-3 h-3" />
              <span>Admin (Sarah)</span>
            </button>
            <button
              onClick={() => handleSwitchPortal('employee')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition flex items-center space-x-1 ${
                user.role === 'employee'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              <UserIcon className="w-3 h-3" />
              <span>Employee (Alex)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area based on User Role */}
      <main className="flex-1 pb-16">
        {user.role === 'admin' ? (
          <AdminDashboard
            user={user}
            onOpenNotifications={() => setIsNotificationOpen(true)}
            onTaskActionDone={fetchNotifications}
          />
        ) : (
          <EmployeeDashboard
            user={user}
            onOpenNotifications={() => setIsNotificationOpen(true)}
            onStatusUpdated={fetchNotifications}
          />
        )}
      </main>

      {/* Slide-over Live Email Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onRefresh={fetchNotifications}
        isRefreshing={isRefreshing}
      />
    </div>
  );
}
