# WhatsApp Cloud API Module (Meta)

Drop-in module for sending WhatsApp messages in any Node.js app using [Meta WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api).

## Setup

1. Create a Meta app and add WhatsApp product: [developers.facebook.com](https://developers.facebook.com).
2. Get **Phone Number ID** and **Access Token** from WhatsApp > API Setup.
3. Add to your `.env`:

```env
META_WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
META_WHATSAPP_ACCESS_TOKEN=your_access_token
```

Optional: `META_WHATSAPP_BASE_URL` (default: `https://graph.facebook.com/v21.0`).

## Usage

```js
import { sendText, sendReminder, sendTemplate } from './whatsapp/index.js';

// Plain text
await sendText('919876543210', 'Hello!');

// Reminder (bold title + body)
await sendReminder('919876543210', 'Gym reminder', 'Your session is at 6 PM today.');

// Template (use approved template name from Meta)
await sendTemplate('919876543210', 'hello_world', 'en');
```

## API

- **getWhatsAppConfig(options)** – Get config from env or `options`.
- **sendWhatsAppMessage(to, message, options)** – Low-level send.
- **sendText(to, text, options)** – Send text message.
- **sendTemplate(to, templateName, languageCode, components, options)** – Send template.
- **sendReminder(to, title, body, options)** – Send reminder-style text.

Phone numbers must be in E.164 (e.g. India: `91` + 10 digits, no + in code).

## Copy to another app

Copy the `whatsapp` folder into your project and set the same env vars. No other dependencies; uses native `fetch`.
