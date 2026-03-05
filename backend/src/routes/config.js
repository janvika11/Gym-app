import express from 'express';
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
 * Member clicks link → sends Hi → opens 24-hour window for reminders.
 * Uses META_WHATSAPP_PHONE_NUMBER if set, else fetches display_phone_number from Meta API.
 */
router.get('/whatsapp-link', async (req, res) => {
  let phone = process.env.META_WHATSAPP_PHONE_NUMBER;
  if (phone) {
    return res.json({ link: phoneToWaMe(phone) });
  }
  const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN;
  if (!phoneNumberId || !accessToken) {
    return res.json({
      link: null,
      message: 'Set META_WHATSAPP_PHONE_NUMBER (e.g. 919876543210) or META_WHATSAPP_PHONE_NUMBER_ID + ACCESS_TOKEN in env.',
    });
  }
  try {
    const url = `https://graph.facebook.com/v21.0/${phoneNumberId}?fields=display_phone_number&access_token=${accessToken}`;
    const resp = await fetch(url);
    const data = await resp.json();
    phone = data?.display_phone_number;
    if (!phone) {
      return res.json({ link: null, message: data?.error?.message || 'Could not fetch phone number from Meta.' });
    }
    res.json({ link: phoneToWaMe(phone) });
  } catch (err) {
    res.json({ link: null, message: err.message || 'Failed to fetch WhatsApp number.' });
  }
});

export default router;
