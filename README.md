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
- [WhatsApp Setup (Full Guide)](#whatsapp-setup-full-guide)
- [Admin Guide – How to Use the App](#admin-guide--how-to-use-the-app)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)

---

## Live App

| | URL |
|---|-----|
| **Frontend (Vercel)** | `https://your-app.vercel.app` |
| **Backend API (Render)** | `https://gym-app-2muj.onrender.com` |
| **Privacy Policy** | `https://your-app.vercel.app/#/privacy` |
| **Terms of Service** | `https://your-app.vercel.app/#/terms` |

*(Replace `your-app` with your actual Vercel project name.)*

For Meta Live mode checklist, see [LIVEMODE.md](./LIVEMODE.md).

---

## Features

- **Admin login** – JWT auth; signup creates gym + admin
- **Members** – Full CRUD, bulk CSV import, send welcome WhatsApp on add
- **Plans** – Configurable plans (name, duration, price)
- **Fees & Plans** – View members by plan, fee status (paid/pending/overdue)
- **Attendance** – Check-in/check-out, today’s list, monthly view, peak hours
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

Each gym can use its **own WhatsApp Business number**. Messages (welcome, reminders, expiry) are sent from that gym’s number, not a shared one.

### How to Use It

| Step | Where | What to Do |
|------|-------|------------|
| 1 | [developers.facebook.com](https://developers.facebook.com) | Create Meta app, add WhatsApp, get **Phone Number ID** |
| 2 | [business.facebook.com](https://business.facebook.com) | Create System User, generate token, copy **Access Token** |
| 3 | Your gym app → **Settings** | Scroll to **Connect WhatsApp Business** |
| 4 | Same form | Paste **Phone Number ID** and **Access Token** → **Save** |
| 5 | After Meta approves | Check **Mark as verified (Meta approved)** → Save again |

### What Happens After You Connect

- **Welcome messages** (new members) → sent from your gym’s number  
- **Reminders** (single or bulk) → sent from your gym’s number  
- **Expiry reminders** (daily cron) → sent from your gym’s number (only when **verified**)  

### If a Gym Has No WhatsApp Connected

The app falls back to the backend env vars (`META_WHATSAPP_PHONE_NUMBER_ID`, `META_WHATSAPP_ACCESS_TOKEN`). If those are not set, WhatsApp features won’t work for that gym.

### Summary

| Scenario | Who connects WhatsApp | Where messages come from |
|----------|------------------------|---------------------------|
| Gym A has connected | Gym A admin in Settings | Gym A’s number |
| Gym B has connected | Gym B admin in Settings | Gym B’s number |
| Gym C has not connected | — | Backend env (or nothing) |

---

## WhatsApp Setup (Full Guide)

### Option A: Per-Gym WhatsApp (Recommended for Multi-Gym)

Each gym admin connects their own WhatsApp Business number from the app.

#### Step 1: Create Meta App & Add WhatsApp

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. **Create App** → **Business** type
3. Add product: **WhatsApp** → **API Setup**

#### Step 2: Get Phone Number ID & Access Token

1. In **WhatsApp** → **API Setup**:
   - Add a phone number (or use existing)
   - Copy **Phone number ID**
2. **Meta Business Settings** → **Users** → **System Users**:
   - Create system user (or use existing)
   - **Generate Token** → Select your app
   - Permissions: `whatsapp_business_messaging`, `whatsapp_business_management`
   - Copy the token

#### Step 3: Create Message Template (Required for Production)

1. **Meta Business Manager** → **WhatsApp** → **Message Templates**
2. Create template:
   - **Name:** `gym_dynamic_message`
   - **Category:** UTILITY or MARKETING
   - **Body:** `{{1}}` (single parameter)
   - **Language:** English
3. Submit for approval (can take 24–48 hours)

#### Step 4: Connect in Gym App

1. Log in to the gym app
2. Go to **Settings**
3. Scroll to **Connect WhatsApp Business**
4. Paste:
   - **Phone Number ID**
   - **Access Token**
   - **Business Account ID** (optional)
   - **Phone Number** (optional, for display)
5. Click **Save WhatsApp credentials**
6. After Meta approves your number, check **Mark as verified (Meta approved)** and save again

#### Step 5: Add Recipients to Allowed List (Development Only)

In **Development** mode, add member phone numbers to the allowed list in Meta → WhatsApp → API Setup. In **Live** mode, this is not needed.

---

### Option B: Global WhatsApp (Backend Env)

For a single gym or fallback, set in `backend/.env`:

```env
META_WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
META_WHATSAPP_ACCESS_TOKEN=your_system_user_token
META_WHATSAPP_WELCOME_TEMPLATE_NAME=gym_dynamic_message
META_WHATSAPP_WELCOME_TEMPLATE_LANG=en_US
```

When a gym has no WhatsApp connected, the app uses these env vars.

---

### WhatsApp Message Rules

| Type | Rule |
|------|------|
| **Template messages** (welcome, expiry) | Work without member messaging first. Require Meta-approved templates. |
| **Plain text** (custom reminders) | Member must message your WhatsApp number first to open a 24-hour window. |

**For members:** Share `https://wa.me/91XXXXXXXXXX` (your business number). Once they send "Hi", you can send reminders for 24 hours.

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
- **Today’s list:** See who checked in today
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
| GET | `/api/attendance/today` | Today’s attendance |
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

---

## Project Structure

```
gym-app/
├── backend/
│   ├── src/
│   │   ├── config/       # DB connection
│   │   ├── cron/        # Expiry reminders (9 AM IST)
│   │   ├── middleware/  # authGym
│   │   ├── models/      # Gym, Member, Plan, etc.
│   │   ├── routes/      # API routes
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
├── LIVEMODE.md          # Meta Live mode checklist
└── README.md
```

---

## License

MIT (or your chosen license)
