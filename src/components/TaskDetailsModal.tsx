import React from 'react';
import { Task } from '../types/index.js';
import { X, Calendar, User, Clock, CheckCircle2, AlertCircle, FileText, Activity } from 'lucide-react';

interface TaskDetailsModalProps {
  task: Task | null;
  onClose: () => void;
  onUpdateStatusClick?: (task: Task) => void;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  task,
  onClose,
  onUpdateStatusClick,
}) => {
  if (!task) return null;

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">High Priority</span>;
      case 'Medium':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">Medium Priority</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Low Priority</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Completed</span>;
      case 'In Progress':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> In Progress</span>;
      case 'Pending':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Pending</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/30 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Not Started</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-950/50">
          <div>
            <div className="flex items-center space-x-2.5 mb-2">
              {getStatusBadge(task.status)}
              {getPriorityBadge(task.priority)}
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">{task.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-300">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div>
              <div className="text-xs text-slate-400 font-medium mb-1">Assigned Employee</div>
              <div className="font-semibold text-slate-100 flex items-center space-x-2">
                <User className="w-4 h-4 text-blue-400" />
                <span>{task.assignedToName || 'Unassigned'}</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{task.assignedToEmail}</div>
            </div>

            <div>
              <div className="text-xs text-slate-400 font-medium mb-1">Assigned By</div>
              <div className="font-semibold text-slate-100">
                {task.assignedByName || 'System Administrator'}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Admin Management</div>
            </div>

            <div>
              <div className="text-xs text-slate-400 font-medium mb-1">Due Date</div>
              <div className="font-medium text-slate-200 flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No strict deadline'}</span>
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400 font-medium mb-1">Created &amp; Last Updated</div>
              <div className="text-xs text-slate-300">
                Created: {new Date(task.createdAt).toLocaleDateString()}
              </div>
              <div className="text-xs text-slate-500">
                Updated: {new Date(task.updatedAt).toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-400" />
              Task Description
            </h4>
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-slate-200 whitespace-pre-wrap leading-relaxed">
              {task.description}
            </div>
          </div>

          {/* Notes if any */}
          {task.notes && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Latest Employee Notes
              </h4>
              <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-900/30 text-blue-200 text-xs">
                {task.notes}
              </div>
            </div>
          )}

          {/* Activity Log / Timeline */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              Activity Audit Trail ({task.activityLog?.length || 0} events)
            </h4>
            <div className="space-y-3">
              {task.activityLog && task.activityLog.length > 0 ? (
                task.activityLog.map((log, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 text-xs"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{log.action}</span>
                        <span className="text-slate-500 text-[11px]">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-slate-400 mt-0.5">
                        By: <span className="text-slate-300 font-medium">{log.performedBy}</span> ({log.performedByRole})
                      </div>
                      {log.details && (
                        <div className="text-slate-400 text-[11px] mt-1 bg-slate-900/80 p-2 rounded border border-slate-800">
                          {log.details}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 text-xs italic">No activity logged yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
          >
            Close
          </button>
          {onUpdateStatusClick && (
            <button
              onClick={() => {
                onClose();
                onUpdateStatusClick(task);
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md shadow-blue-600/30 transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Update Status
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
