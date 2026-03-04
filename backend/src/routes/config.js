import express from 'express';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

/**
 * Get WhatsApp subscribe link for sharing with members.
 * Member clicks link → sends Hi → opens 24-hour window for reminders.
 */
router.get('/whatsapp-link', (req, res) => {
  const phone = process.env.META_WHATSAPP_PHONE_NUMBER;
  if (!phone) {
    return res.json({ link: null, message: 'WhatsApp number not configured. Set META_WHATSAPP_PHONE_NUMBER in env (e.g. 919876543210).' });
  }
  const digits = String(phone).replace(/\D/g, '').replace(/^0+/, '');
  const e164 = digits.length === 10 ? `91${digits}` : digits;
  const link = `https://wa.me/${e164}`;
  res.json({ link });
});

export default router;
