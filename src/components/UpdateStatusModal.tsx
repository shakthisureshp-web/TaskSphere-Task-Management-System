import React, { useState } from 'react';
import { Task, TaskStatus } from '../types/index.js';
import { X, CheckCircle2, Clock, AlertCircle, Mail, Send } from 'lucide-react';

interface UpdateStatusModalProps {
  task: Task | null;
  onClose: () => void;
  onSubmit: (taskId: string, status: TaskStatus, notes: string) => Promise<void>;
}

export const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  task,
  onClose,
  onSubmit,
}) => {
  if (!task) return null;

  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusOptions: { value: TaskStatus; label: string; desc: string; color: string }[] = [
    {
      value: 'Not Started',
      label: 'Not Started',
      desc: 'Task is queued in backlog, work has not begun',
      color: 'border-slate-700 hover:border-slate-500 bg-slate-950/40 text-slate-300',
    },
    {
      value: 'Pending',
      label: 'Pending',
      desc: 'Blocked, paused, or waiting on external dependencies',
      color: 'border-amber-600/40 hover:border-amber-500 bg-amber-950/20 text-amber-200',
    },
    {
      value: 'In Progress',
      label: 'In Progress',
      desc: 'Actively in development, design, or active review',
      color: 'border-blue-600/40 hover:border-blue-500 bg-blue-950/20 text-blue-200',
    },
    {
      value: 'Completed',
      label: 'Completed',
      desc: 'Deliverable complete, tested, and shipped',
      color: 'border-emerald-600/40 hover:border-emerald-500 bg-emerald-950/20 text-emerald-200',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(task._id, status, notes.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update task status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Update Task Status</h3>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-sm">
              {task.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email Notification Alert Banner */}
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-200 text-xs flex items-start gap-2.5">
            <Mail className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold text-emerald-300">Admin Notification Alert: </span>
              Updating this status will immediately send an email notification to the Admin team with your notes and timestamp.
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2.5">
              Select New Status
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {statusOptions.map((opt) => {
                const isSelected = status === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatus(opt.value)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${opt.color} ${
                      isSelected
                        ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900 border-transparent shadow-lg'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">{opt.label}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                    </div>
                    <span className="text-[11px] text-slate-400 leading-tight">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Status Update Notes / Progress Comments (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Completed initial API tests. Ready for peer review."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md shadow-blue-600/30 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Updating &amp; Notifying...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Status &amp; Notify Admin</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
