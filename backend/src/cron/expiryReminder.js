import cron from 'node-cron';
import Member from '../models/Member.js';
import Gym from '../models/Gym.js';
import GymSettings from '../models/GymSettings.js';
import MessageTemplate from '../models/MessageTemplate.js';
import { sendDynamicMessage } from '../services/whatsapp/index.js';

function normalizePhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '').replace(/^0+/, '').replace(/^91/, '');
  return digits.slice(-10);
}

function toE164(phone) {
  const digits = normalizePhone(phone);
  return digits.length === 10 ? `91${digits}` : digits.startsWith('91') ? digits : `91${digits}`;
}

/**
 * Get tomorrow's date range (start and end of day) in local time.
 * Uses Asia/Kolkata for 9AM IST.
 */
function getTomorrowRange() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const start = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
  const end = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate() + 1);
  return { start, end };
}

async function runExpiryReminders() {
  try {
    const { start, end } = getTomorrowRange();
    const members = await Member.find({
      endDate: { $gte: start, $lt: end },
      active: { $ne: false },
      phone: { $exists: true, $ne: '' },
    })
      .populate('plan')
      .populate('gym');

    for (const member of members) {
      try {
        if (!member.phone) continue;
        const gym = member.gym;
        const gymId = member.gym?._id ?? member.gym;
        const template = await MessageTemplate.findOne({ gym: gymId, type: 'EXPIRY' });
        const settings = await GymSettings.findOne({ gym: gymId });
        const content =
          template?.content ||
          settings?.expiringMessage ||
          'Hi {name}! Your membership at {gym} expires on {expiry}. Renew soon 💪';

        const expiryStr = member.endDate ? new Date(member.endDate).toLocaleDateString() : '';
        const planName = member.plan?.name || '';
        const composed = content
          .replaceAll('{name}', member.name || '')
          .replaceAll('{gym}', gym?.name || 'our gym')
          .replaceAll('{expiry}', expiryStr)
          .replaceAll('{plan}', planName)
          .replaceAll('{fee}', member.plan?.price ?? '')
          .replaceAll('{date}', expiryStr);

        const to = toE164(member.phone);
        const result = await sendDynamicMessage(to, composed);
        if (!result.success) {
          console.error('[Cron] Expiry reminder failed:', member.name, result.error);
        }
      } catch (err) {
        console.error('[Cron] Expiry reminder error for member', member._id, err.message);
      }
    }
  } catch (err) {
    console.error('[Cron] Expiry reminder job failed:', err.message);
  }
}

/**
 * Schedule daily expiry reminders at 9:00 AM (server local time).
 * For IST 9AM, set TZ=Asia/Kolkata or adjust cron: '0 9 * * *' assumes server TZ.
 */
export function startExpiryCron() {
  cron.schedule('0 9 * * *', runExpiryReminders, {
    timezone: 'Asia/Kolkata',
  });
  console.log('[Cron] Expiry reminder scheduled daily at 9:00 AM IST');
}
