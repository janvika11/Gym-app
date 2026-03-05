import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Gym from '../models/Gym.js';

/**
 * Auth middleware for multi-tenant gym SaaS.
 * Supports both:
 * - Gym JWT: { gymId } - from /api/gyms/login
 * - Admin JWT: { id } - from /api/auth/login (backward compat)
 * Sets req.gymId for tenant isolation.
 */
export const authGym = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.gymId) {
      const gym = await Gym.findById(decoded.gymId).select('-password');
      if (!gym) return res.status(401).json({ message: 'Unauthorized' });
      req.gymId = gym._id;
      req.gym = gym;
      req.admin = null;
      return next();
    }

    if (decoded.id) {
      const admin = await Admin.findById(decoded.id).populate('gym').select('-password');
      if (!admin) return res.status(401).json({ message: 'Unauthorized' });
      req.admin = admin;
      req.gymId = admin.gym?._id ?? admin.gym;
      req.gym = admin.gym;
      return next();
    }

    return res.status(401).json({ message: 'Invalid token' });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
