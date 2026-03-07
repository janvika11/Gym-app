# Gym Admin – Multi-Gym SaaS with WhatsApp Reminders

A full-stack **gym management SaaS** for admins: members, plans, attendance, fees, and **WhatsApp reminders** via Meta Cloud API. Supports **multiple gyms**, each with its own WhatsApp Business number.

---

## Table of Contents

- [Live App](#live-app)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start (Local Development)](#quick-start-local-development)
- [Deployment](#deployment)
- [Multi-Gym WhatsApp](#multi-gym-multi-whatsapp--how-it-works)
- [WhatsApp Setup – Copy-Paste Guide](#whatsapp-setup--copy-paste-guide)
- [Admin Guide](#admin-guide--how-to-use-the-app)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [Project Structure](#project-structure)
- [Other Docs](#other-docs)

---

## Live App

| | URL |
|---|-----|
| **Frontend (Vercel)** | `https://gym-app-three-mu.vercel.app` |
| **Backend API (Render)** | `https://gym-app-2muj.onrender.com` |
| **Privacy Policy** | `https://gym-app-three-mu.vercel.app/#/privacy` |
| **Terms of Service** | `https://gym-app-three-mu.vercel.app/#/terms` |
| **User Data Deletion URL** | `https://gym-app-three-mu.vercel.app/#/privacy#data-deletion` |
Add these urls.

---

## Features

- **Admin login** – JWT auth; signup creates gym + admin
- **Members** – Full CRUD, bulk CSV import, send welcome WhatsApp on add
- **Plans** – Configurable plans (name, duration, price)
- **Fees & Plans** – View members by plan, fee status (paid/pending/overdue)
- **Attendance** – Check-in/check-out, today's list, monthly view, peak hours
- **Dashboard** – Active members, revenue, pending dues, attendance stats
- **WhatsApp reminders** – Send to one or many members; auto reminders (expiry, overdue, inactive)
- **Multi-gym WhatsApp** – Each gym connects its own WhatsApp Business number in Settings

---

## Tech Stack

| Layer | Stack |
|-------|-------|
| **Frontend** | React 18, React Router, Vite |
| **Backend** | Node.js, Express, MongoDB (Mongoose), JWT, bcrypt |
| **WhatsApp** | Meta Cloud API (per-gym or env fallback) |

---

## Prerequisites

- **Node.js** 18+
- **MongoDB** (local or Atlas)
- **Meta Developer Account** (for WhatsApp)

---

## Quick Start (Local Development)

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/gym-app.git
cd gym-app
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/gymapp
JWT_SECRET=your-super-secret-jwt-key-change-in-production
ADMIN_EMAIL=admin@gym.com
ADMIN_PASSWORD=admin123
```

```bash
npm install
npm run dev
```

Backend runs at **http://localhost:5000**.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173** (or 3000). It proxies `/api` to the backend.

### 4. First Login

1. Open **http://localhost:5173**
2. Go to **Sign up** → Create gym (name, email, password)
3. Or use default admin if `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set in `.env`

---

## Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Set root directory to `frontend`
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add env var: `VITE_API_BASE_URL` = your backend API URL (optional; production uses Render URL by default)

### Backend (Render)

1. Create a **Web Service** on [Render](https://render.com)
2. Connect your GitHub repo
3. Root directory: `backend`
4. Build: `npm install`
5. Start: `npm start`
6. Add environment variables (see [Backend Env Vars](#backend-env-vars))

### Backend Env Vars

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string (e.g. Atlas) |
| `JWT_SECRET` | Yes | Long random string for JWT signing |
| `ADMIN_EMAIL` | No | Default admin email (for seeding) |
| `ADMIN_PASSWORD` | No | Default admin password |
| `META_WHATSAPP_PHONE_NUMBER_ID` | No* | Fallback when gym has no WhatsApp |
| `META_WHATSAPP_ACCESS_TOKEN` | No* | Fallback access token |
| `META_WHATSAPP_WELCOME_TEMPLATE_NAME` | No | e.g. `gym_dynamic_message` |
| `META_WHATSAPP_WELCOME_TEMPLATE_LANG` | No | e.g. `en_US` |

\* If gyms connect their own WhatsApp in Settings, env vars are optional.

---

## Multi-Gym, Multi-WhatsApp – How It Works

Each gym can use its **own WhatsApp Business number**. Messages (welcome, reminders, expiry) are sent from that gym's number, not a shared one.

### How to Use It

| Step | Where | What to Do |
|------|-------|------------|
| 1 | [developers.facebook.com](https://developers.facebook.com) | Create Meta app, add WhatsApp, get **Phone Number ID** |
| 2 | [business.facebook.com](https://business.facebook.com) | Create System User, generate token, copy **Access Token** |
| 3 | Your gym app → **Settings** | Scroll to **Connect WhatsApp Business** |
| 4 | Same form | Paste **Phone Number ID** and **Access Token** → **Save** |
| 5 | After Meta approves | Check **Mark as verified (Meta approved)** → Save again |

### What Happens After You Connect

- **Welcome messages** (new members) → sent from your gym's number
- **Reminders** (single or bulk) → sent from your gym's number
- **Expiry reminders** (daily cron) → sent from your gym's number (only when **verified**)

### Summary

| Scenario | Who connects WhatsApp | Where messages come from |
|----------|------------------------|---------------------------|
| Gym A has connected | Gym A admin in Settings | Gym A's number |
| Gym B has connected | Gym B admin in Settings | Gym B's number |
| Gym C has not connected | — | Backend env (or nothing) |

---

## WhatsApp Setup Guide:

# WhatsApp Cloud API Setup (Gym SaaS Platform)

This guide explains how to connect a WhatsApp Business number to the Gym Management System.

Platform URL: https://gym-app-three-mu.vercel.app

---

## Step 1 — Create Meta Developer Account

Go to: https://developers.facebook.com
Log in with your Facebook account.

---

## Step 2 — Create Meta App

Go to: https://developers.facebook.com/apps
Click: Create App
Select: Business
Fill: App Name (e.g. Gym WhatsApp Integration), Contact Email
Click: Create App

---

## Step 3 — Add WhatsApp Product

Inside the App Dashboard:
Click: Add Product
Find: WhatsApp
Click: Set Up

---

## Step 4 — Configure Basic App Settings

Open: App → Settings → Basic

Fill the following:

App Domain: gym-app-three-mu.vercel.app
Privacy Policy URL: https://gym-app-three-mu.vercel.app/#/privacy
Terms of Service URL: https://gym-app-three-mu.vercel.app/#/terms
User Data Deletion URL: https://gym-app-three-mu.vercel.app/#/privacy#data-deletion
Contact Email: Your email
App Icon: Upload (1024×1024, mandatory)
Category: Messenger Bots for Business

Click: Save Changes

---

## Step 5 — Add WhatsApp Phone Number

Open: WhatsApp → API Setup
Click: Add Phone Number

Complete the wizard in order:

5a. Enter phone number (e.g. +91XXXXXXXXXX) — this is the FROM number for messages

5b. Business information:
    Business Name: Your gym name (e.g. PowerFit Gym)
    Business Website: https://gym-app-three-mu.vercel.app
    Country: Select your country
    Address: Optional
    reCAPTCHA: Check the box
    Click: Next

5c. WhatsApp Business Profile:
    Display Name: Your gym name
    Category: Fitness / Gym
    Description: Optional
    Click: Next

5d. Phone verification: Enter OTP sent via SMS or WhatsApp

5e. Display name review: Status may show Pending (5 min–24 hrs) or Approved

---

## Step 6 — Create Message Template

Open: https://business.facebook.com/wa/manage/message-templates
Click: Create Template

Category: Utility
Template Name: gym_dynamic_message
Body: {{1}} (single parameter = full message)
Language: English

Submit for approval. Wait 24–48 hours.

---

## Step 7 — Generate System User Access Token

Open: https://business.facebook.com/settings/system-users
Create system user (or use existing)
Name: e.g. Gym WhatsApp Bot
Role: Admin
Assign your WhatsApp account
Generate Token → Select your app
Permissions: whatsapp_business_messaging, whatsapp_business_management
Copy the token (expires every 60 days)

---

## Step 8 — Copy API Credentials

Open: developers.facebook.com → Your App → WhatsApp → API Setup

Copy:
- Phone Number ID
- WhatsApp Business Account ID (WABA ID)

---

## Step 9 — Switch to Live Mode

Open: App Dashboard (top of page)
App Mode: Development → Click to switch to Live
Fix any missing Basic settings if Meta shows errors.

Do this after phone number is added and template is approved.

---

## Step 10 — Connect WhatsApp to Gym Platform

Open: https://gym-app-three-mu.vercel.app
Go to: Settings → Connect WhatsApp Business

Enter:
Phone Number ID: (from Step 8)
Access Token: (from Step 7)
Business Account ID (optional): WABA ID from Step 8
Phone Number (optional): e.g. +91 9876543210

Click: Save WhatsApp credentials

After Meta approves your display name, check "Mark as verified (Meta approved)" and save again.

---

## Step 11 — Test the Integration

Gym app → Members → Add member
Add test member: Name: Rahul, Phone: 919876543210
Check: Send welcome message
Save

The system will send: Welcome message, Membership reminders, Payment alerts, Expiry reminders
```

---

## Admin Guide – How to Use the App

### Dashboard

- View active members, revenue, pending dues
- Attendance stats, peak hours chart
- Quick links to Members, Plans, Fees, Attendance

### Members

| Action | How |
|--------|-----|
| **Add member** | Members → Add member → Fill name, phone, email, plan, dates → Save |
| **Send welcome WhatsApp** | Check "Send welcome message" when adding (or in bulk import) |
| **Edit member** | Click member → Edit → Save |
| **Delete member** | Click member → Delete → Confirm |
| **Send reminder** | Click member → Remind → Edit message → Send |
| **Bulk import** | Members → Import CSV → Paste CSV or upload → Optional: Send welcome |

**CSV format:** `name, phone, email, plan, startDate, endDate`

Example:

```csv
name,phone,email,plan,startDate,endDate
John Doe,9876543210,john@example.com,Monthly,2024-01-01,2024-01-31
```

### Plans

- **Add plan:** Plans → Add plan → Name, duration (days), price, description
- **Edit/Delete:** Click plan → Edit or Delete

### Fees & Plans

- View members grouped by plan
- Filter by payment status (paid, pending, overdue)
- Manage plans (link to Plans page)

### Attendance

- **Check in:** Select member, date → Check in
- **Remove check-in:** Click check-in → Remove
- **Today's list:** See who checked in today
- **Monthly view:** Calendar of attendance
- **Peak hours:** Chart of busiest times

### Reminders

| Action | How |
|--------|-----|
| **Send to one** | Reminders → Select template → Choose member → Send |
| **Send to many** | Reminders → Select members (checkboxes) → Compose → Send |
| **Auto reminders** | Overdue, Expiring soon, Inactive – click to send to filtered groups |
| **View history** | Reminders → Logs tab |

**Placeholders:** `{name}`, `{gym}`, `{fee}`, `{date}`, `{expiry}`, `{plan}`

### Settings

- **WhatsApp message templates:** Customize welcome, fee reminder, overdue, expiring, inactive messages
- **Add custom templates:** For use in Reminders
- **Connect WhatsApp Business:** Per-gym Phone Number ID, Access Token, mark verified

---

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signup` | Sign up (gym + admin) |
| POST | `/api/auth/login` | Login → JWT |
| GET | `/api/auth/me` | Current user (Bearer token) |
| POST | `/api/gyms/connect-whatsapp` | Save gym WhatsApp credentials |
| GET | `/api/gyms/whatsapp-status` | Gym WhatsApp connection status |
| GET/POST/PUT/DELETE | `/api/members` | Members CRUD |
| POST | `/api/members/bulk` | Bulk import members |
| POST | `/api/members/:id/remind` | Send expiry reminder to one member |
| GET/POST/PUT/DELETE | `/api/plans` | Plans CRUD |
| POST | `/api/reminders/send` | Send reminder to one member |
| POST | `/api/reminders/send-bulk` | Send reminders to many |
| GET | `/api/reminders/logs` | Reminder history |
| GET | `/api/stats` | Dashboard stats |
| POST/DELETE | `/api/attendance/check-in` | Record/remove check-in |
| GET | `/api/attendance/today` | Today's attendance |
| GET | `/api/attendance/month` | Monthly attendance |
| GET | `/api/attendance/today-hours` | Peak hours |
| GET/PUT | `/api/settings` | Gym settings |
| GET/POST/PUT/DELETE | `/api/templates` | Message templates |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Recipient not in allowed list" | Add phone to Meta allowed list (Dev mode) or switch to Live |
| "Template not found" | Create `gym_dynamic_message` in Meta; wait for approval |
| Messages not sending | Check Phone Number ID and token; verify gym WhatsApp in Settings |
| CORS error | Add your frontend URL to backend CORS allowed origins |
| MongoDB connection failed | Check `MONGODB_URI`; ensure IP is whitelisted (Atlas) |
| Token expired | Generate new System User token; update env or Settings |
| Meta Basic settings won't save | Use correct User Data Deletion URL: `#/privacy#data-deletion` |
| App Domain disappears | Enter domain only (no https://); click Save Changes before leaving |

---

## Project Structure

```
gym-app/
├── backend/
│   ├── src/
│   │   ├── config/       # DB connection
│   │   ├── cron/         # Expiry reminders (9 AM IST)
│   │   ├── middleware/   # authGym
│   │   ├── models/       # Gym, Member, Plan, etc.
│   │   ├── routes/       # API routes
│   │   ├── services/
│   │   │   └── whatsapp/ # WhatsApp Cloud API
│   │   └── index.js
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── api.js
│   └── package.json
├── LIVEMODE.md           # Meta Live mode checklist (which website for each step)
├── WHATSAPP_SETUP_GUIDE.md  # Detailed WhatsApp setup (formatted)
└── README.md
```

---

## Other Docs

| File | Description |
|------|-------------|
| [LIVEMODE.md](./LIVEMODE.md) | Meta Live mode checklist – which website to open at each step |
| [WHATSAPP_SETUP_GUIDE.md](./WHATSAPP_SETUP_GUIDE.md) | Detailed WhatsApp setup (formatted tables) |

---

## License

MIT (or your chosen license)
