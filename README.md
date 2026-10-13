# TaskSphere - Enterprise MERN Task Management System

A role-based Task Management System built with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js) featuring separate **Admin** and **Employee** portals, automated email notification dispatch, task statistics, search, and pagination.

---

## 🌟 Key Features

### 1. Authentication & Role-Based Access Control (RBAC)
- **Separate Portals**: Dedicated Admin Portal and Employee Portal with clean tabbed interface.
- **One-Click Quick Login**: Instant demo credentials fill for Admin and Employees.
- **Security**: JWT-based authentication with bcrypt password hashing and token persistence.
- **Access Guard**: Strict role verification preventing unauthorized endpoints and route access.

### 2. Admin Module
- **Employee Directory**: View all employees with real-time assigned, pending, and completed task counters.
- **Task Assignment**: Assign tasks with Title, Description, Assigned Employee, Priority (High, Medium, Low), Status, and Due Date.
- **Automated Email Notifications**: Automatically sends a styled HTML notification to the employee when a task is assigned.
- **Dashboard Statistics**:
  - Total Tasks
  - Not Started
  - Pending / In Progress
  - Completed
  - Interactive filter click on stat cards.
- **Assigned Tasks Table**:
  - Live search across task title, description, and assigned employee.
  - Multi-criteria filtering by Status, Priority, and Employee.
  - Full server-side pagination with custom page sizes (5, 10, 20, 50).
  - Detailed Task View Modal with complete activity audit trail.
  - Edit and Delete actions.
- **Add Employee**: Direct provisioning of employee accounts with departmental assignment.

### 3. Employee Module
- **Personalized Dashboard**: View assigned tasks, department badge, and sprint completion percentage bar.
- **Task Status Updates**:
  - Update status to: *Not Started*, *Pending*, *In Progress*, *Completed*.
  - Add progress notes and changelog comments.
- **Automated Admin Notification**: Updates immediately dispatch an email notification to the Admin with status change details.
- **Activity Log Audit**: Comprehensive event timeline tracking who modified the task and when.
- **Search & Pagination**: Find personal tasks instantly with pagination controls.

### 4. Email Notification Integration
- **Nodemailer Engine**: Real SMTP dispatch support (e.g. Gmail, SendGrid, Amazon SES, or Ethereal).
- **In-App Live Outbox Inspector**: Interactive drawer letting users view every dispatched email with rendered HTML preview, recipient, sender, subject, and timestamp.
- **Test Email Trigger**: One-click test button to verify the notification pipeline.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Vite
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB with Mongoose ODM (includes an automatic embedded document fallback if `MONGODB_URI` is not provided, allowing zero-friction out-of-the-box operation)
- **Email**: Nodemailer with HTML templates and outbox tracking
- **Authentication**: JWT (`jsonwebtoken`) and `bcryptjs`

---

## 🚀 Setup & Execution Instructions

### Prerequisites
- Node.js (version 18 or higher)
- npm or pnpm

### 1. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your environment variables:
```env
# Optional: MongoDB connection string (defaults to resilient local document store if omitted)
MONGODB_URI=mongodb://localhost:27017/taskmanager

# JWT Secret
JWT_SECRET=super-secret-jwt-key-task-manager-2026

# SMTP Configuration (Optional for real email delivery)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password
SMTP_FROM="TaskSphere Notifications <notifications@tasksphere.internal>"

# Admin Notification Recipient
ADMIN_NOTIFICATION_EMAIL=admin@tasksphere.internal

# Server Port
PORT=3000
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
The server will start on `http://localhost:3000` with both Express API and Vite frontend active.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🔑 Default Demo Accounts

The system comes pre-seeded with sample users and tasks:

| Role | Name | Email | Password | Department |
|---|---|---|---|---|
| **Admin** | Sarah Jenkins | `admin@tasksphere.internal` | `admin123` | Executive Operations |
| **Employee** | Alex Rivers | `alex.rivers@tasksphere.internal` | `employee123` | Frontend Engineering |
| **Employee** | Maria Chen | `maria.chen@tasksphere.internal` | `employee123` | Backend Platform |
| **Employee** | David Kim | `david.kim@tasksphere.internal` | `employee123` | Product & UI/UX |
| **Employee** | Priya Sharma | `priya.sharma@tasksphere.internal` | `employee123` | QA & DevOps |

*(You can also use the one-click "Quick Demo Accounts" buttons on the login screen).*

---

## 📡 API Endpoints Reference

### Authentication
- `POST /api/auth/login` - Authenticate with email, password, and portal role
- `GET /api/auth/me` - Get authenticated user profile
- `POST /api/auth/register` - Register a new user (Admin only)

### Employees
- `GET /api/employees` - List all employees with task workload statistics (Admin only)
- `POST /api/employees` - Create and provision a new employee account (Admin only)

### Tasks
- `GET /api/tasks` - List tasks with `search`, `status`, `priority`, `page`, and `limit`
- `GET /api/tasks/stats` - Get summary statistics (Not Started, Pending, In Progress, Completed)
- `GET /api/tasks/:id` - Get single task details and activity log
- `POST /api/tasks` - Assign new task and trigger employee email notification (Admin only)
- `PUT /api/tasks/:id` - Update full task details (Admin only)
- `PATCH /api/tasks/:id/status` - Update task status and trigger admin email notification (Employee & Admin)
- `DELETE /api/tasks/:id` - Delete task (Admin only)

### Notifications
- `GET /api/notifications` - Retrieve recent email outbox logs (Admin only)
- `POST /api/notifications/test` - Trigger a test email dispatch
