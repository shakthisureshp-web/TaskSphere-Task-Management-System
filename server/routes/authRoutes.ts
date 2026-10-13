import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { dbService } from '../services/databaseService.js';
import { generateToken, authenticate, AuthRequest } from '../middleware/auth.js';

export const authRouter = Router();

authRouter.post('/login', async (req, res: Response) => {
  try {
    const { email, password, expectedRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await dbService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email address or user not found.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact system administrator.' });
    }

    // Role check if user selected a specific portal (Admin vs Employee)
    if (expectedRole && user.role !== expectedRole) {
      return res.status(403).json({
        success: false,
        message: `Account is registered as "${user.role.toUpperCase()}", not "${expectedRole.toUpperCase()}". Please switch to the ${user.role} portal.`,
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password || '');
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid password. Please try again.' });
    }

    const token = generateToken(user);
    const { password: _, ...userSafe } = user;

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: userSafe,
    });
  } catch (err: any) {
    console.error('[Auth] Login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
});

authRouter.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated.' });
  }
  const { password: _, ...userSafe } = req.user;
  return res.status(200).json({ success: true, user: userSafe });
});

authRouter.post('/register', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // Only admins can register new users
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only administrators can create user accounts.' });
    }

    const { name, email, password, role, department, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existing = await dbService.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'A user with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await dbService.createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'employee',
      department: department || 'General Operations',
      phone: phone || '',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
      isActive: true,
    });

    const { password: _, ...userSafe } = newUser;
    return res.status(201).json({
      success: true,
      message: `Successfully created ${newUser.role} account for ${newUser.name}.`,
      user: userSafe,
    });
  } catch (err: any) {
    console.error('[Auth] Registration error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create user account.' });
  }
});
