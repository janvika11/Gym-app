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
- [WhatsApp Setup](#whatsapp-setup)
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

Replace with your actual Vercel domain if different.

---

## Features

- **Admin login** – JWT auth; signup creates gym + admin
- **Members** – Full CRUD, bulk CSV import (upload or paste), send welcome WhatsApp on add
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

## WhatsApp Setup

Connect a WhatsApp Business number to the Gym Management System. Replace `gym-app-three-mu.vercel.app` with your domain if different.

### Step 1 — Create Meta Developer Account

Go to [developers.facebook.com](https://developers.facebook.com) and log in with your Facebook account.

### Step 2 — Create Meta App

1. Go to [developers.facebook.com/apps](https://developers.facebook.com/apps)
2. Click **Create App**
3. Select **Business**
4. Fill App Name (e.g. Gym WhatsApp Integration) and Contact Email
5. Click **Create App**

### Step 3 — Add WhatsApp Product

Inside the App Dashboard, click **Add Product**, find **WhatsApp**, and click **Set Up**.

### Step 4 — Configure Basic App Settings

Open **App → Settings → Basic** and fill:

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

### Step 5 — Add WhatsApp Phone Number

1. Open **WhatsApp → API Setup** and click **Add Phone Number**
2. Enter phone number** – Your WhatsApp Business number (e.g. +91XXXXXXXXXX). This is the FROM number for messages.

   **⚠️ Before adding the number, make sure:**
   - That number **does NOT have WhatsApp installed** (personal or business)
   - That number **is not already used for WhatsApp Business API**

3. Business information**

   | Field | Value |
   |-------|-------|
   | Business Name | Your gym name (e.g. PowerFit Gym) |
   | Business Website | `https://gym-app-three-mu.vercel.app` |
   | Country | Select your country |
   | Address | Optional |
   | reCAPTCHA | Check the box |

   Click **Next**.

4. WhatsApp Business Profile**

   | Field | Value |
   |-------|-------|
   | Display Name | Your gym name |
   | Category | Fitness / Gym |
   | Description | Optional |

   Click **Next**.

5.  Phone verification** – Enter OTP sent via SMS or WhatsApp
6.  Display name review** – Status may show Pending (5 min–24 hrs) or Approved

### Step 6 — Create Message Template

1. Open [business.facebook.com/wa/manage/message-templates](https://business.facebook.com/wa/manage/message-templates)
2. Click **Create Template**
3. Category: **Utility**, Name: `gym_dynamic_message`, Body: `{{1}}` (single parameter = full message), Language: English
4. Submit for approval (wait 24–48 hours)

### Step 7 — Generate System User Access Token

1. Open [business.facebook.com/settings/system-users](https://business.facebook.com/settings/system-users)
2. Create system user (or use existing), Role: Admin, assign WhatsApp account
3. **Generate Token** → Select your app
4. Permissions: `whatsapp_business_messaging`, `whatsapp_business_management`
5. Copy the token (expires every 60 days)

### Step 8 — Copy API Credentials

Open **developers.facebook.com → Your App → WhatsApp → API Setup** and copy:

- **Phone Number ID**
- **WhatsApp Business Account ID** (WABA ID)

### Step 9 — Switch to Live Mode. In the side bar go to 'Publish' Page

 Click PUBLISH
 This switches **App Mode** from Development to **Live**. Fix any missing Basic settings if Meta shows errors. Do this after phone number is added and template is approved.

### Step 10 — Connect WhatsApp to Gym Platform

1. Open [gym-app-three-mu.vercel.app](https://gym-app-three-mu.vercel.app) and log in
2. Go to **Settings → Connect WhatsApp Business**
3. Enter **Phone Number ID** (Step 8), **Access Token** (Step 7), Business Account ID (optional), Phone Number (optional)
4. Click **Save WhatsApp credentials**
5. After Meta approves your display name, check **Mark as verified (Meta approved)** and save again

### Step 11 — Test the Integration

Add a test member (Name: Rahul, Phone: 919876543210), check **Send welcome message**, and save. The system will send welcome messages, membership reminders, payment alerts, and expiry reminders.

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
| **Bulk import** | Members → Import CSV → Upload file or paste → Optional: Send welcome |

**CSV format:** `name, phone, email, plan, startDate, endDate` (name and phone required)

- **Upload** a `.csv` file or **paste** data into the text area
- Accepts **comma**, **tab**, or **space-separated** values
- Dates: **YYYY-MM-DD** or **DD-MM-YYYY**
- Plan names must match your plans (e.g. Basic, Premium)
- **No row limit** – 100, 200, 500+ members all work. For 500+, turn off "Send welcome" to avoid timeouts.

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

- **Gym hours:** Set opening and closing times (e.g. 6 AM – 9 PM)
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
| "Template not found" | Create `gym_dynamic_message` in Meta; wait for approval |
| Messages not sending | Check Phone Number ID and token; verify gym WhatsApp in Settings |
| Token expired | Generate new System User token; update env or Settings |
| Meta Basic settings won't save | Use correct User Data Deletion URL: `#/privacy#data-deletion` |
 HEAD
| App Domain disappears | Enter domain only (no https://); click Save Changes before leaving |
| Messages not delivered / template error | Create template in Meta: Name `gym_dynamic_message`, Body `{{1}}` only, Category Utility. Wait for approval. App must be in Live mode. |

 de2faa7aa5ea94c937698ad41308ceb54e2f9181

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

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

### Sign Up page
<img width="1347" height="775" alt="image" src="https://github.com/user-attachments/assets/6bb93f93-397b-4200-9e99-ca9942b4e0d3" />



### Dashboard
<img width="940" height="313" alt="image" src="https://github.com/user-attachments/assets/13a139f1-94d7-4831-a67c-9c1efa062689" />




### Members
<img width="1907" height="611" alt="image" src="https://github.com/user-attachments/assets/b9ca7976-983d-4ddf-b49e-7e08df7084f4" />





### Add Members
<img width="1228" height="756" alt="image" src="https://github.com/user-attachments/assets/3f6f5795-c5f6-4b3c-9a92-9ad2af253c7b" />



<img width="1672" height="710" alt="image" src="https://github.com/user-attachments/assets/bf7d9769-dda1-4d89-86ee-c72732a6df6b" />




### Fees And Plans
<img width="1903" height="747" alt="image" src="https://github.com/user-attachments/assets/f3ded8c3-b492-41d0-8927-74b90bcd5f29" />




### Whatsapp
<img width="1871" height="643" alt="image" src="https://github.com/user-attachments/assets/d69cc1b2-5186-40f7-b217-9955943b34f9" />





### Compose Whatsapp message
<img width="1860" height="818" alt="image" src="https://github.com/user-attachments/assets/ff288ef1-c6fb-4325-8785-633ee9619d1d" />





### Attendance
<img width="1880" height="888" alt="image" src="https://github.com/user-attachments/assets/8a4e1216-f7ed-4efe-a0dd-4f46d9b6cd56" />





### Settings
<img width="993" height="752" alt="image" src="https://github.com/user-attachments/assets/78a271fb-c274-48bd-9328-f06922e8939a" />





<img width="940" height="858" alt="image" src="https://github.com/user-attachments/assets/19a1aff4-39c0-4fcf-a544-d3d04f30b1d7" />




