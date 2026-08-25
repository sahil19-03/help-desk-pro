/**
 * auth.js — Sign-in and Google OAuth routes.
 * Mounted at /api/auth by index.js.
 *
 * ROUTES:
 *   GET  /api/auth/google           → Redirects to Google login page
 *   GET  /api/auth/google/callback  → Google calls this after the user signs in
 *   POST /api/auth/login            → Email + password sign-in
 *
 * NOTE: There is no public /register endpoint.
 *       New accounts are created by admins via POST /api/admin/users.
 */

import express  from 'express';
import bcrypt   from 'bcryptjs';
import jwt      from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { pool, databaseEnabled } from '../db.js';

export const authRouter = express.Router();

// Read config from environment variables
const jwtSecret   = process.env.JWT_SECRET;
const googleId    = process.env.GOOGLE_CLIENT_ID;
const googleSecret = process.env.GOOGLE_CLIENT_SECRET;
const callbackUrl  = process.env.GOOGLE_CALLBACK_URL
  ?? `http://localhost:${process.env.PORT ?? 4000}/api/auth/google/callback`;
const clientUrl   = process.env.CLIENT_URL ?? 'http://localhost:5173';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Creates a signed JWT containing the user's id and role. Expires in 8 hours. */
function issueToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, jwtSecret, { expiresIn: '8h' });
}

/** Sends the user back to the frontend with an error message in the URL. */
function redirectWithError(res, message) {
  res.redirect(`${clientUrl}/?${new URLSearchParams({ auth_error: message })}`);
}

// ── Debug endpoint (development only) ────────────────────────────────────────

authRouter.get('/google/debug-config', (_, res) => {
  if (process.env.NODE_ENV === 'production') return res.status(404).end();
  res.json({
    googleConfigured:  Boolean(googleId && googleSecret),
    jwtConfigured:     Boolean(jwtSecret),
    databaseEnabled,
    callbackUrl,
    clientUrl,
  });
});

// ── Google OAuth ──────────────────────────────────────────────────────────────

/**
 * Step 1: Redirect the user to Google's sign-in page.
 */
authRouter.get('/google', (_, res) => {
  if (!googleId || !googleSecret || !jwtSecret) {
    return res.status(503).json({ message: 'Google sign-in is not configured on this server.' });
  }
  const params = new URLSearchParams({
    client_id:     googleId,
    redirect_uri:  callbackUrl,
    response_type: 'code',
    scope:         'openid email profile',
    access_type:   'offline',
    prompt:        'select_account',
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

/**
 * Step 2: Google redirects here after the user signs in.
 *         We exchange the code for a token, fetch the user's profile,
 *         create/update their account, then send them back to the app.
 */
authRouter.get('/google/callback', async (req, res) => {
  if (!databaseEnabled || !googleId || !googleSecret || !jwtSecret) {
    return res.status(503).json({ message: 'Google sign-in is not configured.' });
  }

  // Google can send an error (e.g. user cancelled)
  if (req.query.error) {
    return redirectWithError(res, `Google sign-in cancelled: ${req.query.error_description ?? req.query.error}`);
  }
  if (!req.query.code) {
    return redirectWithError(res, 'Missing authorization code. Try signing in again.');
  }

  try {
    // Exchange the one-time code for an access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    new URLSearchParams({
        code:          String(req.query.code),
        client_id:     googleId,
        client_secret: googleSecret,
        redirect_uri:  callbackUrl,
        grant_type:    'authorization_code',
      }),
    });
    if (!tokenRes.ok) {
      console.error('Google token exchange failed:', await tokenRes.text());
      return redirectWithError(res, 'Google authorization failed. Check OAuth credentials.');
    }
    const { access_token } = await tokenRes.json();

    // Use the access token to fetch the user's Google profile
    const profileRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!profileRes.ok) return redirectWithError(res, 'Unable to read Google profile.');
    const profile = await profileRes.json();
    if (!profile.email || !profile.sub) {
      return redirectWithError(res, 'Google profile is missing required fields.');
    }

    // Insert the user if new, or update name/email if they already exist
    const dummyHash = await bcrypt.hash(randomUUID(), 12); // Google users don't use a password
    const { rows } = await pool.query(`
      INSERT INTO users (id, name, email, password_hash, google_id)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (google_id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email
      RETURNING id, name, email, role
    `, [randomUUID(), profile.name, profile.email.toLowerCase(), dummyHash, profile.sub]);

    // Send the user back to the app with their token in the URL
    res.redirect(`${clientUrl}/?auth_token=${encodeURIComponent(issueToken(rows[0]))}`);
  } catch (err) {
    console.error('Google sign-in error:', err.message);
    redirectWithError(res, 'Google sign-in is temporarily unavailable.');
  }
});

// ── Email / password sign-in ──────────────────────────────────────────────────

/**
 * POST /api/auth/login
 * Body: { email, password }
 *
 * Returns a JWT token on success.
 * Note: Account creation is done by admins, not here.
 */
authRouter.post('/login', async (req, res) => {
  const email    = req.body.email?.trim().toLowerCase();
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  if (!databaseEnabled || !jwtSecret) {
    return res.status(503).json({ message: 'Authentication requires database configuration.' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, role, password_hash FROM users WHERE email = $1',
      [email]
    );
    const user = rows[0];

    // Don't reveal whether the email exists — just say "invalid credentials"
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Strip the password hash before sending the user object back
    const { password_hash: _, ...publicUser } = user;
    res.json({ token: issueToken(user), user: publicUser });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(503).json({ message: 'Authentication service is temporarily unavailable.' });
  }
});
