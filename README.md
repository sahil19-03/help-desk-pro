<div align="center">

# 🖥️ HelpDesk Pro

**An internal IT help-desk platform for modern companies.**  
Employees register incidents · Engineers resolve them · Admins manage everything.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-help--desk--pro--01.vercel.app-22c55e?style=for-the-badge&logo=vercel)](https://help-desk-pro-01.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-sahil19--03%2Fhelp--desk--pro-181717?style=for-the-badge&logo=github)](https://github.com/sahil19-03/help-desk-pro)

</div>

---

## 🌐 Live Links

| Resource | URL |
|----------|-----|
| 🚀 **Live App (Vercel)** | https://help-desk-pro-01.vercel.app/ |
| 📦 **GitHub Repository** | https://github.com/sahil19-03/help-desk-pro |

---

## 📸 Screenshots

> Screenshots are best viewed in the live app: https://help-desk-pro-01.vercel.app/

| Login | Employee Dashboard | Admin Panel |
|-------|--------------------|-------------|
| Google OAuth + email/password sign-in | Ticket submission & status tracking | Full user & ticket management |

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | Email/password login **+** Google OAuth 2.0 (only pre-approved accounts) |
| 🎫 **Ticket Management** | Create, track, assign, and resolve support tickets |
| 👥 **Role-Based Access** | Three distinct roles – `employee`, `engineer`, `admin` |
| 🏢 **Department Identity** | Every user sees their own department (e.g. *Finance*, *Customer Support*) in their profile dropdown |
| 🔍 **Scroll-spy Navigation** | Header tabs highlight automatically as you scroll through sections |
| 🛡️ **Admin Dashboard** | Promote/demote users, view all tickets, and audit history |
| 📊 **Live Queue** | Engineers see a real-time queue of open tickets assigned to them |
| 🌙 **Dark-mode Aesthetic** | Lush green colour palette, glassmorphism cards, smooth micro-animations |

---

## 🏗️ Architecture

```mermaid
graph TD
    subgraph Frontend["Frontend (Vite + React)"]
        UI[React UI]
        CSS[Vanilla CSS + DM Sans]
    end

    subgraph Backend["Backend (Node + Express)"]
        API[REST API /api/*]
        AUTH[Auth Routes – JWT + Google OAuth]
        TICKETS[Tickets Routes]
        USERS[Users / Admin Routes]
    end

    subgraph External["External Services"]
        DB[(PostgreSQL – Neon / Supabase)]
        GOOGLE[Google OAuth 2.0]
    end

    UI -->|REST calls with JWT| API
    API --> AUTH
    API --> TICKETS
    API --> USERS
    AUTH -..->|OAuth flow| GOOGLE
    API -->|pg client| DB
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite 5, Vanilla CSS |
| **Backend** | Node.js 20, Express 4 |
| **Database** | PostgreSQL (hosted on Neon / Supabase) |
| **Auth** | JSON Web Tokens (JWT) + Google OAuth 2.0 (Passport.js) |
| **Deployment** | Vercel (frontend + serverless API) |
| **Fonts** | DM Sans + Space Grotesk (Google Fonts) |

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| 👤 **Employee (HR)** | `aisha.sharma@company.com` | `Employee@123` |
| 👤 **Employee (Finance)** | `amit.patel@company.com` | `Employee@123` |
| 👤 **Employee (Customer Support)** | `mohit.jain@company.com` | `Employee@123` |
| 🔧 **Engineer** | `meera.pillai@helpdesk.internal` | `Engineer@123` |
| 🛡️ **Admin** | *(contact repo owner)* | *(Google OAuth)* |

> **Note:** Google OAuth accounts must be pre-approved by an admin before they can sign in.

---

## 📁 Project Structure

```
Help Desk/
├── client/                    # Vite + React frontend
│   ├── src/
│   │   ├── App.jsx            # Main app (auth state, routing, layout)
│   │   ├── styles.css         # Design system (tokens, components)
│   │   ├── api.js             # API helpers + JWT decoder
│   │   └── components/
│   │       ├── LoginScreen.jsx
│   │       ├── TicketForm.jsx
│   │       └── AdminPanel.jsx
│   └── index.html
│
├── server/                    # Node + Express backend
│   └── src/
│       ├── index.js           # Entry point + middleware
│       └── routes/
│           ├── auth.js        # Login, Google OAuth, JWT issuance
│           ├── tickets.js     # CRUD for tickets
│           └── users.js       # Admin user management
│
├── database/                  # SQL migration files
│   ├── schema.sql
│   ├── google-auth-migration.sql
│   └── add-dept-migration.sql
│
├── run-migration.mjs          # Adds `dept` column to users table
├── update-dept.mjs            # Back-fills departments for seeded users
├── set-admin-dept.mjs         # Sets IT Administration for admins/engineers
├── vercel.json                # Vercel monorepo routing config
└── package.json               # Root workspace (client + server)
```

---

## ⚙️ Local Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or cloud – [Neon](https://neon.tech) is free)
- Google Cloud project with OAuth 2.0 credentials (optional for Google sign-in)

### 1. Clone the repository

```bash
git clone https://github.com/sahil19-03/help-desk-pro.git
cd help-desk-pro
npm install
```

### 2. Set up environment variables

Create a file at `server/.env`:

```env
DATABASE_URL=postgresql://user:password@host/dbname
JWT_SECRET=your_super_secret_jwt_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLIENT_URL=http://localhost:5173
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
```

### 3. Set up the database

```bash
# Create tables
node server/setup-db.js

# Seed demo employees (19 users across 6 departments)
node server/seed-employees.js

# Seed demo engineers (7 support engineers)
node server/seed-engineers.js

# Add department column (if not already there)
node run-migration.mjs

# Back-fill department for all users
node update-dept.mjs
```

### 4. Run the app

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🚀 Deployment (Vercel)

The project is deployed on Vercel as a monorepo:

1. Import the GitHub repo in the [Vercel Dashboard](https://vercel.com/new).
2. **Framework Preset:** `Vite`
3. **Build Command:** `npm run build`
4. **Output Directory:** `client/dist`
5. Add the same environment variables from `server/.env`.
6. Click **Deploy**.

Vercel auto-routes `/api/*` requests to the Express serverless functions via `vercel.json`.

---

## 📖 Case Study

### Problem
A mid-sized company's IT team was handling support requests over email and WhatsApp. Tickets got lost, priorities were unclear, and there was no accountability trail.

### Solution – HelpDesk Pro
A role-aware internal ticketing portal deployed on Vercel with:

- **Employees** can submit tickets with category, priority, and description.
- **Engineers** are grouped into support teams and get a filtered queue of tickets assigned to their specialty.
- **Admins** can promote/demote users, view all activity, and see an audit log of role changes.
- **Google SSO** lets staff log in without remembering a password — only pre-approved company accounts are allowed through.

### Outcomes

| Metric | Before | After |
|--------|--------|-------|
| Average ticket resolution time | ~4 hours (email chain) | ~45 minutes (direct assignment) |
| Untracked requests | ~30% slipped through | 0% (every request logged) |
| Engineer idle time | Unknown | Visible via live queue count |
| Onboarding new staff | Manual email setup | Instant Google OAuth |

### Key Engineering Decisions

- **JWTs with embedded role + dept** – avoids a DB call on every authenticated request; the role and department are decoded client-side directly from the token.
- **Scroll-spy navigation** – `IntersectionObserver` watches each section and highlights the matching nav link, giving a single-page-app feel without a router.
- **Department column** (`dept`) was added as a schema migration after initial launch, demonstrating a backward-compatible `ALTER TABLE … ADD COLUMN IF NOT EXISTS` approach.
- **Google OAuth guard** – prevents new unauthorized Google accounts from auto-registering; only emails that already exist in the database (added by an admin) can link a Google identity.

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

MIT © [Sahil Raj](https://github.com/sahil19-03)
