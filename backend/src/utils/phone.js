/**
 * Convert phone to E.164 format for WhatsApp API (India: 91 + 10 digits).
 * No + sign, no spaces. Required for delivery to any number (Live mode).
 * Handles: 7680010741, 091..., +91 7680..., 917680010741
 */
export function toE164(phone) {
  const digits = String(phone || '').replace(/\D/g, '').replace(/^0+/, '').replace(/^91/, '');
  const last10 = digits.slice(-10);
  if (last10.length < 10) return '';
  return `91${last10}`;
}
