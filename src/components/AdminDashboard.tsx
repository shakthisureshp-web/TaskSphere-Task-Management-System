import React, { useState, useEffect, useCallback } from 'react';
import { User, Task, EmployeeWithStats, TaskStats, TaskPriority, TaskStatus, EmailNotification } from '../types/index.js';
import { api } from '../services/api.js';
import { AssignTaskModal } from './AssignTaskModal.js';
import { AddEmployeeModal } from './AddEmployeeModal.js';
import { TaskDetailsModal } from './TaskDetailsModal.js';
import {
  Search,
  Filter,
  Plus,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Trash2,
  Edit3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Mail,
  Layers,
  ArrowUpDown,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface AdminDashboardProps {
  user: User;
  onOpenNotifications: () => void;
  onTaskActionDone?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  onOpenNotifications,
  onTaskActionDone,
}) => {
  // Statistics state
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

  // Task listing state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [employeeFilter, setEmployeeFilter] = useState('');

  // Employees state
  const [employees, setEmployees] = useState<EmployeeWithStats[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'tasks' | 'employees'>('tasks');

  // Modals state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState<Task | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [preselectedEmpId, setPreselectedEmpId] = useState<string | undefined>(undefined);

  // Feedback banner / toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error'; emailDispatched?: boolean } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success', emailDispatched?: boolean) => {
    setToastMessage({ text, type, emailDispatched });
    setTimeout(() => {
      setToastMessage(null);
    }, 6000);
  };

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.getTaskStats();
      setStats(res.data);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  // Fetch employees
  const fetchEmployees = useCallback(async () => {
    setLoadingEmployees(true);
    try {
      const res = await api.getEmployees();
      setEmployees(res.data);
    } catch (err: any) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoadingEmployees(false);
    }
  }, []);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    setLoadingTasks(true);
    try {
      const res = await api.getTasks({
        page: currentPage,
        limit: pageSize,
        search: searchQuery,
        status: statusFilter,
        priority: priorityFilter,
        assignedTo: employeeFilter || undefined,
      });
      setTasks(res.tasks);
      setTotalTasks(res.total);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      showToast(err.message || 'Failed to fetch tasks', 'error');
    } finally {
      setLoadingTasks(false);
    }
  }, [currentPage, pageSize, searchQuery, statusFilter, priorityFilter, employeeFilter]);

  // Initial load
  useEffect(() => {
    fetchStats();
    fetchEmployees();
  }, [fetchStats, fetchEmployees]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Reset to page 1 whenever filters change
  const handleFilterChange = (setter: (v: any) => void, value: any) => {
    setter(value);
    setCurrentPage(1);
  };

  // Assign or edit task submission
  const handleSaveTask = async (taskData: {
    title: string;
    description: string;
    assignedTo: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate?: string;
    notes?: string;
  }) => {
    if (taskToEdit) {
      await api.updateTask(taskToEdit._id, taskData);
      showToast(`Task "${taskData.title}" updated successfully.`);
    } else {
      const res = await api.createTask(taskData);
      showToast(
        `Task assigned to ${employees.find((e) => e._id === taskData.assignedTo)?.name || 'employee'}. Automated email notification dispatched.`,
        'success',
        true
      );
    }
    fetchTasks();
    fetchStats();
    fetchEmployees();
    if (onTaskActionDone) onTaskActionDone();
  };

  // Delete task
  const handleDeleteTask = async (taskId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete task "${title}"?`)) return;

    try {
      await api.deleteTask(taskId);
      showToast(`Task "${title}" was deleted.`);
      fetchTasks();
      fetchStats();
      fetchEmployees();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete task', 'error');
    }
  };

  // Add new employee
  const handleAddEmployee = async (empData: {
    name: string;
    email: string;
    department: string;
    phone?: string;
    password?: string;
  }) => {
    const res = await api.createEmployee(empData);
    showToast(res.message);
    fetchEmployees();
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
              <span>Inspect Email</span>
            </button>
          )}
        </div>
      )}

      {/* Top Banner / Welcome */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
              <span>Admin Management Hub</span>
              <span>&bull;</span>
              <span>Operations Control</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Enterprise Task Management
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Assign and monitor company initiatives, supervise employee workloads, and oversee automatic email dispatch workflows.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-3">
            <button
              onClick={() => {
                setTaskToEdit(null);
                setPreselectedEmpId(undefined);
                setIsAssignModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Assign New Task</span>
            </button>

            <button
              onClick={() => setIsAddEmployeeModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4 text-emerald-400" />
              <span>Add Employee</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards (Requested: Not Started, Pending / In Progress, Completed) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div
          onClick={() => handleFilterChange(setStatusFilter, 'ALL')}
          className={`cursor-pointer bg-slate-900 border p-5 rounded-2xl shadow-md transition hover:border-slate-600 ${
            statusFilter === 'ALL' ? 'border-blue-500/50 ring-1 ring-blue-500/50' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Total Tasks</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{stats.total}</span>
            <span className="text-xs text-slate-500 font-medium">All assigned</span>
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
            <span className="text-xs text-slate-500 font-medium">In backlog</span>
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
              {stats.inProgress} Active &bull; {stats.pending} Waiting
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
            <span className="text-xs text-emerald-500/80 font-medium">
              {stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}% done` : '0%'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center space-x-2 ${
            activeTab === 'tasks'
              ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Assigned Tasks Directory</span>
          <span className="px-1.5 py-0.2 rounded-full text-xs bg-slate-800 text-slate-300">
            {totalTasks}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('employees')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center space-x-2 ${
            activeTab === 'employees'
              ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Employees List</span>
          <span className="px-1.5 py-0.2 rounded-full text-xs bg-slate-800 text-slate-300">
            {employees.length}
          </span>
        </button>
      </div>

      {/* TAB 1: Assigned Tasks Table & Controls */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
                placeholder="Search tasks by title, description, or employee name..."
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Status Filter */}
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

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => handleFilterChange(setPriorityFilter, e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Priorities</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>

              {/* Employee Filter */}
              <select
                value={employeeFilter}
                onChange={(e) => handleFilterChange(setEmployeeFilter, e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name}
                  </option>
                ))}
              </select>

              {(searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || employeeFilter) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                    setPriorityFilter('ALL');
                    setEmployeeFilter('');
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/70 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-6 py-4">Task Details</th>
                    <th scope="col" className="px-6 py-4">Assigned Employee</th>
                    <th scope="col" className="px-6 py-4">Priority</th>
                    <th scope="col" className="px-6 py-4">Status</th>
                    <th scope="col" className="px-6 py-4">Due Date</th>
                    <th scope="col" className="px-6 py-4">Created</th>
                    <th scope="col" className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {loadingTasks ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          <span>Loading tasks...</span>
                        </div>
                      </td>
                    </tr>
                  ) : tasks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                        <Layers className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                        <p className="font-semibold text-slate-400">No tasks found matching your criteria</p>
                        <p className="text-xs text-slate-600 mt-1">Try adjusting your filters or search keywords</p>
                      </td>
                    </tr>
                  ) : (
                    tasks.map((task) => (
                      <tr
                        key={task._id}
                        className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                        onClick={() => setSelectedTaskForDetails(task)}
                      >
                        <td className="px-6 py-4 max-w-xs">
                          <div className="font-bold text-white group-hover:text-blue-400 transition-colors">
                            {task.title}
                          </div>
                          <p className="text-xs text-slate-400 truncate mt-0.5">
                            {task.description}
                          </p>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                              {task.assignedToName ? task.assignedToName.charAt(0) : 'U'}
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-slate-200">
                                {task.assignedToName || 'Unassigned'}
                              </div>
                              <div className="text-[11px] text-slate-500">{task.assignedToEmail}</div>
                            </div>
                          </div>
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

                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                          {new Date(task.createdAt).toLocaleDateString()}
                        </td>

                        <td
                          className="px-6 py-4 whitespace-nowrap text-right text-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => setSelectedTaskForDetails(task)}
                              title="View Activity Details"
                              className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                setTaskToEdit(task);
                                setIsAssignModalOpen(true);
                              }}
                              title="Edit Task"
                              className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteTask(task._id, task.title)}
                              title="Delete Task"
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="px-6 py-4 bg-slate-950/70 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <span>Showing</span>
                <span className="font-semibold text-white">
                  {totalTasks === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                </span>
                <span>to</span>
                <span className="font-semibold text-white">
                  {Math.min(currentPage * pageSize, totalTasks)}
                </span>
                <span>of</span>
                <span className="font-semibold text-white">{totalTasks}</span>
                <span>tasks</span>

                <span className="mx-2 text-slate-700">|</span>

                <label className="flex items-center space-x-1.5">
                  <span>Per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs text-white focus:outline-none"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </label>
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
      )}

      {/* TAB 2: Employee List View */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Employee Roster &amp; Workload Distribution</h2>
            <button
              onClick={() => setIsAddEmployeeModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition flex items-center space-x-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Employee</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((emp) => (
              <div
                key={emp._id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden ring-2 ring-slate-700">
                        {emp.avatar ? (
                          <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">
                            {emp.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">{emp.name}</h3>
                        <p className="text-xs text-blue-400">{emp.department}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>Email:</span>
                      <span className="text-slate-200 font-mono text-[11px] truncate max-w-[180px]">
                        {emp.email}
                      </span>
                    </div>
                    {emp.phone && (
                      <div className="flex items-center justify-between">
                        <span>Phone:</span>
                        <span className="text-slate-300">{emp.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Task metrics */}
                  <div className="mt-4 grid grid-cols-3 gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-center">
                    <div>
                      <div className="text-base font-bold text-white">{emp.taskCount}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Total</div>
                    </div>
                    <div>
                      <div className="text-base font-bold text-amber-400">{emp.pendingCount}</div>
                      <div className="text-[10px] text-amber-400/80 uppercase font-semibold">Pending</div>
                    </div>
                    <div>
                      <div className="text-base font-bold text-emerald-400">{emp.completedCount}</div>
                      <div className="text-[10px] text-emerald-400/80 uppercase font-semibold">Done</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setEmployeeFilter(emp._id);
                      setActiveTab('tasks');
                    }}
                    className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition"
                  >
                    View Tasks
                  </button>
                  <button
                    onClick={() => {
                      setPreselectedEmpId(emp._id);
                      setTaskToEdit(null);
                      setIsAssignModalOpen(true);
                    }}
                    className="flex-1 py-1.5 px-2 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 rounded-lg text-xs font-semibold transition flex items-center justify-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Assign Task</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <AssignTaskModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setTaskToEdit(null);
          setPreselectedEmpId(undefined);
        }}
        onSubmit={handleSaveTask}
        employees={employees}
        editingTask={taskToEdit}
        preselectedEmployeeId={preselectedEmpId}
      />

      <AddEmployeeModal
        isOpen={isAddEmployeeModalOpen}
        onClose={() => setIsAddEmployeeModalOpen(false)}
        onSubmit={handleAddEmployee}
      />

      <TaskDetailsModal
        task={selectedTaskForDetails}
        onClose={() => setSelectedTaskForDetails(null)}
      />
    </div>
  );
};
