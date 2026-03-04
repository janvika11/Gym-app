# Gym App

Web app for gym admin: **admin login**, **members CRUD**, **configurable plans**, **attendance**, **fees**, and **WhatsApp reminders** via Meta Cloud API. Built with React, Node.js, MongoDB, and a reusable WhatsApp module.

## Live app

| | URL |
|---|-----|
| **Frontend (Vercel)** | https://your-app.vercel.app |
| **Backend API (Render)** | https://gym-app-2muj.onrender.com |

*(Replace `your-app` with your actual Vercel project name.)*

## Features

- **Admin login** – JWT-based auth; default admin from env (see below).
- **Members** – Full CRUD; name, phone, email, plan, start/end dates, active, notes.
- **Plans** – Configurable plans (name, duration in days, price, description, active).
- **Fees & Plans** – View members by plan, fee status.
- **Attendance** – Check-in/check-out, today’s list, monthly view, peak hours.
- **Dashboard** – Active members, revenue, pending dues, attendance stats, peak hours chart.
- **WhatsApp reminders** – Send reminders to one or many members (Meta Cloud API). Auto reminders (overdue, expiring, inactive), compose custom messages, message history.

## Tech stack

- **Frontend:** React 18, React Router, Vite.
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcrypt.
- **WhatsApp:** Meta Cloud API (modular service in `backend/src/services/whatsapp/` and standalone folder `whatsapp-module/`).

## Prerequisites

- Node.js 18+
- MongoDB running locally (or a remote URI)

## Quick start

**Use the deployed app:** Open the **Frontend (Vercel)** link above. It connects to the **Backend (Render)** automatically. Log in with your admin credentials.

---

**Local development** (optional):

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD (use your real email)
npm install
npm run dev
```

Server runs at **http://localhost:5000**. Default admin (set in `.env`): use your own email and password, e.g. `ADMIN_EMAIL=you@example.com`, `ADMIN_PASSWORD=your-secure-password`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:3000**. Vite proxies `/api` to the backend.

### 3. WhatsApp (optional)

1. Create a Meta app and add WhatsApp: [developers.facebook.com](https://developers.facebook.com).
2. In WhatsApp → API Setup, copy **Phone number ID**.
3. Create a **System User** token (60 days) in Business Settings → Users → System Users → Generate Token. Add permissions: `whatsapp_business_messaging`, `whatsapp_business_management`.
4. Add to `backend/.env`:

```env
META_WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
META_WHATSAPP_ACCESS_TOKEN=your_system_user_token
```

Restart the backend. Phone numbers are normalized (10-digit Indian numbers get `91` prefix; leading zeros stripped).

## How to add members

1. Log in to the app.
2. Go to **Members** → **Add member**.
3. Fill in: Name, Phone (10 digits, e.g. `9876543210`), Email, Plan, Start/End dates.
4. Save. The phone is stored without leading zeros.

### WhatsApp reminders – recipient must message first

For **plain text** reminders to work, each member must **message your gym’s WhatsApp Business number first** (e.g. send "Hi"). This opens a **24-hour window** during which you can send them reminders.

**Steps for members:**
1. Share your gym’s WhatsApp number (or link like `https://wa.me/91XXXXXXXXXX`).
2. Member sends any message (e.g. "Hi") to that number.
3. You can send reminders from the app for the next 24 hours.
4. After 24 hours, they need to message again to open a new window.

**Template messages** (fee_reminder, overdue, etc.) work without this – but require Meta-approved templates. See Meta Business Manager to create and submit templates.

## Reusing the WhatsApp module in other apps

- **Option A:** Copy the **`whatsapp-module`** folder into your other project and `require('./whatsapp-module')` or import the ESM version.
- **Option B:** Copy **`backend/src/services/whatsapp/`** (ESM) into your backend and set the same env vars. No gym-specific code; only config and generic `sendText`, `sendTemplate`, `sendReminder`.

See `whatsapp-module/README.md` for usage and env details.

## API (backend)

| Method | Path | Description |
|--------|------|-------------|
| POST   | /api/auth/login | Login (email, password) → JWT |
| GET    | /api/auth/me    | Current admin (Bearer token) |
| GET/POST/PUT/DELETE | /api/members   | Members CRUD |
| GET/POST/PUT/DELETE | /api/plans     | Plans CRUD |
| POST   | /api/reminders/send     | Send reminder to one member |
| POST   | /api/reminders/send-bulk| Send reminder to many members |
| GET    | /api/reminders/logs     | Message history |
| GET    | /api/stats              | Dashboard stats |
| POST   | /api/attendance/check-in| Record check-in |
| DELETE | /api/attendance/check-in| Remove check-in |
| GET    | /api/attendance/today   | Today’s attendance |
| GET    | /api/attendance/month   | Monthly attendance |
| GET    | /api/attendance/today-hours | Peak hours data |
