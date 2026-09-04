// Entry point: loads env, sets up Express, mounts all route modules, starts the server.
// Business logic lives in routes/ and middleware/ — keep this file thin.

import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { pool, databaseEnabled } from './db.js';
import { authRouter }    from './routes/auth.js';
import { ticketsRouter } from './routes/tickets.js';
import { teamsRouter }   from './routes/teams.js';
import { adminRouter }   from './routes/admin.js';

const app  = express();
const port = Number(process.env.PORT ?? 4000);

// ─── CORS ────────────────────────────────────────────────────────────────────
// Development: allow all origins so local dev works without configuration.
// Production:  restrict to the CLIENT_URL env var only (e.g. your Vercel domain).
//              Any other origin will receive a CORS error — this prevents
//              third-party sites from calling the API with a user's credentials.
const isProduction = process.env.NODE_ENV === 'production';
const clientUrl    = process.env.CLIENT_URL?.trim();

app.use(cors(isProduction
  ? {
      origin(origin, callback) {
        // Allow requests with no Origin header (e.g. server-to-server, curl)
        // and requests from the whitelisted client URL.
        if (!origin || origin === clientUrl) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: origin '${origin}' is not allowed.`));
        }
      },
      methods:             ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders:      ['Content-Type', 'Authorization'],
      exposedHeaders:      ['Authorization'],
      credentials:         true,
      optionsSuccessStatus: 204,
    }
  : {} // development — allow all origins
));

app.use(express.json());

// ─── Health checks ────────────────────────────────────────────────────────────
app.get('/',           (_, res) => res.json({ name: 'Help Desk API', status: 'ok' }));
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));
app.get('/api/db-health', async (_, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected', databaseEnabled });
  } catch (err) {
    console.error('DB health check failed:', err.message);
    res.status(503).json({ status: 'error', database: 'unavailable' });
  }
});

// ─── Route modules ────────────────────────────────────────────────────────────
app.use('/api/auth',          authRouter);
app.use('/api/tickets',       ticketsRouter);
app.use('/api/support-teams', teamsRouter);
app.use('/api/admin',         adminRouter);

// ─── Start ────────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Help Desk API running at http://localhost:${port}`);
    console.log(`Database: ${databaseEnabled ? 'PostgreSQL' : 'in-memory demo mode'}`);
  });
}

export default app;
