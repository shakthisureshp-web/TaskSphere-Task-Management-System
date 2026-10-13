import nodemailer from 'nodemailer';
import { IEmailNotification } from '../models/types.js';
import { dbService } from './databaseService.js';

let transporter: any = null;
let isEtherealOrMock = true;

export async function initEmailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass && !user.includes('your-email@example.com')) {
    try {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      isEtherealOrMock = false;
      console.log(`[Email] Configured real SMTP transporter for: ${host}:${port} (${user})`);
    } catch (err: any) {
      console.warn(`[Email] Failed to create custom transporter: ${err.message}. Defaulting to simulated transporter.`);
    }
  } else {
    console.log('[Email] No external SMTP credentials provided; using resilient in-app email dispatcher.');
  }
}

export interface SendTaskAssignedEmailParams {
  employeeEmail: string;
  employeeName: string;
  adminName: string;
  taskTitle: string;
  taskDescription: string;
  priority: string;
  status: string;
  dueDate?: string;
  taskId: string;
}

export interface SendTaskStatusUpdatedEmailParams {
  adminEmail?: string;
  employeeName: string;
  employeeEmail: string;
  taskTitle: string;
  oldStatus?: string;
  newStatus: string;
  notes?: string;
  taskId: string;
}

export async function sendTaskAssignedEmail(params: SendTaskAssignedEmailParams): Promise<IEmailNotification> {
  const from = process.env.SMTP_FROM || 'TaskSphere <notifications@tasksphere.internal>';
  const to = params.employeeEmail;
  const subject = `[TaskSphere] New Task Assigned: ${params.taskTitle} (${params.priority} Priority)`;

  const priorityColor =
    params.priority === 'High' ? '#dc2626' : params.priority === 'Medium' ? '#f59e0b' : '#10b981';

  const bodyHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 24px; color: white; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.02em; }
        .header p { margin: 6px 0 0; opacity: 0.9; font-size: 14px; }
        .content { padding: 24px; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; color: white; background: ${priorityColor}; }
        .task-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 18px 0; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
        .detail-label { color: #64748b; font-weight: 500; }
        .detail-value { color: #0f172a; font-weight: 600; }
        .description-box { margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 14px; line-height: 1.5; color: #334155; }
        .footer { padding: 16px 24px; background: #f1f5f9; font-size: 12px; color: #64748b; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Task Assigned</h1>
          <p>Assigned by ${params.adminName} via TaskSphere</p>
        </div>
        <div class="content">
          <p>Hello <strong>${params.employeeName}</strong>,</p>
          <p>You have been assigned a new task. Please review the details below and update its status on your employee dashboard.</p>
          
          <div class="task-card">
            <div style="margin-bottom: 12px;">
              <span class="badge">${params.priority} Priority</span>
              <span style="font-size: 12px; margin-left: 8px; color: #64748b;">Status: ${params.status}</span>
            </div>
            <h2 style="margin: 0 0 10px; font-size: 18px; color: #0f172a;">${params.taskTitle}</h2>
            <div class="detail-row">
              <span class="detail-label">Due Date:</span>
              <span class="detail-value">${params.dueDate ? new Date(params.dueDate).toLocaleDateString() : 'No strict deadline'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Assigned By:</span>
              <span class="detail-value">${params.adminName}</span>
            </div>
            <div class="description-box">
              <strong>Description:</strong><br/>
              ${params.taskDescription}
            </div>
          </div>
          
          <p style="font-size: 13px; color: #475569;">
            Login to your TaskSphere Employee Portal to manage this task and mark your progress.
          </p>
        </div>
        <div class="footer">
          This is an automated notification from TaskSphere Management System.
        </div>
      </div>
    </body>
    </html>
  `;

  const bodyText = `New Task Assigned: ${params.taskTitle}\nPriority: ${params.priority}\nAssigned by: ${params.adminName}\nDescription: ${params.taskDescription}\nDue Date: ${params.dueDate || 'N/A'}`;

  let status: 'SENT' | 'SIMULATED' | 'FAILED' = 'SIMULATED';
  let errorMessage: string | undefined;

  if (transporter && !isEtherealOrMock) {
    try {
      await transporter.sendMail({
        from,
        to,
        subject,
        text: bodyText,
        html: bodyHtml,
      });
      status = 'SENT';
      console.log(`[Email] Real email dispatched successfully to ${to}`);
    } catch (err: any) {
      console.error(`[Email] Real SMTP delivery failed: ${err.message}`);
      status = 'FAILED';
      errorMessage = err.message;
    }
  } else {
    status = 'SIMULATED';
    console.log(`[Email] Notification generated and recorded in outbox for ${to}`);
  }

  const notification = await dbService.createNotification({
    to,
    toName: params.employeeName,
    from,
    subject,
    bodyHtml,
    bodyText,
    eventType: 'TASK_ASSIGNED',
    taskId: params.taskId,
    status,
    errorMessage,
    timestamp: new Date().toISOString(),
  });

  return notification;
}

export async function sendTaskStatusUpdatedEmail(
  params: SendTaskStatusUpdatedEmailParams
): Promise<IEmailNotification> {
  const from = process.env.SMTP_FROM || 'TaskSphere <notifications@tasksphere.internal>';
  const to = params.adminEmail || process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@tasksphere.internal';
  const subject = `[TaskSphere] Task Status Update: "${params.taskTitle}" moved to "${params.newStatus}"`;

  const statusColor =
    params.newStatus === 'Completed'
      ? '#10b981'
      : params.newStatus === 'In Progress'
      ? '#2563eb'
      : params.newStatus === 'Pending'
      ? '#f59e0b'
      : '#64748b';

  const bodyHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #0f172a, #1e293b); padding: 24px; color: white; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.02em; }
        .header p { margin: 6px 0 0; opacity: 0.9; font-size: 14px; }
        .content { padding: 24px; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: 600; color: white; background: ${statusColor}; }
        .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 18px 0; }
        .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
        .label { color: #64748b; font-weight: 500; }
        .value { color: #0f172a; font-weight: 600; }
        .notes-box { margin-top: 12px; padding: 12px; background: #ffffff; border: 1px dashed #cbd5e1; border-radius: 6px; font-size: 13px; color: #334155; }
        .footer { padding: 16px 24px; background: #f1f5f9; font-size: 12px; color: #64748b; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Employee Task Update</h1>
          <p>Notification for System Administrator</p>
        </div>
        <div class="content">
          <p>Hello <strong>Admin</strong>,</p>
          <p>Employee <strong>${params.employeeName}</strong> (${params.employeeEmail}) has updated the status of a task.</p>
          
          <div class="card">
            <h2 style="margin: 0 0 12px; font-size: 18px; color: #0f172a;">${params.taskTitle}</h2>
            <div style="margin-bottom: 12px;">
              <span class="label">New Status: </span>
              <span class="badge">${params.newStatus}</span>
              ${params.oldStatus ? `<span style="font-size: 12px; color: #94a3b8; margin-left: 8px;">(Previous: ${params.oldStatus})</span>` : ''}
            </div>
            <div class="row">
              <span class="label">Updated By:</span>
              <span class="value">${params.employeeName}</span>
            </div>
            <div class="row">
              <span class="label">Updated At:</span>
              <span class="value">${new Date().toLocaleString()}</span>
            </div>
            ${
              params.notes
                ? `<div class="notes-box"><strong>Employee Note:</strong><br/>${params.notes}</div>`
                : ''
            }
          </div>
          
          <p style="font-size: 13px; color: #475569;">
            You can view the full activity timeline and statistics in the Admin Task Management Dashboard.
          </p>
        </div>
        <div class="footer">
          TaskSphere Management System &bull; Automatic Admin Notification
        </div>
      </div>
    </body>
    </html>
  `;

  const bodyText = `Task Update: ${params.taskTitle}\nNew Status: ${params.newStatus}\nUpdated by: ${params.employeeName} (${params.employeeEmail})\nNotes: ${params.notes || 'None'}`;

  let status: 'SENT' | 'SIMULATED' | 'FAILED' = 'SIMULATED';
  let errorMessage: string | undefined;

  if (transporter && !isEtherealOrMock) {
    try {
      await transporter.sendMail({
        from,
        to,
        subject,
        text: bodyText,
        html: bodyHtml,
      });
      status = 'SENT';
      console.log(`[Email] Real admin notification dispatched successfully to ${to}`);
    } catch (err: any) {
      console.error(`[Email] Admin SMTP delivery failed: ${err.message}`);
      status = 'FAILED';
      errorMessage = err.message;
    }
  } else {
    status = 'SIMULATED';
    console.log(`[Email] Admin status notification recorded in outbox for ${to}`);
  }

  const notification = await dbService.createNotification({
    to,
    toName: 'Admin Team',
    from,
    subject,
    bodyHtml,
    bodyText,
    eventType: 'TASK_STATUS_UPDATED',
    taskId: params.taskId,
    status,
    errorMessage,
    timestamp: new Date().toISOString(),
  });

  return notification;
}
