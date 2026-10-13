import { Router, Response } from 'express';
import { dbService } from '../services/databaseService.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';
import {
  sendTaskAssignedEmail,
  sendTaskStatusUpdatedEmail,
} from '../services/emailService.js';
import { TaskPriority, TaskStatus } from '../models/types.js';

export const taskRouter = Router();

// GET task statistics
taskRouter.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    // If employee, get their personal stats; if admin, get company-wide stats
    const userIdFilter = user.role === 'employee' ? user._id : undefined;
    const stats = await dbService.getTaskStats(userIdFilter);
    return res.status(200).json({ success: true, data: stats });
  } catch (err: any) {
    console.error('[Tasks] Error getting stats:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve task statistics.' });
  }
});

// GET tasks with search, filter, and pagination
taskRouter.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const priority = req.query.priority as string;
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '10', 10);

    // If employee, they can only view tasks assigned to them
    let assignedTo = req.query.assignedTo as string | undefined;
    if (user.role === 'employee') {
      assignedTo = user._id;
    }

    const result = await dbService.getTasks({
      assignedTo,
      search,
      status,
      priority,
      page,
      limit,
    });

    return res.status(200).json({ success: true, ...result });
  } catch (err: any) {
    console.error('[Tasks] Error getting tasks:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve tasks.' });
  }
});

// GET single task details
taskRouter.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const task = await dbService.getTaskById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    // Role check: Employee can only see tasks assigned to them
    if (user.role === 'employee' && task.assignedTo !== user._id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this task.' });
    }

    return res.status(200).json({ success: true, data: task });
  } catch (err: any) {
    console.error('[Tasks] Error retrieving task:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve task.' });
  }
});

// POST assign new task (Admin only)
taskRouter.post('/', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, assignedTo, priority, status, dueDate, notes } = req.body;

    if (!title || !description || !assignedTo) {
      return res.status(400).json({
        success: false,
        message: 'Task title, description, and assigned employee are required.',
      });
    }

    const employee = await dbService.findUserById(assignedTo);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Assigned employee was not found.' });
    }

    const validPriority: TaskPriority = ['High', 'Medium', 'Low'].includes(priority)
      ? priority
      : 'Medium';
    const validStatus: TaskStatus = ['Not Started', 'Pending', 'In Progress', 'Completed'].includes(
      status
    )
      ? status
      : 'Not Started';

    const newTask = await dbService.createTask({
      title: title.trim(),
      description: description.trim(),
      assignedTo: employee._id,
      assignedBy: req.user!._id,
      priority: validPriority,
      status: validStatus,
      dueDate,
      notes,
    });

    // Send email notification to employee
    let emailDispatched = false;
    let notificationRecord = null;
    try {
      notificationRecord = await sendTaskAssignedEmail({
        employeeEmail: employee.email,
        employeeName: employee.name,
        adminName: req.user!.name,
        taskTitle: newTask.title,
        taskDescription: newTask.description,
        priority: newTask.priority,
        status: newTask.status,
        dueDate: newTask.dueDate,
        taskId: newTask._id,
      });
      emailDispatched = true;
    } catch (emailErr: any) {
      console.error('[Tasks] Error sending assignment email:', emailErr);
    }

    return res.status(201).json({
      success: true,
      message: `Task "${newTask.title}" assigned to ${employee.name}. Email notification dispatched.`,
      data: newTask,
      emailNotification: notificationRecord,
      emailDispatched,
    });
  } catch (err: any) {
    console.error('[Tasks] Error assigning task:', err);
    return res.status(500).json({ success: false, message: 'Failed to assign task.' });
  }
});

// PATCH update task status (Employee or Admin)
taskRouter.patch('/:id/status', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { status, notes } = req.body;

    if (!status || !['Not Started', 'Pending', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required: Not Started, Pending, In Progress, or Completed.',
      });
    }

    const task = await dbService.getTaskById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    // Role check: Employee can only update status of their own assigned tasks
    if (user.role === 'employee' && task.assignedTo !== user._id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update the status of tasks assigned to you.',
      });
    }

    const oldStatus = task.status;
    const updatedTask = await dbService.updateTaskStatus(
      task._id,
      status as TaskStatus,
      notes,
      user
    );

    // If an employee updates the status, notify Admin via email
    let emailDispatched = false;
    let notificationRecord = null;
    if (user.role === 'employee') {
      try {
        notificationRecord = await sendTaskStatusUpdatedEmail({
          employeeName: user.name,
          employeeEmail: user.email,
          taskTitle: task.title,
          oldStatus,
          newStatus: status,
          notes,
          taskId: task._id,
        });
        emailDispatched = true;
      } catch (emailErr: any) {
        console.error('[Tasks] Error sending admin status update email:', emailErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Task status updated to "${status}". ${user.role === 'employee' ? 'Admin notified via email.' : ''}`,
      data: updatedTask,
      emailNotification: notificationRecord,
      emailDispatched,
    });
  } catch (err: any) {
    console.error('[Tasks] Error updating task status:', err);
    return res.status(500).json({ success: false, message: 'Failed to update task status.' });
  }
});

// PUT update entire task (Admin only)
taskRouter.put('/:id', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, assignedTo, priority, status, dueDate, notes } = req.body;

    const existing = await dbService.getTaskById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const updated = await dbService.updateTask(
      req.params.id,
      {
        title,
        description,
        assignedTo,
        priority,
        status,
        dueDate,
        notes,
      },
      req.user!
    );

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      data: updated,
    });
  } catch (err: any) {
    console.error('[Tasks] Error modifying task:', err);
    return res.status(500).json({ success: false, message: 'Failed to update task details.' });
  }
});

// DELETE task (Admin only)
taskRouter.delete('/:id', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await dbService.deleteTask(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Task not found or already deleted.' });
    }

    return res.status(200).json({ success: true, message: 'Task deleted successfully.' });
  } catch (err: any) {
    console.error('[Tasks] Error deleting task:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete task.' });
  }
});
