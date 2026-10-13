export type UserRole = 'admin' | 'employee';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  department: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Not Started' | 'Pending' | 'In Progress' | 'Completed';

export interface ITaskActivity {
  action: string;
  performedBy: string;
  performedByRole: UserRole;
  timestamp: string;
  details?: string;
}

export interface ITask {
  _id: string;
  title: string;
  description: string;
  assignedTo: string; // Employee User ID
  assignedToName?: string;
  assignedToEmail?: string;
  assignedBy: string; // Admin User ID
  assignedByName?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  notes?: string;
  activityLog: ITaskActivity[];
  createdAt: string;
  updatedAt: string;
}

export interface IEmailNotification {
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
