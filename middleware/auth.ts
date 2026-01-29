import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import User from '../models/User';

export const authenticate = async (req: any, res: Response, next: NextFunction) => {
  try {
    // Allow preflight requests to pass through without auth
    if (req.method === 'OPTIONS') {
      return next();
    }

    // Be tolerant of different header casings and formats
    const rawHeader = (req.headers['authorization'] ||
      (req.headers as any).Authorization) as string | undefined;

    if (!rawHeader) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    // Accept both "Bearer <token>" and raw token strings
    const token = rawHeader.startsWith('Bearer ')
      ? rawHeader.substring('Bearer '.length).trim()
      : rawHeader.trim();

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'osf_secret_key_2025');
    
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User unauthorized or deactivated' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Session expired. Please login again.' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access restricted to ' + roles.join(' or ') });
    }
    next();
  };
};