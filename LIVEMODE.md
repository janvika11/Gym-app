# Meta WhatsApp – Live Mode Checklist

Step-by-step guide for **Live mode** (production). Each step shows **which website to open** and **what to do**.

---

## Step 1: Deploy Your App (if not done)

| Open | Action |
|------|--------|
| [vercel.com](https://vercel.com) | Deploy frontend. Get your live URL, e.g. `https://gym-app-three-mu.vercel.app` |

**Your Live URLs** (replace with your actual Vercel domain):

| Item | URL |
|------|-----|
| Frontend | `https://YOUR-VERCEL-DOMAIN.vercel.app` |
| Privacy Policy | `https://YOUR-VERCEL-DOMAIN.vercel.app/#/privacy` |
| Data Deletion | `https://YOUR-VERCEL-DOMAIN.vercel.app/#/privacy#data-deletion` |
| Terms of Service | `https://YOUR-VERCEL-DOMAIN.vercel.app/#/terms` |

---

## Step 2: Meta App – Basic Settings

| Open | Action |
|------|--------|
| [developers.facebook.com](https://developers.facebook.com) | Log in → Select your app (or create one) |
| **Settings** → **Basic** | Fill in all required fields |

| Field | Value |
|-------|-------|
| Privacy Policy URL | `https://YOUR-VERCEL-DOMAIN.vercel.app/#/privacy` |
| Terms of Service URL | `https://YOUR-VERCEL-DOMAIN.vercel.app/#/terms` |
| User Data Deletion | `https://YOUR-VERCEL-DOMAIN.vercel.app/#/privacy#data-deletion` |
| Contact Email | Your email |
| App Icon | Upload (required) |
| Display Name | e.g. "Gym Admin" |
| Category | Business (or appropriate) |
| App Purpose | Describe WhatsApp usage (e.g. gym reminders) |

---

## Step 3: WhatsApp – Add Product & Phone Number

| Open | Action |
|------|--------|
| [developers.facebook.com](https://developers.facebook.com) → Your App | **Add Product** → **WhatsApp** → **Set up** |
| **WhatsApp** → **API Setup** | Add a phone number (or use existing) |
| Same page | Copy **Phone number ID** (save for Step 6) |

---

## Step 4: Create Message Template

| Open | Action |
|------|--------|
| [business.facebook.com](https://business.facebook.com) | **WhatsApp Manager** → **Message Templates** |
| **Create template** | Name: `gym_welcome` |
| | Category: UTILITY or MARKETING |
| | Body: `{{1}}` (single parameter) |
| | Language: English |
| **Submit** | Wait for Meta approval (24–48 hours) |

---

## Step 5: System User Token (Production)

| Open | Action |
|------|--------|
| [business.facebook.com](https://business.facebook.com) → **Settings** | **Users** → **System Users** |
| Create or select system user | **Generate Token** |
| Select your app | Add permissions: `whatsapp_business_messaging`, `whatsapp_business_management` |
| Copy token | Save for Step 6 (do not share) |

---

## Step 6: Add Credentials to Your App

**Option A – Per-gym (Settings in app):**

| Open | Action |
|------|--------|
| `https://YOUR-VERCEL-DOMAIN.vercel.app` | Log in to your gym app |
| **Settings** → **Connect WhatsApp Business** | Paste Phone Number ID, Access Token |
| | Click **Save WhatsApp credentials** |
| | After Meta approves number: check **Mark as verified** → Save |

**Option B – Backend env (Render):**

| Open | Action |
|------|--------|
| [dashboard.render.com](https://dashboard.render.com) | Your backend service → **Environment** |
| Add variables | `META_WHATSAPP_PHONE_NUMBER_ID`, `META_WHATSAPP_ACCESS_TOKEN` |
| | `META_WHATSAPP_WELCOME_TEMPLATE_NAME=gym_welcome` |
| | `META_WHATSAPP_WELCOME_TEMPLATE_LANG=en` |

---

## Step 7: Switch to Live Mode

| Open | Action |
|------|--------|
| [developers.facebook.com](https://developers.facebook.com) → Your App | Top of page: **App Mode** toggle |
| Toggle | Switch from **Development** to **Live** |
| If error appears | Fix missing fields in **Settings** → **Basic** |

---

## Step 8: Verify

| Open | Action |
|------|--------|
| `https://YOUR-VERCEL-DOMAIN.vercel.app` | Log in → **Members** → **Add member** |
| Add test member | Name, phone (real WhatsApp number), plan, dates |
| Check **Send welcome message** | Save |
| Member's WhatsApp | Confirm welcome message received |
| [developers.facebook.com](https://developers.facebook.com) → Your App → **WhatsApp** → **API Setup** | Check logs for errors |

---

## Quick Reference – Which Website for What

| Task | Website |
|------|---------|
| Deploy frontend | [vercel.com](https://vercel.com) |
| Meta app settings, add WhatsApp, switch to Live | [developers.facebook.com](https://developers.facebook.com) |
| Create template, System User token | [business.facebook.com](https://business.facebook.com) |
| Connect WhatsApp (per-gym) | Your app: `https://YOUR-VERCEL-DOMAIN.vercel.app/#/settings` |
| Backend env vars | [dashboard.render.com](https://dashboard.render.com) |
| Test welcome message | Your app: `https://YOUR-VERCEL-DOMAIN.vercel.app/#/members` |

---

## Troubleshooting

| Issue | Fix |
|------|-----|
| "Privacy Policy URL invalid" | Use your live Vercel URL, not localhost |
| "Data deletion required" | Use `#/privacy#data-deletion` – section must exist on Privacy page |
| Template not found | Wait for approval; name must match exactly: `gym_welcome` |
| Messages not sending | Check token permissions; verify Phone Number ID; ensure number is approved |
| "Recipient not in allowed list" | Only in Dev mode – switch to Live to remove this restriction |
