import express from 'express';
import Member from '../models/Member.js';
import Plan from '../models/Plan.js';
import Gym from '../models/Gym.js';
import GymSettings from '../models/GymSettings.js';
import MessageTemplate from '../models/MessageTemplate.js';
import { authGym } from '../middleware/authGym.js';
import { sendWelcomeMessage } from '../services/whatsapp/index.js';

const router = express.Router();
router.use(authGym);

router.get('/', async (req, res) => {
  try {
    const gymId = req.gymId || (req.admin && (req.admin.gym?._id ?? req.admin.gym));
    if (!gymId) return res.status(400).json({ message: 'No gym assigned' });
    const members = await Member.find({ gym: gymId }).populate('plan').sort({ createdAt: -1 });
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/bulk', async (req, res) => {
  try {
    const gymId = req.gymId || req.admin?.gym?._id || req.admin?.gym;
    if (!gymId) return res.status(400).json({ message: 'No gym assigned.' });
    const { members: rows, sendWelcome } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: 'Send an array of members. Each: { name, phone, email?, plan?, startDate?, endDate?, paymentStatus?, notes? }' });
    }
    const plans = await Plan.find({ gym: gymId });
    const planByName = Object.fromEntries(plans.map((p) => [String(p.name).toLowerCase(), p._id]));
    const created = [];
    const errors = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const name = String(row.name || '').trim();
      const phone = normalizePhone(row.phone);
      if (!name || !phone) {
        errors.push({ row: i + 1, msg: 'Name and phone required' });
        continue;
      }
      let planId = row.plan;
      if (!planId && row.planName) {
        planId = planByName[String(row.planName).toLowerCase()];
      }
      const startDate = row.startDate ? new Date(row.startDate) : undefined;
      const endDate = row.endDate ? new Date(row.endDate) : undefined;
      const validEndDate = endDate && !isNaN(endDate) ? endDate : undefined;
      let paymentStatus = ['paid', 'pending', 'overdue'].includes(row.paymentStatus) ? row.paymentStatus : 'paid';
      if (validEndDate && validEndDate < new Date()) paymentStatus = 'overdue';
      const member = new Member({
        gym: gymId,
        name,
        phone,
        email: row.email ? String(row.email).trim() : undefined,
        plan: planId || undefined,
        startDate: startDate && !isNaN(startDate) ? startDate : undefined,
        endDate: validEndDate,
        paymentStatus,
        active: row.active !== false,
        notes: row.notes ? String(row.notes).trim() : undefined,
      });
      try {
        await member.save();
        await member.populate('plan');
        created.push(member);
        if (sendWelcome && member.phone) {
          try {
            const digits = String(member.phone).replace(/\D/g, '').replace(/^0+/, '');
            const to = digits.length === 10 ? `91${digits}` : digits.startsWith('91') ? digits : `91${digits}`;
            const gym = await Gym.findById(gymId);
            const settings = await GymSettings.findOne({ gym: gymId });
            const template = await MessageTemplate.findOne({ gym: gymId, type: 'WELCOME' });
            const welcomeMsg = template?.content || settings?.welcomeMessage || gym?.welcomeMessage || null;
            const result = await sendWelcomeMessage(to, member.name, welcomeMsg, gym?.name);
            await Member.findByIdAndUpdate(member._id, {
              welcomeSent: result.success,
              welcomeError: result.success ? undefined : (result.error || 'Failed'),
            });
          } catch (e) {
            console.error('Welcome failed for', to, e.message);
          }
        }
      } catch (e) {
        errors.push({ row: i + 1, name, msg: e.message });
      }
    }
    res.status(201).json({
      created: created.length,
      errors: errors.length,
      details: errors.length ? errors : undefined,
      members: created,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const gymId = req.gymId || (req.admin && (req.admin.gym?._id ?? req.admin.gym));
    if (!gymId) return res.status(400).json({ message: 'No gym assigned' });
    const filter = { _id: req.params.id, gym: gymId };
    const member = await Member.findOne(filter).populate('plan');
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
    const gymId = req.gymId || req.admin?.gym?._id || req.admin?.gym;
    if (!gymId) return res.status(400).json({ message: 'No gym assigned. Please contact support.' });
    const member = new Member({ ...body, gym: gymId });
    await member.save();
    await member.populate('plan');

    if (sendWelcome && member.phone) {
      try {
        const digits = String(member.phone).replace(/\D/g, '').replace(/^0+/, '');
        const to = digits.length === 10 ? `91${digits}` : digits.startsWith('91') ? digits : `91${digits}`;
        const gym = await Gym.findById(gymId);
        const settings = await GymSettings.findOne({ gym: gymId });
        const template = await MessageTemplate.findOne({ gym: gymId, type: 'WELCOME' });
        const welcomeMsg = template?.content || settings?.welcomeMessage || gym?.welcomeMessage || null;
        const result = await sendWelcomeMessage(to, member.name, welcomeMsg, gym?.name);
        member.welcomeSent = result.success;
        member.welcomeError = result.success ? undefined : (result.error || 'Failed');
        await Member.findByIdAndUpdate(member._id, {
          welcomeSent: result.success,
          welcomeError: result.success ? undefined : (result.error || 'Failed'),
        });
        if (!result.success) {
          console.error('Welcome WhatsApp failed:', result.error, 'to:', to);
        }
      } catch (e) {
        console.error('Welcome WhatsApp failed:', e.message);
        member.welcomeSent = false;
        member.welcomeError = e.message;
      }
    }

    res.status(201).json(member);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const gymId = req.gymId || (req.admin && (req.admin.gym?._id ?? req.admin.gym));
    if (!gymId) return res.status(400).json({ message: 'No gym assigned' });
    const body = { ...req.body };
    if (body.phone) body.phone = normalizePhone(body.phone);
    const filter = { _id: req.params.id, gym: gymId };
    const member = await Member.findOneAndUpdate(filter, body, {
      new: true,
      runValidators: true,
    }).populate('plan');
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json(member);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/:id/remind', async (req, res) => {
  try {
    const { sendDynamicMessage } = await import('../services/whatsapp/index.js');
    const gymId = req.gymId || (req.admin && (req.admin.gym?._id ?? req.admin.gym));
    if (!gymId) return res.status(400).json({ message: 'No gym assigned' });
    const filter = { _id: req.params.id, gym: gymId };
    const member = await Member.findOne(filter).populate('plan');
    if (!member) return res.status(404).json({ message: 'Member not found' });
    if (!member.phone) return res.status(400).json({ message: 'Member has no phone number' });
    const gym = await Gym.findById(gymId);
    const template = await MessageTemplate.findOne({ gym: gymId, type: 'EXPIRY' });
    const settings = await GymSettings.findOne({ gym: gymId });
    const content = template?.content || settings?.expiringMessage || 'Hi {name}! Your membership at {gym} expires on {expiry}. Renew soon 💪';

    const expiryStr = member.endDate ? new Date(member.endDate).toLocaleDateString() : '';
    const planName = member.plan?.name || '';
    const composed = content
      .replaceAll('{name}', member.name || '')
      .replaceAll('{gym}', gym?.name || 'our gym')
      .replaceAll('{expiry}', expiryStr)
      .replaceAll('{plan}', planName)
      .replaceAll('{fee}', member.plan?.price ?? '')
      .replaceAll('{date}', expiryStr);

    const digits = String(member.phone).replace(/\D/g, '').replace(/^0+/, '');
    const to = digits.length === 10 ? `91${digits}` : digits.startsWith('91') ? digits : `91${digits}`;

    const result = await sendDynamicMessage(to, composed);
    if (!result.success) {
      return res.status(400).json({ message: result.error || 'Failed to send reminder' });
    }
    res.json({ success: true, messageId: result.messageId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const gymId = req.gymId || (req.admin && (req.admin.gym?._id ?? req.admin.gym));
    if (!gymId) return res.status(400).json({ message: 'No gym assigned' });
    const filter = { _id: req.params.id, gym: gymId };
    const member = await Member.findOneAndDelete(filter);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json({ message: 'Member deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
