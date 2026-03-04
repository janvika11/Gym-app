/**
 * WhatsApp Cloud API Module (Meta)
 * COPY THIS FOLDER into any Node.js project to add WhatsApp messaging.
 * Set env: META_WHATSAPP_PHONE_NUMBER_ID, META_WHATSAPP_ACCESS_TOKEN
 */
const DEFAULT_BASE_URL = 'https://graph.facebook.com/v21.0';

function getWhatsAppConfig(options = {}) {
  const phoneNumberId = options.phoneNumberId ?? process.env.META_WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = options.accessToken ?? process.env.META_WHATSAPP_ACCESS_TOKEN;
  const baseUrl = options.baseUrl ?? process.env.META_WHATSAPP_BASE_URL ?? DEFAULT_BASE_URL;
  return { phoneNumberId, accessToken, baseUrl };
}

async function sendWhatsAppMessage(to, message, options = {}) {
  const { phoneNumberId, accessToken, baseUrl } = getWhatsAppConfig(options);
  if (!phoneNumberId || !accessToken) {
    return { success: false, error: 'WhatsApp config missing' };
  }
  const url = `${baseUrl}/${phoneNumberId}/messages`;
  const body = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: to.replace(/\D/g, ''),
    ...message,
  };
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error?.message || res.statusText };
    return { success: true, messageId: data.messages?.[0]?.id };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function sendText(to, text, options = {}) {
  return sendWhatsAppMessage(to, { type: 'text', text: { body: text } }, options);
}

async function sendTemplate(to, templateName, languageCode = 'en', components = [], options = {}) {
  const message = {
    type: 'template',
    template: { name: templateName, language: { code: languageCode }, ...(components.length ? { components } : {}) },
  };
  return sendWhatsAppMessage(to, message, options);
}

async function sendReminder(to, title, body, options = {}) {
  return sendText(to, `*${title}*\n\n${body}`, options);
}

module.exports = { getWhatsAppConfig, sendWhatsAppMessage, sendText, sendTemplate, sendReminder };
