/**
 * WhatsApp Cloud API Module (Meta) – Production Safe
 * Requires environment variables:
 * META_WHATSAPP_PHONE_NUMBER_ID
 * META_WHATSAPP_ACCESS_TOKEN
 */

const DEFAULT_BASE_URL = 'https://graph.facebook.com/v21.0';
const DEFAULT_REMINDER_TEMPLATE_NAME =
  process.env.META_WHATSAPP_REMINDER_TEMPLATE_NAME || 'hello_world';
const DEFAULT_REMINDER_LANGUAGE_CODE =
  process.env.META_WHATSAPP_REMINDER_LANGUAGE_CODE || 'en_US';

/**
 * Get WhatsApp config from env (forced to production)
 */
export function getWhatsAppConfig() {
  const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN;
  const baseUrl = process.env.META_WHATSAPP_BASE_URL ?? DEFAULT_BASE_URL;

  if (!phoneNumberId || !accessToken) {
    throw new Error(
      'WhatsApp config missing: META_WHATSAPP_PHONE_NUMBER_ID and META_WHATSAPP_ACCESS_TOKEN are required'
    );
  }

  return { phoneNumberId, accessToken, baseUrl };
}

/**
 * Send a WhatsApp message via Cloud API (production only)
 * @param {string} to - E.164 phone number, e.g. 919876543210
 * @param {Object} message - Message payload
 */
export async function sendWhatsAppMessage(to, message) {
  const { phoneNumberId, accessToken, baseUrl } = getWhatsAppConfig();
  const url = `${baseUrl}/${phoneNumberId}/messages`;

  const body = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: to.replace(/\D/g, ''), // sanitize
    ...message,
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('WhatsApp API error', res.status, data);
      return { success: false, error: data.error?.message || res.statusText };
    }
    return { success: true, messageId: data.messages?.[0]?.id };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Send plain text message
 */
export async function sendText(to, text) {
  return sendWhatsAppMessage(to, { type: 'text', text: { body: text } });
}

/**
 * Send template message (approved templates)
 */
export async function sendTemplate(to, templateName, languageCode = 'en', components = []) {
  return sendWhatsAppMessage(to, {
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
      ...(components.length ? { components } : {}),
    },
  });
}

/**
 * Send reminder text (production-safe wrapper)
 */
export async function sendReminder(to, title, body) {
  const text = `*${title}*\n\n${body}`;
  return sendText(to, text);
}

/**
 * Send welcome template (for new members – no 24hr rule)
 * Set META_WHATSAPP_WELCOME_TEMPLATE_NAME=gym_welcome and create in Meta:
 * Body: "Hi {{1}}, welcome to our gym! We're excited to have you. 💪"
 * If not set, uses hello_world (generic, no name).
 */
export async function sendWelcomeTemplate(to, memberName) {
  const templateName = process.env.META_WHATSAPP_WELCOME_TEMPLATE_NAME || 'hello_world';
  const lang = process.env.META_WHATSAPP_WELCOME_TEMPLATE_LANG || 'en_US';
  const components =
    templateName !== 'hello_world' && memberName
      ? [{ type: 'body', parameters: [{ type: 'text', text: String(memberName) }] }]
      : [];
  return sendTemplate(to, templateName, lang, components);
}

export default {
  getWhatsAppConfig,
  sendWhatsAppMessage,
  sendText,
  sendTemplate,
  sendReminder,
  sendWelcomeTemplate,
};