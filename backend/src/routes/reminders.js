import express from 'express';
import Member from '../models/Member.js';
import ReminderLog from '../models/ReminderLog.js';
import { authGym } from '../middleware/authGym.js';
import { gymFilter, gymFilterFromId } from '../utils/gymFilter.js';
import { sendReminder } from '../services/whatsapp/index.js';

const router = express.Router();
router.use(authGym);

function renderBodyTemplate(template, member) {
  if (!template) return '';
  const safeTemplate = String(template);
  const name = member?.name ?? '';
  const fee =
    member?.plan && typeof member.plan.price !== 'undefined'
      ? String(member.plan.price)
      : '';
  const date = member?.endDate
    ? new Date(member.endDate).toLocaleDateString()
    : '';

  return safeTemplate
    .replaceAll('{name}', name)
    .replaceAll('{fee}', fee)
    .replaceAll('{date}', date);
}

/**
 * Send a single WhatsApp reminder
 */
router.post('/send', async (req, res) => {
  try {
    const { memberId, title, body } = req.body;
    if (!memberId || !title || !body) {
      return res.status(400).json({ message: 'memberId, title and body required' });
    }

    const filter = { _id: memberId, ...gymFilter(req.admin) };
    const member = await Member.findOne(filter).populate('plan');
    if (!member) return res.status(404).json({ message: 'Member not found' });
    if (!member.phone) return res.status(400).json({ message: 'Member has no phone number' });

    const phoneDigits = member.phone.replace(/\D/g, '').replace(/^0+/, '');
    const to = phoneDigits.length === 10 ? `91${phoneDigits}` : phoneDigits;

    const personalizedBody = renderBodyTemplate(body, member);

    const result = await sendReminder(to, title, personalizedBody);

    const gymId = req.gymId || req.admin?.gym?._id || req.admin?.gym;
    await ReminderLog.create({
      gym: gymId,
      member: member._id,
      memberName: member.name,
      phone: member.phone,
      title,
      body: personalizedBody,
      status: result.success ? 'sent' : 'failed',
      errorMessage: result.success ? undefined : result.error,
      providerMessageId: result.messageId,
    });

    if (!result.success) {
      return res.status(400).json({ message: result.error || 'WhatsApp send failed' });
    }

    res.json({ success: true, messageId: result.messageId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * Send bulk WhatsApp reminders efficiently
 */
router.post('/send-bulk', async (req, res) => {
  try {
    const { memberIds, title, body } = req.body;
    if (!Array.isArray(memberIds) || !title || !body) {
      return res.status(400).json({
        message: 'memberIds (array), title and body are required',
      });
    }

    const results = [];
    const BATCH_SIZE = 20; // send 20 messages at a time to avoid rate limits

    for (let i = 0; i < memberIds.length; i += BATCH_SIZE) {
      const batchIds = memberIds.slice(i, i + BATCH_SIZE);
      const gymId = req.gymId || req.admin?.gym?._id || req.admin?.gym;
      const memberFilter = gymFilter(req.admin);
      const batchPromises = batchIds.map(async (memberId) => {
        const filter = { _id: memberId, ...memberFilter };
        const member = await Member.findOne(filter).populate('plan');
        if (!member?.phone) {
          await ReminderLog.create({
            gym: gymId,
            member: member?._id,
            memberName: member?.name,
            phone: member?.phone,
            title,
            body,
            status: 'failed',
            errorMessage: 'Member not found or no phone',
          });
          return { memberId, success: false, error: 'No phone number' };
        }

        const phoneDigits = member.phone.replace(/\D/g, '').replace(/^0+/, '');
        const to = phoneDigits.length === 10 ? `91${phoneDigits}` : phoneDigits;

        const personalizedBody = renderBodyTemplate(body, member);

        const result = await sendReminder(to, title, personalizedBody);

        await ReminderLog.create({
          gym: gymId,
          member: member._id,
          memberName: member.name,
          phone: member.phone,
          title,
          body: personalizedBody,
          status: result.success ? 'sent' : 'failed',
          errorMessage: result.success ? undefined : result.error,
          providerMessageId: result.messageId,
        });

        return {
          memberId,
          phone: member.phone,
          success: result.success,
          error: result.error,
          messageId: result.messageId,
        };
      });

      // Wait for batch to finish before sending next batch
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Optional: wait 500ms between batches to prevent API throttling
      await new Promise((r) => setTimeout(r, 500));
    }

    res.json({ results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * Get recent reminder logs for UI history
 */
router.get('/logs', async (req, res) => {
  try {
    const limit = Math.min(
      parseInt(req.query.limit, 10) || 20,
      100
    );
    const filter = gymFilterFromId(req.gymId) || gymFilter(req.admin);

    const logs = await ReminderLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;