import mongoose, { Schema, Document } from 'mongoose';
import { IUser, ITask, IEmailNotification } from './types.js';

export interface UserDocument extends Omit<IUser, '_id'>, Document {}
export interface TaskDocument extends Omit<ITask, '_id'>, Document {}
export interface NotificationDocument extends Omit<IEmailNotification, '_id'>, Document {}

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'employee'], required: true, default: 'employee' },
    department: { type: String, default: 'Engineering' },
    phone: { type: String, default: '' },
    avatar: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const TaskSchema = new Schema<TaskDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    assignedTo: { type: String, required: true, ref: 'User' },
    assignedToName: { type: String },
    assignedToEmail: { type: String },
    assignedBy: { type: String, required: true, ref: 'User' },
    assignedByName: { type: String },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], required: true, default: 'Medium' },
    status: {
      type: String,
      enum: ['Not Started', 'Pending', 'In Progress', 'Completed'],
      required: true,
      default: 'Not Started',
    },
    dueDate: { type: String },
    notes: { type: String, default: '' },
    activityLog: [
      {
        action: { type: String, required: true },
        performedBy: { type: String, required: true },
        performedByRole: { type: String, required: true },
        timestamp: { type: String, required: true },
        details: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const NotificationSchema = new Schema<NotificationDocument>(
  {
    to: { type: String, required: true },
    toName: { type: String },
    from: { type: String, required: true },
    subject: { type: String, required: true },
    bodyHtml: { type: String, required: true },
    bodyText: { type: String, required: true },
    eventType: {
      type: String,
      enum: ['TASK_ASSIGNED', 'TASK_STATUS_UPDATED', 'SYSTEM_ALERT'],
      required: true,
    },
    taskId: { type: String },
    status: { type: String, enum: ['SENT', 'SIMULATED', 'FAILED'], required: true },
    errorMessage: { type: String },
    timestamp: { type: String, required: true },
  },
  { timestamps: true }
);

export const MongoUserModel = mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);
export const MongoTaskModel = mongoose.models.Task || mongoose.model<TaskDocument>('Task', TaskSchema);
export const MongoNotificationModel =
  mongoose.models.Notification || mongoose.model<NotificationDocument>('Notification', NotificationSchema);
