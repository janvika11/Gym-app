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
 * Get WhatsApp config from env (fallback when gym has no config)
 */
export function getWhatsAppConfig() {
  const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = (process.env.META_WHATSAPP_ACCESS_TOKEN || '').replace(/\s/g, '');
  const baseUrl = process.env.META_WHATSAPP_BASE_URL ?? DEFAULT_BASE_URL;

  if (!phoneNumberId || !accessToken) {
    throw new Error(
      'WhatsApp config missing: META_WHATSAPP_PHONE_NUMBER_ID and META_WHATSAPP_ACCESS_TOKEN are required'
    );
  }

  return { phoneNumberId, accessToken, baseUrl };
}

/**
 * Get WhatsApp config: prefer gym's config, else env
 * @param {Object} [gymWhatsapp] - { phoneNumberId, accessToken }
 */
function resolveConfig(gymWhatsapp) {
  if (gymWhatsapp?.phoneNumberId && gymWhatsapp?.accessToken) {
    const token = String(gymWhatsapp.accessToken).replace(/\s/g, '');
    return {
      phoneNumberId: gymWhatsapp.phoneNumberId,
      accessToken: token,
      baseUrl: process.env.META_WHATSAPP_BASE_URL ?? DEFAULT_BASE_URL,
    };
  }
  return getWhatsAppConfig();
}

/**
 * Send a WhatsApp message via Cloud API
 * @param {string} to - E.164 phone number, e.g. 919876543210
 * @param {Object} message - Message payload
 * @param {Object} [gymWhatsapp] - Optional gym WhatsApp config
 */
export async function sendWhatsAppMessage(to, message, gymWhatsapp) {
  const { phoneNumberId, accessToken, baseUrl } = resolveConfig(gymWhatsapp);
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
export async function sendText(to, text, gymWhatsapp) {
  return sendWhatsAppMessage(to, { type: 'text', text: { body: text } }, gymWhatsapp);
}

/**
 * Sanitize template parameter text (Meta rejects newlines, tabs, >4 consecutive spaces)
 */
function sanitizeParamText(text) {
  return String(text || '')
    .replace(/\r?\n|\r|\t/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 1024);
}

/**
 * Send template message (approved templates)
 */
export async function sendTemplate(to, templateName, languageCode = 'en', components = [], gymWhatsapp) {
  const sanitized = components.map((c) => {
    if (c.type === 'body' && c.parameters) {
      return {
        ...c,
        parameters: c.parameters.map((p) =>
          p.type === 'text'
            ? { ...p, text: sanitizeParamText(p.text) }
            : p
        ),
      };
    }
    return c;
  });
  return sendWhatsAppMessage(to, {
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
      ...(sanitized.length ? { components: sanitized } : {}),
    },
  }, gymWhatsapp);
}

/**
 * Send reminder text (production-safe wrapper)
 */
export async function sendReminder(to, title, body, gymWhatsapp) {
  const text = `*${title}*\n\n${body}`;
  return sendText(to, text, gymWhatsapp);
}

/**
 * Send welcome template (for new members – no 24hr rule, no reply needed)
 * Uses custom message from settings. For initiation you MUST use an approved template.
 *
 * Option A – Custom template (recommended): Create in Meta Business Manager:
 *   Name: gym_welcome
 *   Category: UTILITY or MARKETING
 *   Body: {{1}}
 *   (One parameter = full message)
 * Set META_WHATSAPP_WELCOME_TEMPLATE_NAME=gym_welcome
 *
 * Option B – hello_world: Uses Meta's default test message (not recommended).
 */
export async function sendWelcomeTemplate(to, memberName) {
  return sendWelcomeMessage(to, memberName, null);
}

/**
 * Send welcome message to new member.
 * Template gym_welcome: "Hi {{1}}! Welcome to our gym! Your membership is now active..."
 * {{1}} = member name only.
 */
export async function sendWelcomeMessage(to, memberName, customMessage, gymName = '', gymWhatsapp) {
  const templateName = gymWhatsapp?.templateName
    || process.env.META_WHATSAPP_WELCOME_TEMPLATE_NAME
    || process.env.META_WHATSAPP_DYNAMIC_TEMPLATE_NAME
    || 'gym_welcome';
  const lang = gymWhatsapp?.templateLang || process.env.META_WHATSAPP_WELCOME_TEMPLATE_LANG || 'en';

  if (templateName === 'hello_world') {
    return sendTemplate(to, 'hello_world', 'en_US', [], gymWhatsapp);
  }

  return sendTemplate(to, templateName, lang, [
    { type: 'body', parameters: [{ type: 'text', text: String(memberName || '') }] },
  ], gymWhatsapp);
}

/**
 * Send dynamic message (expiry, fee, inactive, compose).
 * Uses gym_welcome template: "Hi {{1}}! Welcome to our gym! Your membership is now active..."
 * For reminders we send full message as {{1}} – output wraps it.
 * Template name and language can be set per-gym in Settings.
 */
export async function sendDynamicMessage(to, composedMessage, gymWhatsapp) {
  const templateName = gymWhatsapp?.templateName
    || process.env.META_WHATSAPP_DYNAMIC_TEMPLATE_NAME
    || process.env.META_WHATSAPP_WELCOME_TEMPLATE_NAME
    || 'gym_welcome';
  const lang = gymWhatsapp?.templateLang || process.env.META_WHATSAPP_WELCOME_TEMPLATE_LANG || 'en';
  return sendTemplate(to, templateName, lang, [
    { type: 'body', parameters: [{ type: 'text', text: String(composedMessage || '') }] },
  ], gymWhatsapp);
}

export default {
  getWhatsAppConfig,
  sendWhatsAppMessage,
  sendText,
  sendTemplate,
  sendReminder,
  sendWelcomeTemplate,
  sendWelcomeMessage,
};