import express from 'express';
import GymSettings from '../models/GymSettings.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const gymId = req.admin?.gym?._id || req.admin?.gym;
    if (!gymId) return res.status(400).json({ message: 'No gym assigned' });
    let settings = await GymSettings.findOne({ gym: gymId });
    if (!settings) {
      settings = await GymSettings.create({ gym: gymId });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const gymId = req.admin?.gym?._id || req.admin?.gym;
    if (!gymId) return res.status(400).json({ message: 'No gym assigned' });
    const { welcomeMessage, feeReminderMessage, overdueMessage, expiringMessage, inactiveMessage } = req.body;
    const settings = await GymSettings.findOneAndUpdate(
      { gym: gymId },
      {
        ...(welcomeMessage !== undefined && { welcomeMessage }),
        ...(feeReminderMessage !== undefined && { feeReminderMessage }),
        ...(overdueMessage !== undefined && { overdueMessage }),
        ...(expiringMessage !== undefined && { expiringMessage }),
        ...(inactiveMessage !== undefined && { inactiveMessage }),
      },
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
