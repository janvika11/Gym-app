# WhatsApp Module – copy into any app

This folder is a **standalone, copy-paste module** for [Meta WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api). Use it in this gym app or copy the entire `whatsapp-module` folder into another Node.js project.

## Setup (Meta)

1. Go to [developers.facebook.com](https://developers.facebook.com) → Create App → Add **WhatsApp** product.
2. In WhatsApp → **API Setup** copy:
   - **Phone number ID**
   - **Access token** (temporary; for production use a system user token)
3. Add to your app’s `.env`:

```env
META_WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
META_WHATSAPP_ACCESS_TOKEN=your_access_token
```

## Usage (CommonJS)

```js
const { sendText, sendReminder, sendTemplate } = require('./whatsapp-module');

await sendText('919876543210', 'Hello!');
await sendReminder('919876543210', 'Reminder', 'Your session is at 6 PM.');
await sendTemplate('919876543210', 'hello_world', 'en');
```

## Usage (ES modules)

If your project uses `"type": "module"`, use the backend version at `backend/src/services/whatsapp/index.js` (same API, ESM exports).

## Phone numbers

Use E.164: country code + number, no `+`. Example: India `91` + 10 digits → `919876543210`.
