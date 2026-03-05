import express from 'express';
import MessageTemplate from '../models/MessageTemplate.js';
import { authGym } from '../middleware/authGym.js';
import { gymFilter, gymFilterFromId } from '../utils/gymFilter.js';

const router = express.Router();
router.use(authGym);

router.get('/', async (req, res) => {
  try {
    const gymId = req.gymId || req.admin?.gym?._id || req.admin?.gym;
    if (!gymId) return res.status(400).json({ message: 'No gym assigned' });
    const templates = await MessageTemplate.find({ gym: gymId }).sort({ type: 1 });
    res.json(templates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const gymId = req.gymId || req.admin?.gym?._id || req.admin?.gym;
    if (!gymId) return res.status(400).json({ message: 'No gym assigned' });
    const { name, type, content } = req.body;
    if (!type || !['WELCOME', 'EXPIRY', 'CUSTOM'].includes(type)) {
      return res.status(400).json({ message: 'type must be WELCOME, EXPIRY, or CUSTOM' });
    }
    const template = await MessageTemplate.create({
      gym: gymId,
      name: name || type,
      type,
      content: content || '',
    });
    res.status(201).json(template);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const filter = { _id: req.params.id, ...(gymFilterFromId(req.gymId) || gymFilter(req.admin)) };
    const template = await MessageTemplate.findOneAndUpdate(
      filter,
      { $set: req.body },
      { new: true }
    );
    if (!template) return res.status(404).json({ message: 'Template not found' });
    res.json(template);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const filter = { _id: req.params.id, ...(gymFilterFromId(req.gymId) || gymFilter(req.admin)) };
    const template = await MessageTemplate.findOneAndDelete(filter);
    if (!template) return res.status(404).json({ message: 'Template not found' });
    res.json({ message: 'Template deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
