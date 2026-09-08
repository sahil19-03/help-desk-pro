---
marp: true
theme: default
paginate: true
backgroundColor: #f3f5f1
color: #17221d
style: |
  section {
    font-family: 'Segoe UI', Arial, sans-serif;
    padding: 40px 60px;
  }
  h1 { color: #173f32; font-size: 2.2em; border-bottom: 3px solid #d9f17c; padding-bottom: 12px; }
  h2 { color: #28634e; font-size: 1.6em; }
  h3 { color: #4d9460; }
  a  { color: #28634e; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85em; }
  th { background: #173f32; color: #d9f17c; padding: 8px 12px; }
  td { padding: 7px 12px; border-bottom: 1px solid #dfe6df; }
  tr:nth-child(even) td { background: #eef4ee; }
  code { background: #e8f0e8; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; }
  pre  { background: #173f32; color: #d9f17c; padding: 18px; border-radius: 8px; font-size: 0.78em; }
  .badge { display: inline-block; background: #d9f17c; color: #173f32; border-radius: 20px; padding: 4px 14px; font-weight: 700; font-size: 0.85em; margin: 4px; }
  section.cover { background: #173f32; color: #f5f9e9; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
  section.cover h1 { color: #d9f17c; border-bottom: 3px solid #4d9460; font-size: 3em; }
  section.cover p { color: #a7c6b8; font-size: 1.1em; }
  section.cover a { color: #d9f17c; }
---

<!-- _class: cover -->

# 🖥️ HelpDesk Pro

**Internal IT Ticketing Platform**

An end-to-end support desk — employees raise tickets, engineers resolve them, admins manage everything.

🔗 [help-desk-pro-01.vercel.app](https://help-desk-pro-01.vercel.app/) &nbsp;|&nbsp; 📦 [github.com/sahil19-03/help-desk-pro](https://github.com/sahil19-03/help-desk-pro)

---

## 📌 The Problem

> *"Our IT team was handling support requests over email and WhatsApp. Tickets got lost, priorities were unclear, and there was no accountability trail."*

| Issue | Impact |
|-------|--------|
| ❌ No centralised tracking | ~30% of requests slipped through |
| ❌ No priority system | Critical issues treated same as minor ones |
| ❌ No assignment workflow | Engineers didn't know what to work on |
| ❌ No audit trail | No way to measure performance or SLA |

---

## 💡 The Solution

**HelpDesk Pro** — a role-aware internal portal deployed on Vercel

- 👤 **Employees** submit tickets with category, priority & description
- 🔧 **Engineers** get a filtered live queue of tickets for their team
- 🛡️ **Admins** manage users, promote roles, and view audit logs
- 🔑 **Google SSO** — sign in with company Google account (pre-approved only)

---

## ✨ Key Features

| Feature | Detail |
|---------|--------|
| 🔐 Auth | Email/password **+** Google OAuth 2.0 |
| 🎫 Tickets | Create, assign, track & resolve |
| 👥 Roles | `employee` · `engineer` · `admin` |
| 🏢 Department | Each user sees their own dept in profile |
| 📊 Live Queue | Engineers see real-time open ticket count |
| 🔍 Scroll-spy | Nav tabs highlight as you scroll |
| 🛡️ Admin Panel | Role promotion, audit history |
| 🌙 UI | Dark-green aesthetic, glassmorphism cards |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    VERCEL (deployed)                     │
│                                                          │
│   ┌─────────────────┐      ┌──────────────────────┐     │
│   │  React Frontend │ ───► │  Express API /api/*  │     │
│   │  (Vite, CSS)    │ JWT  │  (Serverless Fns)    │     │
│   └─────────────────┘      └─────────┬────────────┘     │
│                                       │                  │
│                          ┌────────────▼────────────┐     │
│                          │  PostgreSQL (Neon cloud)│     │
│                          │  users · tickets · audit│     │
│                          └─────────────────────────┘     │
└──────────────────────────────────────────────────────────┘
                   │ OAuth 2.0
        ┌──────────▼──────────┐
        │   Google Auth API   │
        └─────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 · Vite 5 · Vanilla CSS |
| **Backend** | Node.js 20 · Express 4 |
| **Database** | PostgreSQL (Neon — free tier) |
| **Auth** | JWT · Google OAuth 2.0 (Passport.js) |
| **Deployment** | Vercel (monorepo: client + API) |
| **Typography** | DM Sans + Space Grotesk (Google Fonts) |

---

## 📁 Project Structure

```
help-desk-pro/
├── client/              ← React + Vite frontend
│   └── src/
│       ├── App.jsx      ← Auth state, layout, scroll-spy
│       ├── styles.css   ← Design system
│       └── components/  ← LoginScreen, TicketForm, AdminPanel
│
├── server/              ← Node + Express backend
│   └── src/routes/
│       ├── auth.js      ← JWT + Google OAuth
│       ├── tickets.js   ← Ticket CRUD
│       └── users.js     ← Admin management
│
├── database/            ← SQL migrations
├── vercel.json          ← Monorepo routing
└── package.json         ← Root workspace
```

---

## 🔑 Demo Credentials

Try the live app at **[help-desk-pro-01.vercel.app](https://help-desk-pro-01.vercel.app/)**

| Role | Email | Password |
|------|-------|----------|
| 👤 Employee (HR) | `aisha.sharma@company.com` | `Employee@123` |
| 👤 Employee (Finance) | `amit.patel@company.com` | `Employee@123` |
| 👤 Employee (Support) | `mohit.jain@company.com` | `Employee@123` |
| 🔧 Engineer | `meera.pillai@helpdesk.internal` | `Engineer@123` |

---

## 📖 Case Study — Results

| Metric | Before | After |
|--------|--------|-------|
| Avg. resolution time | ~4 hrs (email chains) | ~45 mins (direct assign) |
| Untracked requests | ~30% slipped through | **0%** — every request logged |
| Engineer idle time | Unknown | Visible via live queue |
| Staff onboarding | Manual email setup | Instant Google SSO |

---

## 🔬 Engineering Highlights

**JWTs with embedded role + dept**
→ No DB call on every request; role/dept decoded client-side

**Scroll-spy navigation**
→ `IntersectionObserver` watches sections, highlights active nav tab

**Backward-compatible DB migration**
→ `ALTER TABLE … ADD COLUMN IF NOT EXISTS dept` — zero downtime

**Google OAuth guard**
→ Only pre-approved emails in the DB can link a Google identity; blocks unauthorized auto-registration

---

<!-- _class: cover -->

## 🚀 Live & Open Source

### 🔗 Live App
**[help-desk-pro-01.vercel.app](https://help-desk-pro-01.vercel.app/)**

### 📦 Source Code
**[github.com/sahil19-03/help-desk-pro](https://github.com/sahil19-03/help-desk-pro)**

---

*Built with React · Node.js · PostgreSQL · Vercel*
