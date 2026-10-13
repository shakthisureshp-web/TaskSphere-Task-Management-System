import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { dbService } from '../services/databaseService.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';

export const employeeRouter = Router();

// GET all employees (Admin view)
employeeRouter.get('/', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const employees = await dbService.getEmployees();
    return res.status(200).json({ success: true, data: employees });
  } catch (err: any) {
    console.error('[Employees] Error fetching employees:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve employees list.' });
  }
});

// POST create employee (Admin view)
employeeRouter.post('/', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, department, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    const existing = await dbService.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'An employee with this email already exists.' });
    }

    const defaultPassword = password || 'employee123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const newEmp = await dbService.createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: 'employee',
      department: department || 'Engineering',
      phone: phone || '',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}`,
      isActive: true,
    });

    const { password: _, ...safeEmp } = newEmp;
    return res.status(201).json({
      success: true,
      message: `Employee ${newEmp.name} created successfully. Default password is "${defaultPassword}".`,
      data: safeEmp,
    });
  } catch (err: any) {
    console.error('[Employees] Error creating employee:', err);
    return res.status(500).json({ success: false, message: 'Failed to create employee.' });
  }
});
