import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { IUser, ITask, ITaskActivity, IEmailNotification, TaskPriority, TaskStatus, UserRole } from '../models/types.js';
import { isUsingMongoose } from '../db/connection.js';
import {
  MongoUserModel,
  MongoTaskModel,
  MongoNotificationModel,
} from '../models/mongooseSchemas.js';

interface DbStore {
  users: IUser[];
  tasks: ITask[];
  notifications: IEmailNotification[];
}

const DATA_FILE = path.resolve(process.cwd(), '.data', 'tasksphere_db.json');

function readLocalDb(): DbStore {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const defaultStore: DbStore = { users: [], tasks: [], notifications: [] };
      fs.writeFileSync(DATA_FILE, JSON.stringify(defaultStore, null, 2), 'utf-8');
      return defaultStore;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[DB Service] Error reading local db file:', err);
    return { users: [], tasks: [], notifications: [] };
  }
}

function writeLocalDb(data: DbStore) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB Service] Error writing local db file:', err);
  }
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

class DatabaseService {
  public async initSeedData() {
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const empPasswordHash = await bcrypt.hash('employee123', 10);

    if (isUsingMongoose()) {
      const count = await MongoUserModel.countDocuments();
      if (count === 0) {
        console.log('[Database] Seeding initial data into MongoDB...');
        const admin = await MongoUserModel.create({
          name: 'Sarah Jenkins',
          email: 'admin@tasksphere.internal',
          password: adminPasswordHash,
          role: 'admin',
          department: 'Executive Operations',
          phone: '+1 (555) 019-2834',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
          isActive: true,
        });

        const emp1 = await MongoUserModel.create({
          name: 'Alex Rivers',
          email: 'alex.rivers@tasksphere.internal',
          password: empPasswordHash,
          role: 'employee',
          department: 'Frontend Engineering',
          phone: '+1 (555) 438-1200',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          isActive: true,
        });

        const emp2 = await MongoUserModel.create({
          name: 'Maria Chen',
          email: 'maria.chen@tasksphere.internal',
          password: empPasswordHash,
          role: 'employee',
          department: 'Backend Platform',
          phone: '+1 (555) 782-9912',
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
          isActive: true,
        });

        const emp3 = await MongoUserModel.create({
          name: 'David Kim',
          email: 'david.kim@tasksphere.internal',
          password: empPasswordHash,
          role: 'employee',
          department: 'Product & UI/UX',
          phone: '+1 (555) 234-8711',
          avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
          isActive: true,
        });

        const emp4 = await MongoUserModel.create({
          name: 'Priya Sharma',
          email: 'priya.sharma@tasksphere.internal',
          password: empPasswordHash,
          role: 'employee',
          department: 'QA & DevOps',
          phone: '+1 (555) 912-3456',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          isActive: true,
        });

        // Seed initial tasks
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 3600 * 1000).toISOString().split('T')[0];
        const nextWeek = new Date(now.getTime() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0];

        await MongoTaskModel.create([
          {
            title: 'Implement Dark Mode and Accessible Color Tokens',
            description: 'Refactor Tailwind styles to include WCAG AAA compliant color contrasts for high-priority dashboards.',
            assignedTo: emp1._id.toString(),
            assignedToName: emp1.name,
            assignedToEmail: emp1.email,
            assignedBy: admin._id.toString(),
            assignedByName: admin.name,
            priority: 'High',
            status: 'In Progress',
            dueDate: tomorrow,
            notes: 'Working on palette mapping with design system.',
            activityLog: [
              {
                action: 'Task Created',
                performedBy: admin.name,
                performedByRole: 'admin',
                timestamp: new Date(now.getTime() - 86400000).toISOString(),
                details: 'Initial assignment to Alex Rivers with High priority.',
              },
              {
                action: 'Status Updated to In Progress',
                performedBy: emp1.name,
                performedByRole: 'employee',
                timestamp: new Date().toISOString(),
                details: 'Started reviewing tokens in Figma tokens export.',
              },
            ],
          },
          {
            title: 'Optimize MongoDB Aggregation Queries for Analytics',
            description: 'Add compound indexes on employee tasks table for faster pagination and status grouping.',
            assignedTo: emp2._id.toString(),
            assignedToName: emp2.name,
            assignedToEmail: emp2.email,
            assignedBy: admin._id.toString(),
            assignedByName: admin.name,
            priority: 'High',
            status: 'Pending',
            dueDate: nextWeek,
            notes: 'Awaiting execution plan approval from architecture review.',
            activityLog: [
              {
                action: 'Task Created',
                performedBy: admin.name,
                performedByRole: 'admin',
                timestamp: new Date().toISOString(),
                details: 'Assigned to Maria Chen.',
              },
            ],
          },
          {
            title: 'Design Mobile Task Card Quick-Action Layouts',
            description: 'Create swipeable task cards with fast status changers for touch devices and tablet viewports.',
            assignedTo: emp3._id.toString(),
            assignedToName: emp3.name,
            assignedToEmail: emp3.email,
            assignedBy: admin._id.toString(),
            assignedByName: admin.name,
            priority: 'Medium',
            status: 'Completed',
            dueDate: tomorrow,
            notes: 'Final designs handed off to the frontend squad.',
            activityLog: [
              {
                action: 'Task Created',
                performedBy: admin.name,
                performedByRole: 'admin',
                timestamp: new Date(now.getTime() - 172800000).toISOString(),
                details: 'Assigned to David Kim.',
              },
              {
                action: 'Status Updated to Completed',
                performedBy: emp3.name,
                performedByRole: 'employee',
                timestamp: new Date().toISOString(),
                details: 'Design prototype linked and approved.',
              },
            ],
          },
          {
            title: 'Automated CI/CD End-to-End Test Suite Setup',
            description: 'Configure Playwright headless integration tests to verify login RBAC and email dispatches.',
            assignedTo: emp4._id.toString(),
            assignedToName: emp4.name,
            assignedToEmail: emp4.email,
            assignedBy: admin._id.toString(),
            assignedByName: admin.name,
            priority: 'Medium',
            status: 'Not Started',
            dueDate: nextWeek,
            notes: '',
            activityLog: [
              {
                action: 'Task Created',
                performedBy: admin.name,
                performedByRole: 'admin',
                timestamp: new Date().toISOString(),
                details: 'Assigned to Priya Sharma.',
              },
            ],
          },
          {
            title: 'Review Security Headers and JWT Expiration Handling',
            description: 'Verify CORS policies, token refreshes, and rate limiting on employee status mutation endpoints.',
            assignedTo: emp2._id.toString(),
            assignedToName: emp2.name,
            assignedToEmail: emp2.email,
            assignedBy: admin._id.toString(),
            assignedByName: admin.name,
            priority: 'Low',
            status: 'Not Started',
            dueDate: nextWeek,
            notes: '',
            activityLog: [
              {
                action: 'Task Created',
                performedBy: admin.name,
                performedByRole: 'admin',
                timestamp: new Date().toISOString(),
                details: 'Assigned to Maria Chen.',
              },
            ],
          },
        ]);
        console.log('✅ [Database] Seed data successfully populated in MongoDB.');
      }
      return;
    }

    // Local JSON store seeding
    const db = readLocalDb();
    if (!db.users || db.users.length === 0) {
      console.log('[DB Service] Initializing local JSON seed data...');
      const adminId = 'usr_admin_001';
      const emp1Id = 'usr_emp_001';
      const emp2Id = 'usr_emp_002';
      const emp3Id = 'usr_emp_003';
      const emp4Id = 'usr_emp_004';
      const nowIso = new Date().toISOString();

      const seedUsers: IUser[] = [
        {
          _id: adminId,
          name: 'Sarah Jenkins',
          email: 'admin@tasksphere.internal',
          password: adminPasswordHash,
          role: 'admin',
          department: 'Executive Operations',
          phone: '+1 (555) 019-2834',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
          isActive: true,
          createdAt: nowIso,
          updatedAt: nowIso,
        },
        {
          _id: emp1Id,
          name: 'Alex Rivers',
          email: 'alex.rivers@tasksphere.internal',
          password: empPasswordHash,
          role: 'employee',
          department: 'Frontend Engineering',
          phone: '+1 (555) 438-1200',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          isActive: true,
          createdAt: nowIso,
          updatedAt: nowIso,
        },
        {
          _id: emp2Id,
          name: 'Maria Chen',
          email: 'maria.chen@tasksphere.internal',
          password: empPasswordHash,
          role: 'employee',
          department: 'Backend Platform',
          phone: '+1 (555) 782-9912',
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
          isActive: true,
          createdAt: nowIso,
          updatedAt: nowIso,
        },
        {
          _id: emp3Id,
          name: 'David Kim',
          email: 'david.kim@tasksphere.internal',
          password: empPasswordHash,
          role: 'employee',
          department: 'Product & UI/UX',
          phone: '+1 (555) 234-8711',
          avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
          isActive: true,
          createdAt: nowIso,
          updatedAt: nowIso,
        },
        {
          _id: emp4Id,
          name: 'Priya Sharma',
          email: 'priya.sharma@tasksphere.internal',
          password: empPasswordHash,
          role: 'employee',
          department: 'QA & DevOps',
          phone: '+1 (555) 912-3456',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          isActive: true,
          createdAt: nowIso,
          updatedAt: nowIso,
        },
      ];

      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

      const seedTasks: ITask[] = [
        {
          _id: 'task_001',
          title: 'Implement Dark Mode and Accessible Color Tokens',
          description: 'Refactor Tailwind styles to include WCAG AAA compliant color contrasts for high-priority dashboards.',
          assignedTo: emp1Id,
          assignedToName: 'Alex Rivers',
          assignedToEmail: 'alex.rivers@tasksphere.internal',
          assignedBy: adminId,
          assignedByName: 'Sarah Jenkins',
          priority: 'High',
          status: 'In Progress',
          dueDate: tomorrow,
          notes: 'Working on palette mapping with design system.',
          activityLog: [
            {
              action: 'Task Created',
              performedBy: 'Sarah Jenkins',
              performedByRole: 'admin',
              timestamp: new Date(Date.now() - 86400000).toISOString(),
              details: 'Assigned to Alex Rivers with High priority.',
            },
            {
              action: 'Status Updated to In Progress',
              performedBy: 'Alex Rivers',
              performedByRole: 'employee',
              timestamp: new Date().toISOString(),
              details: 'Started reviewing tokens in Figma tokens export.',
            },
          ],
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: 'task_002',
          title: 'Optimize MongoDB Aggregation Queries for Analytics',
          description: 'Add compound indexes on employee tasks table for faster pagination and status grouping.',
          assignedTo: emp2Id,
          assignedToName: 'Maria Chen',
          assignedToEmail: 'maria.chen@tasksphere.internal',
          assignedBy: adminId,
          assignedByName: 'Sarah Jenkins',
          priority: 'High',
          status: 'Pending',
          dueDate: nextWeek,
          notes: 'Awaiting execution plan approval from architecture review.',
          activityLog: [
            {
              action: 'Task Created',
              performedBy: 'Sarah Jenkins',
              performedByRole: 'admin',
              timestamp: new Date().toISOString(),
              details: 'Assigned to Maria Chen.',
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: 'task_003',
          title: 'Design Mobile Task Card Quick-Action Layouts',
          description: 'Create swipeable task cards with fast status changers for touch devices and tablet viewports.',
          assignedTo: emp3Id,
          assignedToName: 'David Kim',
          assignedToEmail: 'david.kim@tasksphere.internal',
          assignedBy: adminId,
          assignedByName: 'Sarah Jenkins',
          priority: 'Medium',
          status: 'Completed',
          dueDate: tomorrow,
          notes: 'Final designs handed off to the frontend squad.',
          activityLog: [
            {
              action: 'Task Created',
              performedBy: 'Sarah Jenkins',
              performedByRole: 'admin',
              timestamp: new Date(Date.now() - 172800000).toISOString(),
              details: 'Assigned to David Kim.',
            },
            {
              action: 'Status Updated to Completed',
              performedBy: 'David Kim',
              performedByRole: 'employee',
              timestamp: new Date().toISOString(),
              details: 'Design prototype linked and approved.',
            },
          ],
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: 'task_004',
          title: 'Automated CI/CD End-to-End Test Suite Setup',
          description: 'Configure Playwright headless integration tests to verify login RBAC and email dispatches.',
          assignedTo: emp4Id,
          assignedToName: 'Priya Sharma',
          assignedToEmail: 'priya.sharma@tasksphere.internal',
          assignedBy: adminId,
          assignedByName: 'Sarah Jenkins',
          priority: 'Medium',
          status: 'Not Started',
          dueDate: nextWeek,
          notes: '',
          activityLog: [
            {
              action: 'Task Created',
              performedBy: 'Sarah Jenkins',
              performedByRole: 'admin',
              timestamp: new Date().toISOString(),
              details: 'Assigned to Priya Sharma.',
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: 'task_005',
          title: 'Review Security Headers and JWT Expiration Handling',
          description: 'Verify CORS policies, token refreshes, and rate limiting on employee status mutation endpoints.',
          assignedTo: emp2Id,
          assignedToName: 'Maria Chen',
          assignedToEmail: 'maria.chen@tasksphere.internal',
          assignedBy: adminId,
          assignedByName: 'Sarah Jenkins',
          priority: 'Low',
          status: 'Not Started',
          dueDate: nextWeek,
          notes: '',
          activityLog: [
            {
              action: 'Task Created',
              performedBy: 'Sarah Jenkins',
              performedByRole: 'admin',
              timestamp: new Date().toISOString(),
              details: 'Assigned to Maria Chen.',
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      writeLocalDb({
        users: seedUsers,
        tasks: seedTasks,
        notifications: [],
      });
      console.log('✅ [DB Service] Seed data created successfully in local store.');
    }
  }

  public async findUserByEmail(email: string): Promise<IUser | null> {
    const cleanEmail = email.toLowerCase().trim();
    if (isUsingMongoose()) {
      const doc = await MongoUserModel.findOne({ email: cleanEmail }).lean();
      return doc ? { ...doc, _id: doc._id.toString() } as IUser : null;
    }
    const db = readLocalDb();
    return db.users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
  }

  public async findUserById(id: string): Promise<IUser | null> {
    if (isUsingMongoose()) {
      const doc = await MongoUserModel.findById(id).lean();
      return doc ? { ...doc, _id: doc._id.toString() } as IUser : null;
    }
    const db = readLocalDb();
    return db.users.find((u) => u._id === id) || null;
  }

  public async createUser(data: Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>): Promise<IUser> {
    const nowIso = new Date().toISOString();
    if (isUsingMongoose()) {
      const doc = await MongoUserModel.create(data);
      return { ...doc.toObject(), _id: doc._id.toString() } as IUser;
    }
    const db = readLocalDb();
    const newUser: IUser = {
      ...data,
      _id: `usr_${generateId()}`,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    db.users.push(newUser);
    writeLocalDb(db);
    return newUser;
  }

  public async getEmployees(): Promise<(Omit<IUser, 'password'> & { taskCount: number; pendingCount: number; completedCount: number })[]> {
    let employees: IUser[] = [];
    let tasks: ITask[] = [];

    if (isUsingMongoose()) {
      const userDocs = await MongoUserModel.find({ role: 'employee' }).select('-password').lean();
      employees = userDocs.map((d) => ({ ...d, _id: d._id.toString() } as IUser));
      const taskDocs = await MongoTaskModel.find().lean();
      tasks = taskDocs.map((t) => ({ ...t, _id: t._id.toString() } as ITask));
    } else {
      const db = readLocalDb();
      employees = db.users.filter((u) => u.role === 'employee');
      tasks = db.tasks;
    }

    return employees.map((emp) => {
      const empTasks = tasks.filter((t) => t.assignedTo === emp._id);
      const { password, ...safeEmp } = emp;
      return {
        ...safeEmp,
        taskCount: empTasks.length,
        pendingCount: empTasks.filter((t) => t.status !== 'Completed').length,
        completedCount: empTasks.filter((t) => t.status === 'Completed').length,
      };
    });
  }

  public async getTasks(params: {
    assignedTo?: string;
    search?: string;
    status?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }): Promise<{ tasks: ITask[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 10));

    if (isUsingMongoose()) {
      const query: any = {};
      if (params.assignedTo) {
        query.assignedTo = params.assignedTo;
      }
      if (params.status && params.status !== 'ALL') {
        query.status = params.status;
      }
      if (params.priority && params.priority !== 'ALL') {
        query.priority = params.priority;
      }
      if (params.search && params.search.trim()) {
        const regex = new RegExp(params.search.trim(), 'i');
        query.$or = [{ title: regex }, { description: regex }, { assignedToName: regex }];
      }

      const total = await MongoTaskModel.countDocuments(query);
      const docs = await MongoTaskModel.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      const tasks = docs.map((d) => ({ ...d, _id: d._id.toString() } as ITask));
      return {
        tasks,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    }

    const db = readLocalDb();
    let filtered = [...db.tasks];

    if (params.assignedTo) {
      filtered = filtered.filter((t) => t.assignedTo === params.assignedTo);
    }
    if (params.status && params.status !== 'ALL') {
      filtered = filtered.filter((t) => t.status === params.status);
    }
    if (params.priority && params.priority !== 'ALL') {
      filtered = filtered.filter((t) => t.priority === params.priority);
    }
    if (params.search && params.search.trim()) {
      const term = params.search.trim().toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(term) ||
          t.description.toLowerCase().includes(term) ||
          (t.assignedToName && t.assignedToName.toLowerCase().includes(term))
      );
    }

    // Sort descending by created/updated date
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
      tasks: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  public async getTaskById(id: string): Promise<ITask | null> {
    if (isUsingMongoose()) {
      const doc = await MongoTaskModel.findById(id).lean();
      return doc ? { ...doc, _id: doc._id.toString() } as ITask : null;
    }
    const db = readLocalDb();
    return db.tasks.find((t) => t._id === id) || null;
  }

  public async createTask(taskData: {
    title: string;
    description: string;
    assignedTo: string;
    assignedBy: string;
    priority: TaskPriority;
    status?: TaskStatus;
    dueDate?: string;
    notes?: string;
  }): Promise<ITask> {
    const assignedUser = await this.findUserById(taskData.assignedTo);
    const assignedByUser = await this.findUserById(taskData.assignedBy);
    const nowIso = new Date().toISOString();

    const activity: ITaskActivity = {
      action: 'Task Created & Assigned',
      performedBy: assignedByUser ? assignedByUser.name : 'System Admin',
      performedByRole: 'admin',
      timestamp: nowIso,
      details: `Assigned to ${assignedUser ? assignedUser.name : taskData.assignedTo} with ${taskData.priority} priority.`,
    };

    if (isUsingMongoose()) {
      const doc = await MongoTaskModel.create({
        ...taskData,
        assignedToName: assignedUser?.name || 'Assigned Employee',
        assignedToEmail: assignedUser?.email || '',
        assignedByName: assignedByUser?.name || 'Administrator',
        status: taskData.status || 'Not Started',
        activityLog: [activity],
      });
      return { ...doc.toObject(), _id: doc._id.toString() } as ITask;
    }

    const db = readLocalDb();
    const newTask: ITask = {
      _id: `task_${generateId()}`,
      title: taskData.title,
      description: taskData.description,
      assignedTo: taskData.assignedTo,
      assignedToName: assignedUser?.name || 'Assigned Employee',
      assignedToEmail: assignedUser?.email || '',
      assignedBy: taskData.assignedBy,
      assignedByName: assignedByUser?.name || 'Administrator',
      priority: taskData.priority,
      status: taskData.status || 'Not Started',
      dueDate: taskData.dueDate,
      notes: taskData.notes || '',
      activityLog: [activity],
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    db.tasks.unshift(newTask);
    writeLocalDb(db);
    return newTask;
  }

  public async updateTask(id: string, updateData: Partial<ITask>, updatedByUser: IUser): Promise<ITask | null> {
    const nowIso = new Date().toISOString();
    let assignedUser: IUser | null = null;
    if (updateData.assignedTo) {
      assignedUser = await this.findUserById(updateData.assignedTo);
    }

    const logEntry: ITaskActivity = {
      action: 'Task Details Modified',
      performedBy: updatedByUser.name,
      performedByRole: updatedByUser.role,
      timestamp: nowIso,
      details: `Updated by ${updatedByUser.name}`,
    };

    if (isUsingMongoose()) {
      const updatePayload: any = { ...updateData, updatedAt: nowIso };
      if (assignedUser) {
        updatePayload.assignedToName = assignedUser.name;
        updatePayload.assignedToEmail = assignedUser.email;
      }
      const updated = await MongoTaskModel.findByIdAndUpdate(
        id,
        {
          $set: updatePayload,
          $push: { activityLog: logEntry },
        },
        { new: true }
      ).lean();
      return updated ? { ...updated, _id: updated._id.toString() } as ITask : null;
    }

    const db = readLocalDb();
    const index = db.tasks.findIndex((t) => t._id === id);
    if (index === -1) return null;

    const existing = db.tasks[index];
    const updated: ITask = {
      ...existing,
      ...updateData,
      assignedToName: assignedUser ? assignedUser.name : existing.assignedToName,
      assignedToEmail: assignedUser ? assignedUser.email : existing.assignedToEmail,
      updatedAt: nowIso,
      activityLog: [logEntry, ...(existing.activityLog || [])],
    };

    db.tasks[index] = updated;
    writeLocalDb(db);
    return updated;
  }

  public async updateTaskStatus(
    id: string,
    newStatus: TaskStatus,
    notes: string | undefined,
    user: IUser
  ): Promise<ITask | null> {
    const nowIso = new Date().toISOString();

    if (isUsingMongoose()) {
      const task = await MongoTaskModel.findById(id);
      if (!task) return null;

      const oldStatus = task.status;
      const logEntry: ITaskActivity = {
        action: `Status updated: ${oldStatus} ➔ ${newStatus}`,
        performedBy: user.name,
        performedByRole: user.role,
        timestamp: nowIso,
        details: notes ? `Notes: ${notes}` : undefined,
      };

      task.status = newStatus;
      if (notes) task.notes = notes;
      task.updatedAt = nowIso as any;
      task.activityLog.unshift(logEntry as any);
      await task.save();

      return { ...task.toObject(), _id: task._id.toString() } as ITask;
    }

    const db = readLocalDb();
    const index = db.tasks.findIndex((t) => t._id === id);
    if (index === -1) return null;

    const task = db.tasks[index];
    const oldStatus = task.status;
    const logEntry: ITaskActivity = {
      action: `Status updated: ${oldStatus} ➔ ${newStatus}`,
      performedBy: user.name,
      performedByRole: user.role,
      timestamp: nowIso,
      details: notes ? `Notes: ${notes}` : undefined,
    };

    task.status = newStatus;
    if (notes !== undefined) task.notes = notes;
    task.updatedAt = nowIso;
    task.activityLog = [logEntry, ...(task.activityLog || [])];

    db.tasks[index] = task;
    writeLocalDb(db);
    return task;
  }

  public async deleteTask(id: string): Promise<boolean> {
    if (isUsingMongoose()) {
      const res = await MongoTaskModel.findByIdAndDelete(id);
      return !!res;
    }
    const db = readLocalDb();
    const initialLen = db.tasks.length;
    db.tasks = db.tasks.filter((t) => t._id !== id);
    writeLocalDb(db);
    return db.tasks.length < initialLen;
  }

  public async getTaskStats(userId?: string) {
    let allTasks: ITask[] = [];
    if (isUsingMongoose()) {
      const query = userId ? { assignedTo: userId } : {};
      const docs = await MongoTaskModel.find(query).lean();
      allTasks = docs.map((d) => ({ ...d, _id: d._id.toString() } as ITask));
    } else {
      const db = readLocalDb();
      allTasks = userId ? db.tasks.filter((t) => t.assignedTo === userId) : db.tasks;
    }

    const stats = {
      total: allTasks.length,
      notStarted: allTasks.filter((t) => t.status === 'Not Started').length,
      pending: allTasks.filter((t) => t.status === 'Pending').length,
      inProgress: allTasks.filter((t) => t.status === 'In Progress').length,
      completed: allTasks.filter((t) => t.status === 'Completed').length,
      // Aggregated pending / active count for quick cards
      pendingAndInProgress: allTasks.filter((t) => t.status === 'Pending' || t.status === 'In Progress').length,
      highPriority: allTasks.filter((t) => t.priority === 'High').length,
      mediumPriority: allTasks.filter((t) => t.priority === 'Medium').length,
      lowPriority: allTasks.filter((t) => t.priority === 'Low').length,
    };

    return stats;
  }

  public async createNotification(data: Omit<IEmailNotification, '_id'>): Promise<IEmailNotification> {
    if (isUsingMongoose()) {
      const doc = await MongoNotificationModel.create(data);
      return { ...doc.toObject(), _id: doc._id.toString() } as IEmailNotification;
    }
    const db = readLocalDb();
    const newNotif: IEmailNotification = {
      ...data,
      _id: `notif_${generateId()}`,
    };
    db.notifications.unshift(newNotif);
    writeLocalDb(db);
    return newNotif;
  }

  public async getNotifications(limit = 50): Promise<IEmailNotification[]> {
    if (isUsingMongoose()) {
      const docs = await MongoNotificationModel.find()
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();
      return docs.map((d) => ({ ...d, _id: d._id.toString() } as IEmailNotification));
    }
    const db = readLocalDb();
    return db.notifications.slice(0, limit);
  }
}

export const dbService = new DatabaseService();
