# Gym App

Web app for gym admin: **admin login**, **members CRUD**, **configurable plans**, and **WhatsApp reminders** via Meta Cloud API. Built with React, Node.js, MongoDB, and a reusable WhatsApp module.

## Features

- **Admin login** – JWT-based auth; default admin from env (see below).
- **Members** – Full CRUD; name, phone, email, plan, start/end dates, active, notes.
- **Plans** – Configurable plans (name, duration in days, price, description, active).
- **WhatsApp reminders** – Send reminder messages to one or many members (Meta Cloud API). Module is **copy-paste ready** for use in other apps.

## Tech stack

- **Frontend:** React 18, React Router, Vite.
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcrypt.
- **WhatsApp:** Meta Cloud API (modular service in `backend/src/services/whatsapp/` and standalone folder `whatsapp-module/`).

## Prerequisites

- Node.js 18+
- MongoDB running locally (or a remote URI)

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set MONGODB_URI, JWT_SECRET, and optionally ADMIN_EMAIL / ADMIN_PASSWORD
npm install
npm run dev
```

Server runs at **http://localhost:5000**. Default admin (if set in `.env`): `ADMIN_EMAIL=admin@gym.com`, `ADMIN_PASSWORD=admin123`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:3000**. Vite proxies `/api` to the backend.

### 3. WhatsApp (optional)

1. Create a Meta app and add WhatsApp: [developers.facebook.com](https://developers.facebook.com).
2. In WhatsApp → API Setup, copy **Phone number ID** and **Access token**.
3. Add to `backend/.env`:

```env
META_WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
META_WHATSAPP_ACCESS_TOKEN=your_access_token
```

Restart the backend. Use **WhatsApp Reminders** in the app to send messages. Phone numbers are normalized (e.g. 10-digit Indian numbers get `91` prefix).

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
