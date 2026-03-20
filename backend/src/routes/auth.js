import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Admin from '../models/Admin.js';
import Gym from '../models/Gym.js';
import GymSettings from '../models/GymSettings.js';
import { authGym } from '../middleware/authGym.js';
import PasswordResetToken from '../models/PasswordResetToken.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { gymName, email, password, name } = req.body;
    if (!gymName || !email || !password) {
      return res.status(400).json({ message: 'Gym name, email and password required' });
    }
    const adminExists = await Admin.findOne({ email });
    const gymExists = await Gym.findOne({ email });
    if (adminExists || gymExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const gym = await Gym.create({
      name: gymName,
      email,
      password,
      welcomeMessage: 'Hi {name}, welcome to {gym}! 💪',
    });
    await GymSettings.create({ gym: gym._id });
    const token = jwt.sign({ gymId: gym._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      token,
      admin: { id: gym._id, email: gym.email, name: gym.name, gym: { id: gym._id, name: gym.name } },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    const admin = await Admin.findOne({ email }).populate('gym');
    if (admin && (await admin.comparePassword(password))) {
      const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.json({
        token,
        admin: {
          id: admin._id,
          email: admin.email,
          name: admin.name,
          gym: admin.gym ? { id: admin.gym._id, name: admin.gym.name } : null,
        },
      });
    }
    const gym = await Gym.findOne({ email });
    if (gym && (await gym.comparePassword(password))) {
      const token = jwt.sign({ gymId: gym._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.json({
        token,
        admin: {
          id: gym._id,
          email: gym.email,
          name: gym.name,
          gym: { id: gym._id, name: gym.name },
        },
      });
    }
    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * Forgot password (dev-friendly: returns reset token in response).
 * POST /api/auth/forgot-password
 * Body: { email }
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const admin = await Admin.findOne({ email });
    const gym = await Gym.findOne({ email });

    if (!admin && !gym) {
      return res.status(404).json({ message: 'No account found for this email' });
    }

    const userType = admin ? 'admin' : 'gym';
    const userId = admin ? admin._id : gym._id;

    // Replace any previous reset tokens for this user/email.
    await PasswordResetToken.deleteMany({ email, userType });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min

    await PasswordResetToken.create({
      email,
      userType,
      userId,
      tokenHash,
      expiresAt,
    });

    // NOTE: For real production you should email this token instead of returning it.
    res.json({ success: true, resetToken, expiresInMinutes: 30 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * Reset password.
 * POST /api/auth/reset-password
 * Body: { email, resetToken, newPassword }
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;
    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({ message: 'email, resetToken and newPassword are required' });
    }
    if (String(newPassword).length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const tokenHash = crypto.createHash('sha256').update(String(resetToken)).digest('hex');
    const tokenDoc = await PasswordResetToken.findOne({
      email,
      tokenHash,
      expiresAt: { $gt: new Date() },
    });

    if (!tokenDoc) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    if (tokenDoc.userType === 'admin') {
      const admin = await Admin.findById(tokenDoc.userId);
      if (!admin) return res.status(404).json({ message: 'Account not found' });
      admin.password = newPassword;
      await admin.save();
    } else {
      const gym = await Gym.findById(tokenDoc.userId);
      if (!gym) return res.status(404).json({ message: 'Account not found' });
      gym.password = newPassword;
      await gym.save();
    }

    await PasswordResetToken.deleteMany({ email, userType: tokenDoc.userType });
    res.json({ success: true, message: 'Password updated. You can now sign in.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/me', authGym, (req, res) => {
  if (req.gym && !req.admin) {
    return res.json({
      admin: {
        id: req.gym._id,
        email: req.gym.email,
        name: req.gym.name,
        gym: { id: req.gym._id, name: req.gym.name },
      },
    });
  }
  res.json({ admin: req.admin });
});

export default router;
