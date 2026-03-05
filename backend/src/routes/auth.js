import express from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Gym from '../models/Gym.js';
import GymSettings from '../models/GymSettings.js';
import { authGym } from '../middleware/authGym.js';

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
