import React, { useState, useEffect, useCallback } from 'react';
import { User, Task, TaskStats, TaskStatus } from '../types/index.js';
import { api } from '../services/api.js';
import { UpdateStatusModal } from './UpdateStatusModal.js';
import { TaskDetailsModal } from './TaskDetailsModal.js';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Mail,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface EmployeeDashboardProps {
  user: User;
  onOpenNotifications: () => void;
  onStatusUpdated?: () => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  user,
  onOpenNotifications,
  onStatusUpdated,
}) => {
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    notStarted: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    pendingAndInProgress: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0,
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);

  // Modals
  const [taskForStatusUpdate, setTaskForStatusUpdate] = useState<Task | null>(null);
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState<Task | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error'; emailDispatched?: boolean } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success', emailDispatched?: boolean) => {
    setToastMessage({ text, type, emailDispatched });
    setTimeout(() => {
      setToastMessage(null);
    }, 6000);
  };

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.getTaskStats();
      setStats(res.data);
    } catch (err: any) {
      console.error('Error fetching employee stats:', err);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getTasks({
        page: currentPage,
        limit: pageSize,
        search: searchQuery,
        status: statusFilter,
        priority: priorityFilter,
      });
      setTasks(res.tasks);
      setTotalTasks(res.total);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      console.error('Error fetching employee tasks:', err);
      showToast(err.message || 'Failed to fetch tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleFilterChange = (setter: (v: any) => void, value: any) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus, notes: string) => {
    try {
      const res = await api.updateTaskStatus(taskId, newStatus, notes);
      showToast(
        `Task status updated to "${newStatus}". Automated email notification dispatched to Admin!`,
        'success',
        true
      );
      fetchTasks();
      fetchStats();
      if (onStatusUpdated) onStatusUpdated();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
      throw err;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return (
          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30">
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30">
            Medium
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            Low
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Completed
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <Clock className="w-3 h-3 text-blue-400" /> In Progress
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3 text-amber-400" /> Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/30">
            <AlertCircle className="w-3 h-3 text-slate-400" /> Not Started
          </span>
        );
    }
  };

  const completionPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`p-4 rounded-xl shadow-lg border flex items-center justify-between text-sm animate-in slide-in-from-top-4 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-600/50 text-emerald-100'
              : 'bg-rose-950/80 border-rose-600/50 text-rose-100'
          }`}
        >
          <div className="flex items-center space-x-3">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          {toastMessage.emailDispatched && (
            <button
              onClick={onOpenNotifications}
              className="ml-4 px-2.5 py-1 text-xs font-semibold bg-emerald-700/60 hover:bg-emerald-600 text-white rounded-lg transition flex items-center space-x-1"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Inspect Outbox Email</span>
            </button>
          )}
        </div>
      )}

      {/* Top Banner / Welcome */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center ring-4 ring-slate-800 shadow-xl overflow-hidden flex-shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-white">{user.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                <span>Employee Portal</span>
                <span>&bull;</span>
                <span>{user.department}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome back, {user.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Review your workload, update statuses in real-time, and log your progress.
              </p>
            </div>
          </div>

          {/* Progress Card */}
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl min-w-[220px]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400 font-medium">Sprint Completion</span>
              <span className="text-emerald-400 font-bold">{completionPercentage}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
              <span>{stats.completed} Completed</span>
              <span>{stats.total} Assigned</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div
          onClick={() => handleFilterChange(setStatusFilter, 'ALL')}
          className={`cursor-pointer bg-slate-900 border p-5 rounded-2xl shadow-md transition hover:border-slate-600 ${
            statusFilter === 'ALL' ? 'border-blue-500/50 ring-1 ring-blue-500/50' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Assigned To You</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{stats.total}</span>
            <span className="text-xs text-slate-500 font-medium">Total tasks</span>
          </div>
        </div>

        {/* Not Started */}
        <div
          onClick={() => handleFilterChange(setStatusFilter, 'Not Started')}
          className={`cursor-pointer bg-slate-900 border p-5 rounded-2xl shadow-md transition hover:border-slate-600 ${
            statusFilter === 'Not Started' ? 'border-slate-400 ring-1 ring-slate-400' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Not Started</span>
            <div className="w-8 h-8 rounded-lg bg-slate-700/40 text-slate-300 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-200">{stats.notStarted}</span>
            <span className="text-xs text-slate-500 font-medium">To be picked up</span>
          </div>
        </div>

        {/* Pending / In Progress */}
        <div
          onClick={() => handleFilterChange(setStatusFilter, statusFilter === 'In Progress' ? 'Pending' : 'In Progress')}
          className={`cursor-pointer bg-slate-900 border p-5 rounded-2xl shadow-md transition hover:border-amber-600 ${
            statusFilter === 'In Progress' || statusFilter === 'Pending'
              ? 'border-amber-500/60 ring-1 ring-amber-500/60'
              : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400/90 uppercase">Pending / In Progress</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-amber-300">{stats.pendingAndInProgress}</span>
            <span className="text-xs text-slate-400 font-medium">
              {stats.inProgress} In Progress &bull; {stats.pending} Pending
            </span>
          </div>
        </div>

        {/* Completed */}
        <div
          onClick={() => handleFilterChange(setStatusFilter, 'Completed')}
          className={`cursor-pointer bg-slate-900 border p-5 rounded-2xl shadow-md transition hover:border-emerald-600 ${
            statusFilter === 'Completed' ? 'border-emerald-500/60 ring-1 ring-emerald-500/60' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400/90 uppercase">Completed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-emerald-300">{stats.completed}</span>
            <span className="text-xs text-emerald-500/80 font-medium">Finished tasks</span>
          </div>
        </div>
      </div>

      {/* Task Controls & Table */}
      <div className="space-y-4">
        {/* Search & Filters */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
              placeholder="Search assigned tasks by title or keywords..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2.5">
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Not Started">Not Started</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => handleFilterChange(setPriorityFilter, e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {(searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                  setPriorityFilter('ALL');
                  setCurrentPage(1);
                }}
                className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Tasks Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-4">Task</th>
                  <th scope="col" className="px-6 py-4">Priority</th>
                  <th scope="col" className="px-6 py-4">Current Status</th>
                  <th scope="col" className="px-6 py-4">Due Date</th>
                  <th scope="col" className="px-6 py-4">Assigned By</th>
                  <th scope="col" className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <span>Loading your tasks...</span>
                      </div>
                    </td>
                  </tr>
                ) : tasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <Layers className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                      <p className="font-semibold text-slate-400">No tasks assigned or matching filters</p>
                      <p className="text-xs text-slate-600 mt-1">Check back later or adjust your search filter</p>
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr
                      key={task._id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedTaskForDetails(task)}
                    >
                      <td className="px-6 py-4 max-w-sm">
                        <div className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                          {task.title}
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {task.description}
                        </p>
                        {task.notes && (
                          <div className="text-[11px] text-blue-300 mt-1 italic">
                            Latest note: {task.notes}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPriorityBadge(task.priority)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(task.status)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                        {task.dueDate ? (
                          <span className="flex items-center space-x-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                          </span>
                        ) : (
                          <span className="text-slate-600">&mdash;</span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                        {task.assignedByName || 'Admin'}
                      </td>

                      <td
                        className="px-6 py-4 whitespace-nowrap text-right text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedTaskForDetails(task)}
                            title="View Full Details"
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setTaskForStatusUpdate(task)}
                            className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Update Status</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 bg-slate-950/70 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              Showing {totalTasks === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, totalTasks)} of {totalTasks} assigned tasks
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center space-x-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <div className="px-3 py-1 font-semibold text-white bg-slate-800 rounded-lg border border-slate-700">
                {currentPage} / {totalPages}
              </div>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center space-x-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UpdateStatusModal
        task={taskForStatusUpdate}
        onClose={() => setTaskForStatusUpdate(null)}
        onSubmit={handleUpdateStatus}
      />

      <TaskDetailsModal
        task={selectedTaskForDetails}
        onClose={() => setSelectedTaskForDetails(null)}
        onUpdateStatusClick={(t) => setTaskForStatusUpdate(t)}
      />
    </div>
  );
};
