import express from 'express';
import GymSettings from '../models/GymSettings.js';
import { authGym } from '../middleware/authGym.js';

const router = express.Router();
router.use(authGym);

function parseTemplatesJson(str) {
  try {
    const arr = JSON.parse(String(str || '[]'));
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

router.get('/', async (req, res) => {
  try {
    const gymId = req.gymId || req.admin?.gym?._id || req.admin?.gym;
    if (!gymId) return res.status(400).json({ message: 'No gym assigned' });
    let doc = await GymSettings.findOne({ gym: gymId });
    if (!doc) {
      doc = await GymSettings.create({ gym: gymId });
    }
    const out = doc.toObject ? doc.toObject() : { ...doc };
    out.customTemplates = parseTemplatesJson(out.customTemplatesJson);
    delete out.customTemplatesJson;
    res.json(out);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const gymId = req.gymId || req.admin?.gym?._id || req.admin?.gym;
    if (!gymId) return res.status(400).json({ message: 'No gym assigned' });
    const {
      welcomeTitle, welcomeMessage,
      feeReminderTitle, feeReminderMessage,
      overdueTitle, overdueMessage,
      expiringTitle, expiringMessage,
      inactiveTitle, inactiveMessage,
      customTemplates,
    } = req.body;

    const $set = {};
    const fields = [
      'welcomeTitle', 'welcomeMessage', 'feeReminderTitle', 'feeReminderMessage',
      'overdueTitle', 'overdueMessage', 'expiringTitle', 'expiringMessage',
      'inactiveTitle', 'inactiveMessage',
    ];
    for (const f of fields) {
      if (req.body[f] !== undefined) $set[f] = req.body[f];
    }

    const normalized = Array.isArray(customTemplates)
      ? customTemplates.map((t, i) => ({
          key: t && t.key ? String(t.key) : `custom_${Date.now()}_${i}`,
          title: t && t.title != null ? String(t.title) : '',
          message: t && t.message != null ? String(t.message) : '',
        }))
      : [];
    $set.customTemplatesJson = JSON.stringify(normalized);

    const settings = await GymSettings.findOneAndUpdate(
      { gym: gymId },
      { $set },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const out = settings.toObject ? settings.toObject() : { ...settings };
    out.customTemplates = parseTemplatesJson(out.customTemplatesJson);
    delete out.customTemplatesJson;
    res.json(out);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
