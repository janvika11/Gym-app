# Meta WhatsApp – Live Mode Checklist

Use this checklist to switch your Meta app from **Development** to **Live** mode so WhatsApp messages work in production.

---

## 1. Deploy Your App

Ensure your frontend is deployed (e.g. Vercel). You need public URLs for Meta.

| Item | URL |
|------|-----|
| **Frontend** | `https://YOUR-VERCEL-DOMAIN.vercel.app` |
| **Privacy Policy** | `https://YOUR-VERCEL-DOMAIN.vercel.app/#/privacy` |
| **Data Deletion** | `https://YOUR-VERCEL-DOMAIN.vercel.app/#/privacy#data-deletion` |
| **Terms of Service** | `https://YOUR-VERCEL-DOMAIN.vercel.app/#/terms` |

Replace `YOUR-VERCEL-DOMAIN` with your actual Vercel project URL.

---

## 2. Meta App Dashboard – Basic Settings

Go to [developers.facebook.com](https://developers.facebook.com) → Your App → **Settings** → **Basic**.

| Field | Value |
|-------|-------|
| **Privacy Policy URL** | `https://YOUR-VERCEL-DOMAIN.vercel.app/#/privacy` |
| **Terms of Service URL** | `https://YOUR-VERCEL-DOMAIN.vercel.app/#/terms` |
| **User Data Deletion** | `https://YOUR-VERCEL-DOMAIN.vercel.app/#/privacy#data-deletion` |
| **Contact Email** | Your email |
| **App Icon** | Upload (required) |
| **Display Name** | e.g. "Gym Admin" |
| **Category** | Select appropriate (e.g. Business) |
| **App Purpose** | Describe how you use WhatsApp (e.g. gym reminders) |

---

## 3. WhatsApp Template

Create a template in **Meta Business Manager** → **WhatsApp** → **Message Templates**:

- **Name:** `gym_dynamic_message`
- **Category:** UTILITY or MARKETING
- **Body:** `{{1}}` (single parameter = full message)
- **Language:** English

Submit for approval. Once approved, set in backend `.env`:

```env
META_WHATSAPP_WELCOME_TEMPLATE_NAME=gym_dynamic_message
META_WHATSAPP_WELCOME_TEMPLATE_LANG=en_US
```

---

## 4. System User Token (Production)

Development tokens expire quickly. For Live mode, use a **System User** token:

1. **Meta Business Settings** → **Users** → **System Users**
2. Create a system user (or use existing)
3. **Generate Token** → Select your app
4. Add permissions: `whatsapp_business_messaging`, `whatsapp_business_management`
5. Copy the token and set in backend `.env`:

```env
META_WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
META_WHATSAPP_ACCESS_TOKEN=your_system_user_token
```

---

## 5. Switch to Live Mode

1. In App Dashboard, open the **App Mode** toggle (top of page)
2. Switch from **Development** to **Live**
3. If any field is missing, Meta will show an error – fix it in Basic Settings

---

## 6. Verify

- Add a test member in your gym app with WhatsApp enabled
- Confirm the welcome message is sent
- Check Meta’s WhatsApp API logs for any errors

---

## Troubleshooting

| Issue | Fix |
|------|-----|
| "Privacy Policy URL invalid" | Ensure URL is public, not localhost, and loads correctly |
| "Data deletion required" | Use `#/privacy#data-deletion` – the section has explicit instructions |
| Template not found | Wait for approval; ensure template name matches env exactly |
| Messages not sending | Check System User token has correct permissions; verify phone number ID |
