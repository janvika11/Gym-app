# WhatsApp Cloud API Setup (Gym SaaS Platform)

This guide explains how to connect a WhatsApp Business number to the Gym Management System.

**Platform URL:** [https://gym-app-three-mu.vercel.app](https://gym-app-three-mu.vercel.app/)

---

## Step 1 — Create Meta Developer Account

| Open | Action |
|------|--------|
| [developers.facebook.com](https://developers.facebook.com) | Log in with your Facebook account |

---

## Step 2 — Create Meta App

| Open | Action |
|------|--------|
| [developers.facebook.com/apps](https://developers.facebook.com/apps) | Click **Create App** |
| | Select **Business** |
| | App Name: e.g. *Gym WhatsApp Integration* |
| | Contact Email: Your email |
| | Click **Create App** |

---

## Step 3 — Add WhatsApp Product

| Open | Action |
|------|--------|
| App Dashboard | Click **Add Product** |
| | Find **WhatsApp** → Click **Set Up** |

---

## Step 4 — Configure Basic App Settings

| Open | Action |
|------|--------|
| App → **Settings** → **Basic** | Fill the following |

| Field | Value |
|-------|-------|
| App Domain | `gym-app-three-mu.vercel.app` |
| Privacy Policy URL | `https://gym-app-three-mu.vercel.app/#/privacy` |
| Terms of Service URL | `https://gym-app-three-mu.vercel.app/#/terms` |
| User Data Deletion URL | `https://gym-app-three-mu.vercel.app/#/privacy#data-deletion` |
| Contact Email | Your email |
| App Icon | Upload (1024×1024, mandatory) |
| Category | Messenger Bots for Business |

Click **Save Changes**.

> ⚠️ **Fix:** User Data Deletion must point to the **Privacy page** (`#/privacy#data-deletion`), not Terms.

---

## Step 5 — Add WhatsApp Phone Number (Single Flow)

| Open | Action |
|------|--------|
| **WhatsApp** → **API Setup** | Click **Add Phone Number** |

This opens a wizard. Complete all steps in order:

### 5a. Enter phone number
- Enter your WhatsApp Business number (e.g. +91XXXXXXXXXX)
- This becomes the **FROM** number that sends messages to gym members

### 5b. Business information
| Field | Value |
|-------|-------|
| Business Name | Your gym name (e.g. PowerFit Gym) |
| Business Website | `https://gym-app-three-mu.vercel.app` |
| Country | Select your country |
| Address | Optional |
| reCAPTCHA | Check the box |

Click **Next**.

### 5c. WhatsApp Business Profile
| Field | Value |
|-------|-------|
| Display Name | Your gym name |
| Category | Fitness / Gym |
| Description | Optional |

Click **Next**.

### 5d. Phone verification
- Meta sends OTP via **SMS** or **WhatsApp**
- Enter the verification code
- After verification, the number is added

### 5e. Display name review
- Status may show **Pending** (5 min – 24 hrs) or **Approved**
- Check: WhatsApp Manager → Phone Numbers

---

## Step 6 — Create Message Template

| Open | Action |
|------|--------|
| [business.facebook.com/wa/manage/message-templates](https://business.facebook.com/wa/manage/message-templates) | Click **Create Template** |

| Field | Value |
|-------|-------|
| Category | Utility |
| Template Name | `gym_dynamic_message` |
| Body | `{{1}}` (single parameter = full message) |
| Language | English |

Submit for approval. Wait 24–48 hours.

> ⚠️ **Fix:** The gym app uses `gym_dynamic_message` with body `{{1}}`, not `gym_welcome`. Use this exact name.

---

## Step 7 — Generate System User Access Token

| Open | Action |
|------|--------|
| [business.facebook.com/settings/system-users](https://business.facebook.com/settings/system-users) | Create system user (or use existing) |
| | Name: e.g. *Gym WhatsApp Bot* |
| | Role: Admin |
| | Assign your WhatsApp account |
| **Generate Token** | Select your app |
| | Permissions: `whatsapp_business_messaging`, `whatsapp_business_management` |
| | **Copy the token** (store securely) |

> Note: Token expires every 60 days. Regenerate and update in the gym app.

---

## Step 8 — Copy API Credentials

| Open | Action |
|------|--------|
| [developers.facebook.com](https://developers.facebook.com) → Your App → **WhatsApp** → **API Setup** | Copy: |
| | • **Phone Number ID** |
| | • **WhatsApp Business Account ID** (WABA ID) |

> You do **not** need Business Manager ID. The gym app uses WABA ID as "Business Account ID".

---

## Step 9 — Switch to Live Mode (When Ready)

| Open | Action |
|------|--------|
| App Dashboard (top of page) | **App Mode:** Development → Click to switch to **Live** |
| | Fix any missing Basic settings if Meta shows errors |

Do this after phone number is added and template is approved.

---

## Step 10 — Connect WhatsApp to Gym Platform

| Open | Action |
|------|--------|
| [gym-app-three-mu.vercel.app](https://gym-app-three-mu.vercel.app) | Log in |
| **Settings** → **Connect WhatsApp Business** | Enter: |

| Field | Value |
|-------|-------|
| **Phone Number ID** | From Step 8 |
| **Access Token** | From Step 7 |
| Business Account ID (optional) | WABA ID from Step 8 |
| Phone Number (optional) | e.g. +91 9876543210 |

Click **Save WhatsApp credentials**.

After Meta approves your display name, check **Mark as verified (Meta approved)** and save again.

---

## Step 11 — Test the Integration

| Open | Action |
|------|--------|
| Gym app → **Members** → **Add member** | Add test member |
| | Name: Rahul |
| | Phone: 919876543210 |
| | Check **Send welcome message** |
| | Save |

The system will send:
- Welcome message
- Membership reminders
- Payment alerts
- Expiry reminders

---

## Summary of Fixes Applied

| Issue | Original | Corrected |
|-------|----------|-----------|
| User Data Deletion URL | `#/terms` | `#/privacy#data-deletion` |
| Step 5 (Publish) | Too early | Moved to Step 9 (after setup) |
| Steps 6–9 | Split across 4 steps, Step 9 duplicated flow | Merged into single Step 5 (Add Phone wizard) |
| Step 12 (Business Manager ID) | Separate step | Removed – gym app doesn't use it |
| Step 15 fields | Business Manager ID, WABA ID, etc. | Phone Number ID, Access Token, Business Account ID (WABA), Phone Number |
| Template name | `gym_welcome` | `gym_dynamic_message` |
| Settings section name | WhatsApp Integration | Connect WhatsApp Business |
