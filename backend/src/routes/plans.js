import express from 'express';
import Plan from '../models/Plan.js';
import { authGym } from '../middleware/authGym.js';
import { gymFilter, gymFilterFromId } from '../utils/gymFilter.js';

const router = express.Router();
router.use(authGym);

router.get('/', async (req, res) => {
  try {
    const filter = gymFilterFromId(req.gymId) || gymFilter(req.admin);
    const plans = await Plan.find(filter).sort({ durationDays: 1 });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const filter = { _id: req.params.id, ...gymFilter(req.admin) };
    const plan = await Plan.findOne(filter);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const gymId = req.gymId || req.admin?.gym?._id || req.admin?.gym;
    if (!gymId) return res.status(400).json({ message: 'No gym assigned.' });
    const plan = new Plan({ ...req.body, gym: gymId });
    await plan.save();
    res.status(201).json(plan);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json(plan);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const filter = { _id: req.params.id, ...(gymFilterFromId(req.gymId) || gymFilter(req.admin)) };
    const plan = await Plan.findOneAndDelete(filter);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json({ message: 'Plan deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
