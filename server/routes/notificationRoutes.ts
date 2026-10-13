import { Router, Response } from 'express';
import { dbService } from '../services/databaseService.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';

export const notificationRouter = Router();

// GET all notification logs (Admin viewable)
notificationRouter.get('/', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt((req.query.limit as string) || '50', 10);
    const notifications = await dbService.getNotifications(limit);
    return res.status(200).json({ success: true, data: notifications });
  } catch (err: any) {
    console.error('[Notifications] Error fetching logs:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve notification logs.' });
  }
});

// POST test trigger email
notificationRouter.post('/test', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const notif = await dbService.createNotification({
      to: user.email,
      toName: user.name,
      from: process.env.SMTP_FROM || 'TaskSphere <notifications@tasksphere.internal>',
      subject: `[TaskSphere] System Test Dispatch - ${new Date().toLocaleTimeString()}`,
      bodyHtml: `<div style="font-family:sans-serif;padding:20px;border-radius:8px;border:1px solid #e2e8f0;"><h2>Test Verification Dispatch</h2><p>This verifies that the Task Management System notification pipeline is active and logging correctly.</p><p>Recipient: ${user.name} &lt;${user.email}&gt;</p></div>`,
      bodyText: `Test Verification Dispatch: TaskSphere email pipeline is operating normally.`,
      eventType: 'SYSTEM_ALERT',
      status: 'SIMULATED',
      timestamp: new Date().toISOString(),
    });
    return res.status(200).json({ success: true, message: 'Test notification triggered.', data: notif });
  } catch (err: any) {
    console.error('[Notifications] Test trigger error:', err);
    return res.status(500).json({ success: false, message: 'Failed to trigger test notification.' });
  }
});
