import express from 'express';
import jwt from 'jsonwebtoken';
import Gym from '../models/Gym.js';
import GymSettings from '../models/GymSettings.js';
import { authGym } from '../middleware/authGym.js';

const router = express.Router();

/**
 * Connect gym's WhatsApp Business number.
 * POST /api/gyms/connect-whatsapp
 * Body: { phoneNumberId, accessToken, businessAccountId?, phoneNumber? }
 */
router.post('/connect-whatsapp', authGym, async (req, res) => {
  try {
    const gymId = req.gymId || req.admin?.gym?._id || req.admin?.gym;
    if (!gymId) return res.status(400).json({ message: 'No gym assigned' });

    const { phoneNumberId, accessToken, businessAccountId, phoneNumber, verified, templateName, templateLang, templateParameterName } = req.body;
    if (!phoneNumberId || !accessToken) {
      return res.status(400).json({ message: 'phoneNumberId and accessToken are required' });
    }

    const gym = await Gym.findByIdAndUpdate(
      gymId,
      {
        $set: {
          'whatsapp.phoneNumberId': String(phoneNumberId).trim(),
          'whatsapp.accessToken': String(accessToken).replace(/\s/g, ''),
          ...(businessAccountId != null && { 'whatsapp.businessAccountId': String(businessAccountId).trim() }),
          ...(phoneNumber != null && { 'whatsapp.phoneNumber': String(phoneNumber).trim() }),
          'whatsapp.verified': verified === true,
          ...(templateName != null && templateName !== '' && { 'whatsapp.templateName': String(templateName).trim() }),
          ...(templateLang != null && templateLang !== '' && { 'whatsapp.templateLang': String(templateLang).trim() }),
        },
      },
      { new: true }
    ).select('-password');

    if (!gym) return res.status(404).json({ message: 'Gym not found' });

    res.json({
      message: 'WhatsApp credentials saved. Set verified to true once Meta approves your number.',
      gym: {
        id: gym._id,
        name: gym.name,
        whatsapp: {
          phoneNumberId: gym.whatsapp?.phoneNumberId,
          businessAccountId: gym.whatsapp?.businessAccountId,
          phoneNumber: gym.whatsapp?.phoneNumber,
          verified: gym.whatsapp?.verified,
          templateName: gym.whatsapp?.templateName,
          templateLang: gym.whatsapp?.templateLang,
          templateParameterName: gym.whatsapp?.templateParameterName,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * Get gym's WhatsApp connection status (for Settings UI).
 * GET /api/gyms/whatsapp-status
 */
router.get('/whatsapp-status', authGym, async (req, res) => {
  try {
    const gymId = req.gymId || req.admin?.gym?._id || req.admin?.gym;
    if (!gymId) return res.status(400).json({ message: 'No gym assigned' });

    const gym = await Gym.findById(gymId).select('whatsapp').lean();
    if (!gym) return res.status(404).json({ message: 'Gym not found' });

    const wa = gym.whatsapp || {};
    res.json({
      connected: !!(wa.phoneNumberId && wa.accessToken),
      phoneNumberId: wa.phoneNumberId || null,
      businessAccountId: wa.businessAccountId || null,
      phoneNumber: wa.phoneNumber || null,
      verified: wa.verified || false,
      templateName: wa.templateName || null,
      templateLang: wa.templateLang || null,
      templateParameterName: wa.templateParameterName || null,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

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
