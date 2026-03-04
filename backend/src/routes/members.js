import express from 'express';
import Member from '../models/Member.js';
import { authMiddleware } from '../middleware/auth.js';
import { gymFilter } from '../utils/gymFilter.js';
import { sendWelcomeTemplate } from '../services/whatsapp/index.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const filter = gymFilter(req.admin);
    const members = await Member.find(filter).populate('plan').sort({ createdAt: -1 });
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const member = await Member.findById(req.params.id).populate('plan');
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

function normalizePhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '').replace(/^0+/, '').replace(/^91/, '');
  return digits.slice(-10); // store last 10 digits
}

router.post('/', async (req, res) => {
  try {
    const { sendWelcome, ...body } = req.body;
    if (body.phone) body.phone = normalizePhone(body.phone);
    const gymId = req.admin?.gym?._id || req.admin?.gym;
    if (!gymId) return res.status(400).json({ message: 'No gym assigned. Please contact support.' });
    const member = new Member({ ...body, gym: gymId });
    await member.save();
    await member.populate('plan');

    if (sendWelcome && member.phone) {
      try {
        const digits = member.phone.replace(/\D/g, '').replace(/^0+/, '');
        const to = digits.length === 10 ? `91${digits}` : digits;
        const result = await sendWelcomeTemplate(to, member.name);
        member.welcomeSent = result.success;
      } catch (e) {
        console.error('Welcome WhatsApp failed:', e.message);
        member.welcomeSent = false;
      }
    }

    res.status(201).json(member);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.phone) body.phone = normalizePhone(body.phone);
    const member = await Member.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    }).populate('plan');
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json(member);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const filter = { _id: req.params.id, ...gymFilter(req.admin) };
    const member = await Member.findOneAndDelete(filter);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json({ message: 'Member deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
