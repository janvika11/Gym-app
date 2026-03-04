import express from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Gym from '../models/Gym.js';
import GymSettings from '../models/GymSettings.js';
import Plan from '../models/Plan.js';
import { authMiddleware } from '../middleware/auth.js';

const DEFAULT_PLANS = [
  { name: 'Basic', durationDays: 30, price: 1500, description: 'Gym floor access, locker room, water cooler', active: true },
  { name: 'Premium', durationDays: 30, price: 2500, description: 'Everything in Basic plus group classes and diet plan', active: true },
  { name: 'Gold', durationDays: 30, price: 3500, description: 'Premium plus personal trainer and sauna access', active: true },
];

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
    for (const def of DEFAULT_PLANS) {
      await Plan.create({ ...def, gym: gym._id });
    }
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
