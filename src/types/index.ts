export type UserRole = 'admin' | 'employee';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
}

export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Not Started' | 'Pending' | 'In Progress' | 'Completed';

export interface TaskActivity {
  action: string;
  performedBy: string;
  performedByRole: UserRole;
  timestamp: string;
  details?: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedToName?: string;
  assignedToEmail?: string;
  assignedBy: string;
  assignedByName?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  notes?: string;
  activityLog: TaskActivity[];
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeWithStats extends User {
  taskCount: number;
  pendingCount: number;
  completedCount: number;
}

export interface TaskStats {
  total: number;
  notStarted: number;
  pending: number;
  inProgress: number;
  completed: number;
  pendingAndInProgress: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
}

export interface EmailNotification {
  _id: string;
  to: string;
  toName?: string;
  from: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  eventType: 'TASK_ASSIGNED' | 'TASK_STATUS_UPDATED' | 'SYSTEM_ALERT';
  taskId?: string;
  status: 'SENT' | 'SIMULATED' | 'FAILED';
  errorMessage?: string;
  timestamp: string;
}
