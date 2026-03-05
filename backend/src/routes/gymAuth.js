import express from 'express';
import jwt from 'jsonwebtoken';
import Gym from '../models/Gym.js';
import GymSettings from '../models/GymSettings.js';
import { authGym } from '../middleware/authGym.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, welcomeMessage } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password required' });
    }
    const exists = await Gym.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const gym = await Gym.create({
      name,
      email,
      password,
      welcomeMessage: welcomeMessage || undefined,
    });
    await GymSettings.create({ gym: gym._id });
    const token = jwt.sign(
      { gymId: gym._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(201).json({
      token,
      gym: {
        id: gym._id,
        name: gym.name,
        email: gym.email,
      },
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
    const gym = await Gym.findOne({ email });
    if (!gym || !(await gym.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign(
      { gymId: gym._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      token,
      gym: {
        id: gym._id,
        name: gym.name,
        email: gym.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/me', authGym, (req, res) => {
  if (req.gym) {
    return res.json({
      gym: { id: req.gym._id, name: req.gym.name, email: req.gym.email },
      admin: null,
    });
  }
  if (req.admin) {
    return res.json({
      gym: req.gym ? { id: req.gym._id, name: req.gym.name } : null,
      admin: { id: req.admin._id, email: req.admin.email, name: req.admin.name },
    });
  }
  res.status(401).json({ message: 'Unauthorized' });
});

export default router;
