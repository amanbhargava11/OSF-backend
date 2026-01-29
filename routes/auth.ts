
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { authenticate } from '../middleware/auth';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'osf_secret_key_2025';

// Helper: Generate Token
const generateToken = (user: any) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// @route   POST /api/auth/signup
// @desc    Register a new user (Client or Admin)
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, company } = req.body;

    // 1. Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // 2. Check existence
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    // 3. Derive role from email domain
    const normalizedEmail = email.toLowerCase();
    const isOsfAdmin = normalizedEmail.endsWith('@ourstartupfreelancer.com');
    const derivedRole = isOsfAdmin ? 'admin' : 'client';

    // 4. Create User
    const user = new User({
      name,
      email: normalizedEmail,
      password, // Hashing happens in User model pre-save hook
      company,
      role: derivedRole
    });

    await user.save();

    // 5. Respond
    const token = generateToken(user);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        avatar: user.avatar
      }
    });
  } catch (error: any) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // 1. Find User (include password for comparison)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 2. Validate Password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. Validate Role Clearance
    if (role && user.role !== role) {
      return res.status(403).json({ 
        message: `Identity mismatch. You do not have permission to access the ${role} portal.` 
      });
    }

    // 4. Update login timestamp
    user.lastLogin = new Date();
    await user.save();

    // 5. Respond
    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
router.get('/me', authenticate, async (req: any, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/clients
// @desc    Get all clients (admin only)
router.get('/clients', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const clients = await User.find({ role: 'client' })
      .select('name email company avatar isActive lastLogin')
      .sort({ name: 1 });
    
    res.json(clients);
  } catch (error) {
    console.error('Fetch clients error:', error);
    res.status(500).json({ message: 'Server error fetching clients' });
  }
});

// @route   PATCH /api/auth/clients/:id/deactivate
// @desc    Deactivate/activate a client (admin only)
router.patch('/clients/:id/deactivate', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const client = await User.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    if (client.role !== 'client') {
      return res.status(400).json({ message: 'Can only deactivate clients' });
    }
    
    client.isActive = !client.isActive;
    await client.save();
    
    res.json({ message: `Client ${client.isActive ? 'activated' : 'deactivated'} successfully`, client });
  } catch (error) {
    console.error('Deactivate client error:', error);
    res.status(500).json({ message: 'Server error updating client status' });
  }
});

export default router;
