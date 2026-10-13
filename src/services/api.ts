import { Task, User, EmployeeWithStats, TaskStats, EmailNotification } from '../types/index.js';

const TOKEN_KEY = 'tasksphere_auth_token';
const USER_KEY = 'tasksphere_auth_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  const data = localStorage.getItem(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function saveSession(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  async login(email: string, password: string, expectedRole?: 'admin' | 'employee'): Promise<{ user: User; token: string; message: string }> {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, expectedRole }),
    });
  },

  async getMe(): Promise<{ user: User }> {
    return request('/api/auth/me');
  },

  // Employees
  async getEmployees(): Promise<{ data: EmployeeWithStats[] }> {
    return request('/api/employees');
  },

  async createEmployee(data: { name: string; email: string; department?: string; phone?: string; password?: string }): Promise<{ message: string; data: User }> {
    return request('/api/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Tasks
  async getTaskStats(): Promise<{ data: TaskStats }> {
    return request('/api/tasks/stats');
  },

  async getTasks(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    priority?: string;
    assignedTo?: string;
  }): Promise<{ tasks: Task[]; total: number; page: number; limit: number; totalPages: number }> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.search) query.set('search', params.search);
    if (params.status && params.status !== 'ALL') query.set('status', params.status);
    if (params.priority && params.priority !== 'ALL') query.set('priority', params.priority);
    if (params.assignedTo) query.set('assignedTo', params.assignedTo);

    return request(`/api/tasks?${query.toString()}`);
  },

  async createTask(data: {
    title: string;
    description: string;
    assignedTo: string;
    priority: string;
    status?: string;
    dueDate?: string;
    notes?: string;
  }): Promise<{ data: Task; message: string; emailDispatched: boolean; emailNotification?: EmailNotification }> {
    return request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTaskStatus(id: string, status: string, notes?: string): Promise<{ data: Task; message: string; emailDispatched: boolean; emailNotification?: EmailNotification }> {
    return request(`/api/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  },

  async updateTask(id: string, data: Partial<Task>): Promise<{ data: Task; message: string }> {
    return request(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteTask(id: string): Promise<{ message: string }> {
    return request(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  // Notifications
  async getNotifications(limit = 30): Promise<{ data: EmailNotification[] }> {
    return request(`/api/notifications?limit=${limit}`);
  },

  async testNotification(): Promise<{ message: string; data: EmailNotification }> {
    return request('/api/notifications/test', {
      method: 'POST',
    });
  },
};
