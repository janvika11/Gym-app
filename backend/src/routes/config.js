import express from 'express';
import Gym from '../models/Gym.js';
import { authGym } from '../middleware/authGym.js';

const router = express.Router();
router.use(authGym);

function phoneToWaMe(phone) {
  const digits = String(phone || '').replace(/\D/g, '').replace(/^0+/, '');
  const e164 = digits.length === 10 ? `91${digits}` : digits.startsWith('91') ? digits : `91${digits}`;
  return `https://wa.me/${e164}`;
}

/**
 * Get WhatsApp subscribe link for sharing with members.
 * Prefers gym's phone from Settings; falls back to env.
 */
router.get('/whatsapp-link', async (req, res) => {
  const gymId = req.gymId || req.admin?.gym?._id || req.admin?.gym;
  if (gymId) {
    const gym = await Gym.findById(gymId).select('whatsapp.phoneNumber').lean();
    const gymPhone = gym?.whatsapp?.phoneNumber;
    if (gymPhone) {
      const digits = String(gymPhone).replace(/\D/g, '').replace(/^0+/, '');
      const e164 = digits.length === 10 ? `91${digits}` : digits.startsWith('91') ? digits : `91${digits}`;
      return res.json({ link: `https://wa.me/${e164}` });
    }
  }
  let phone = process.env.META_WHATSAPP_PHONE_NUMBER;
  if (phone) {
    return res.json({ link: phoneToWaMe(phone) });
  }
  return res.json({
    link: null,
    message: 'Set Phone Number in Settings → Connect WhatsApp, or META_WHATSAPP_PHONE_NUMBER in env.',
  });
});

export default router;
