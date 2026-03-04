import express from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Gym from '../models/Gym.js';
import GymSettings from '../models/GymSettings.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { gymName, email, password, name } = req.body;
    if (!gymName || !email || !password) {
      return res.status(400).json({ message: 'Gym name, email and password required' });
    }
    const exists = await Admin.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const gym = await Gym.create({ name: gymName });
    await GymSettings.create({ gym: gym._id });
    const admin = await Admin.create({
      gym: gym._id,
      email,
      password,
      name: name || 'Admin',
    });
    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(201).json({
      token,
      admin: { id: admin._id, email: admin.email, name: admin.name, gym: { id: gym._id, name: gym.name } },
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
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        gym: admin.gym ? { id: admin.gym._id, name: admin.gym.name } : null,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/me', authMiddleware, (req, res) => {
  res.json({ admin: req.admin });
});

export default router;
