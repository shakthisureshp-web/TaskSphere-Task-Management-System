import React, { useState } from 'react';
import { EmailNotification } from '../types/index.js';
import { X, Mail, Send, Eye, CheckCircle2, Clock, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';
import { api } from '../services/api.js';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: EmailNotification[];
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onRefresh,
  isRefreshing,
}) => {
  const [selectedNotif, setSelectedNotif] = useState<EmailNotification | null>(null);
  const [testSending, setTestSending] = useState(false);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendTest = async () => {
    setTestSending(true);
    setTestSuccess(null);
    try {
      const res = await api.testNotification();
      setTestSuccess('Test notification dispatched and logged to outbox!');
      onRefresh();
      setSelectedNotif(res.data);
    } catch (err: any) {
      setTestSuccess(`Failed: ${err.message}`);
    } finally {
      setTestSending(false);
    }
  };

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'TASK_ASSIGNED':
        return (
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
            Task Assigned
          </span>
        );
      case 'TASK_STATUS_UPDATED':
        return (
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Status Updated
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/30">
            System Alert
          </span>
        );
    }
  };

  const activeNotif = selectedNotif || (notifications.length > 0 ? notifications[0] : null);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-4xl h-full flex flex-col shadow-2xl">
        {/* Top Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Live Email Outbox &amp; Notifications</h3>
                <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {notifications.length} Sent
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Inspect every email dispatched upon task assignments and status updates
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onRefresh}
              title="Refresh Outbox"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action bar for testing */}
        <div className="px-5 py-3 bg-slate-950/50 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-400">
            Emails are rendered with high-fidelity HTML responsive templates.
          </span>
          <button
            onClick={handleSendTest}
            disabled={testSending}
            className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{testSending ? 'Sending Test...' : 'Send Test Notification'}</span>
          </button>
        </div>

        {testSuccess && (
          <div className="mx-5 mt-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{testSuccess}</span>
          </div>
        )}

        {/* Two-panel outbox: Left list, Right email viewer */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* List panel */}
          <div className="w-full md:w-5/12 border-r border-slate-800 overflow-y-auto divide-y divide-slate-800/60 bg-slate-950/20">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                <Mail className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p>No email notifications dispatched yet.</p>
                <p className="mt-1 text-slate-600">Assign a task or update status to trigger automated emails.</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isSelected = activeNotif?._id === notif._id;
                return (
                  <button
                    key={notif._id}
                    onClick={() => setSelectedNotif(notif)}
                    className={`w-full text-left p-3.5 transition flex flex-col space-y-1.5 ${
                      isSelected
                        ? 'bg-blue-600/10 border-l-4 border-l-blue-500 text-slate-100'
                        : 'hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      {getEventBadge(notif.eventType)}
                      <span className="text-slate-500">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="font-semibold text-xs text-white truncate">
                      {notif.subject}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="truncate">To: {notif.toName || notif.to}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                          notif.status === 'SENT'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-indigo-500/20 text-indigo-300'
                        }`}
                      >
                        {notif.status}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Detailed viewer panel */}
          <div className="flex-1 flex flex-col min-h-0 bg-slate-900 overflow-hidden">
            {activeNotif ? (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Email headers */}
                <div className="p-4 border-b border-slate-800 bg-slate-950/40 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Subject:</span>
                    <span className="font-semibold text-white">{activeNotif.subject}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">To:</span>
                    <span className="text-slate-200">
                      {activeNotif.toName ? `${activeNotif.toName} <${activeNotif.to}>` : activeNotif.to}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">From:</span>
                    <span className="text-slate-300">{activeNotif.from}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Dispatched:</span>
                    <span className="text-slate-300">{new Date(activeNotif.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Status:</span>
                    <span className="flex items-center space-x-1.5 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{activeNotif.status === 'SENT' ? 'Sent via Real SMTP' : 'Dispatched & Logged (Simulated SMTP)'}</span>
                    </span>
                  </div>
                </div>

                {/* HTML rendering container */}
                <div className="flex-1 p-4 overflow-y-auto bg-slate-950">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Rendered Email Preview</span>
                    <span className="text-[10px] text-slate-500 font-normal">HTML Payload</span>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-white p-4 shadow-inner overflow-x-auto text-slate-900">
                    <div dangerouslySetInnerHTML={{ __html: activeNotif.bodyHtml }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
                Select an email notification from the left list to inspect its contents.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
