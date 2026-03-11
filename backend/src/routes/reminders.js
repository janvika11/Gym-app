import express from 'express';
import Member from '../models/Member.js';
import Gym from '../models/Gym.js';
import ReminderLog from '../models/ReminderLog.js';
import { authGym } from '../middleware/authGym.js';
import { gymFilter, gymFilterFromId } from '../utils/gymFilter.js';
import { toE164 } from '../utils/phone.js';
import { sendDynamicMessage } from '../services/whatsapp/index.js';

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
  const expiry = date;
  const plan = member?.plan?.name ?? '';

  return safeTemplate
    .replaceAll('{name}', name)
    .replaceAll('{fee}', fee)
    .replaceAll('{date}', date)
    .replaceAll('{expiry}', expiry)
    .replaceAll('{plan}', plan);
}

/**
 * Send a single WhatsApp reminder (uses approved template for delivery)
 */
router.post('/send', async (req, res) => {
  try {
    const { memberId, title, body } = req.body;
    if (!memberId || !title || !body) {
      return res.status(400).json({ message: 'memberId, title and body required' });
    }

    const gymId = req.gymId || req.admin?.gym?._id || req.admin?.gym;
    const filter = { _id: memberId, ...(gymFilterFromId(gymId) || gymFilter(req.admin)) };
    const member = await Member.findOne(filter).populate('plan');
    if (!member) return res.status(404).json({ message: 'Member not found' });
    if (!member.phone) return res.status(400).json({ message: 'Member has no phone number' });

    const to = toE164(member.phone);
    if (!to) return res.status(400).json({ message: 'Invalid phone number' });

    const personalizedBody = renderBodyTemplate(body, member);
    const composedMessage = `*${title}*\n\n${personalizedBody}`;

    const gym = await Gym.findById(gymId).select('whatsapp').lean();
    const gymWhatsapp = gym?.whatsapp?.phoneNumberId && gym?.whatsapp?.accessToken ? gym.whatsapp : undefined;

    const result = await sendDynamicMessage(to, composedMessage, gymWhatsapp);
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

    res.json({ success: true, messageId: result.messageId, sentTo: to });
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
      const memberFilter = gymFilterFromId(gymId) || gymFilter(req.admin);
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

        const to = toE164(member.phone);
        if (!to) {
          await ReminderLog.create({
            gym: gymId,
            member: member._id,
            memberName: member.name,
            phone: member.phone,
            title,
            body,
            status: 'failed',
            errorMessage: 'Invalid phone number',
          });
          return { memberId, success: false, error: 'Invalid phone number' };
        }

        const personalizedBody = renderBodyTemplate(body, member);
        const composedMessage = `*${title}*\n\n${personalizedBody}`;

        const gym = await Gym.findById(gymId).select('whatsapp').lean();
        const gymWhatsapp = gym?.whatsapp?.phoneNumberId && gym?.whatsapp?.accessToken ? gym.whatsapp : undefined;

        const result = await sendDynamicMessage(to, composedMessage, gymWhatsapp);

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