# HelpDesk Pro

An internal IT help desk for a medium-sized company. Employees register technology incidents and service requests, while the platform routes each request to the best available support team.

## Current milestone

- Employee ticket registration
- Category and priority capture
- Automatic routing based on category and team availability
- Live support-team capacity indicators
- Ticket status and assignment visibility

The current API uses in-memory data so the workflow can be demonstrated quickly. PostgreSQL persistence, authentication, engineer actions, comments, SLA tracking, and reporting are the next milestones.

## PostgreSQL persistence

The API uses the in-memory workflow unless `DATABASE_URL` is configured. To enable ticket persistence:

```powershell
$env:DATABASE_URL = "postgresql://user:password@localhost:5432/helpdesk"
$env:JWT_SECRET = "replace-with-a-long-local-secret"
$env:GOOGLE_CLIENT_ID = "your-google-client-id"
$env:GOOGLE_CLIENT_SECRET = "your-google-client-secret"
$env:GOOGLE_CALLBACK_URL = "http://localhost:4000/api/auth/google/callback"
$env:CLIENT_URL = "http://localhost:5173"
psql $env:DATABASE_URL -f database/schema.sql
psql $env:DATABASE_URL -f database/seed.sql
psql $env:DATABASE_URL -f database/google-auth-migration.sql
psql $env:DATABASE_URL -f database/admin-role-audit-migration.sql
npm run dev:server
```

The demo seed user is for local development only. Its password is `development-only-password`. Set `JWT_SECRET` before using authentication:

```powershell
$env:JWT_SECRET = "replace-with-a-long-local-secret"
```

Use `POST /api/auth/register` or `POST /api/auth/login` with JSON fields `name`, `email`, and `password` as appropriate. The login screen also includes Google sign-in; configure Google OAuth credentials before using that button. In database mode, send the returned token as `Authorization: Bearer <token>` when listing or creating tickets. Employees see their own tickets; engineers and admins see the full queue.

To promote a specific account to admin:

```powershell
psql $env:DATABASE_URL -v admin_email="admin@company.com" -f database/promote-admin.sql
```

Then sign in again so the token is re-issued with the updated role.

Admins can manage roles through the API:

```http
PATCH /api/admin/users/:id/role
Authorization: Bearer <admin-token>
Content-Type: application/json

{
	"role": "engineer",
	"reason": "Moved to support operations"
}
```

## Start

```powershell
npm install
npm run dev
```

Open `http://localhost:5173` after both services start.

## Project structure

- `client/` — React user interface
- `server/` — Express API
- `database/` — PostgreSQL database schema

## Vercel Deployment

This project is configured as a monorepo (client + server) and can be deployed directly to Vercel as a single project. The frontend will be served as a static site, and the backend Express API will be deployed as Serverless Functions.

1. Create a new project in your Vercel Dashboard and import this repository.
2. Ensure the **Framework Preset** is set to `Vite`.
3. Set the **Root Directory** to the root of the repository (do not change it to `client` or `server`).
4. In the **Build and Output Settings**:
   - Build Command: `npm run build`
   - Output Directory: `client/dist`
   - Install Command: `npm install`
5. Add your database environment variables (e.g., `DATABASE_URL`, `JWT_SECRET`) in the Environment Variables section.
6. Click **Deploy**.

Vercel will build the React frontend and automatically route any requests starting with `/api/` to your Express backend (thanks to the `vercel.json` and code configuration).

## Product problem

HelpDesk Pro replaces scattered IT requests from email, chat, and informal conversations with a trackable workflow. It gives employees visibility into their request and gives IT managers a clear view of team capacity and unresolved work.
