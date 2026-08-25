/**
 * admin.js — Admin-only routes for managing users and teams.
 * Mounted at /api/admin by index.js.
 *
 * All routes here require the user to be signed in AND have role = 'admin'.
 * This is enforced once at the top of the file with adminRouter.use(...).
 *
 * ROUTES:
 *   GET   /api/admin/users           → List all users
 *   POST  /api/admin/users           → Create a new user (employee / engineer / admin)
 *   GET   /api/admin/teams           → Team roster with engineer workload counts
 *   PATCH /api/admin/users/:id/role  → Change a user's role (logged to audit table)
 */

import express from 'express';
import bcrypt  from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { pool, databaseEnabled } from '../db.js';
import { supportTeams } from '../data.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

export const adminRouter = express.Router();

// Every route in this file requires: valid token + admin role
adminRouter.use(authenticate, requireAdmin);

const VALID_ROLES = new Set(['employee', 'engineer', 'admin']);

// ── GET /api/admin/users ──────────────────────────────────────────────────────
// Returns all users in the system ordered by creation date.

adminRouter.get('/users', async (_, res) => {
  if (!databaseEnabled) return res.status(503).json({ message: 'Admin features require a database.' });
  try {
    const { rows } = await pool.query(`
      SELECT id, name, email, role,
             team_id        AS "teamId",
             created_at     AS "createdAt"
      FROM users
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Failed to list users:', err.message);
    res.status(503).json({ message: 'Admin service is unavailable.' });
  }
});

// ── POST /api/admin/users ─────────────────────────────────────────────────────
// Admin creates a new account. This is the only way to add users — there is no
// public self-registration.
// Body: { name, email, password, role? }  (role defaults to 'employee')

adminRouter.post('/users', async (req, res) => {
  if (!databaseEnabled) return res.status(503).json({ message: 'Admin features require a database.' });

  const name     = req.body.name?.trim();
  const email    = req.body.email?.trim().toLowerCase();
  const password = req.body.password;
  const role     = req.body.role?.trim().toLowerCase() ?? 'employee';

  // Validate inputs
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }
  if (!VALID_ROLES.has(role)) {
    return res.status(400).json({ message: 'Role must be: employee, engineer, or admin.' });
  }

  try {
    const hash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(`
      INSERT INTO users (id, name, email, password_hash, role)
      VALUES ($1, $2, $3, $4, $5::user_role)
      RETURNING id, name, email, role, created_at AS "createdAt"
    `, [randomUUID(), name, email, hash, role]);
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'An account with that email already exists.' });
    }
    console.error('Failed to create user:', err.message);
    res.status(503).json({ message: 'Admin service is unavailable.' });
  }
});

// ── GET /api/admin/teams ──────────────────────────────────────────────────────
// Returns each support team with its engineers and their current workload.
// openTickets  = tickets not yet resolved/closed
// resolvedTickets = tickets that are resolved or closed

adminRouter.get('/teams', async (_, res) => {
  if (!databaseEnabled) return res.status(503).json({ message: 'Admin features require a database.' });
  try {
    const { rows: engineers } = await pool.query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.team_id AS "teamId",
        COUNT(t.id) FILTER (WHERE t.status NOT IN ('resolved','closed')) AS "openTickets",
        COUNT(t.id) FILTER (WHERE t.status IN ('resolved','closed'))     AS "resolvedTickets"
      FROM users u
      LEFT JOIN tickets t ON t.assignee_id = u.id
      WHERE u.role IN ('engineer','admin') AND u.team_id IS NOT NULL
      GROUP BY u.id
      ORDER BY u.team_id, u.name
    `);

    // Build a map of teamId → team, then slot each engineer into their team
    const teamMap = Object.fromEntries(
      supportTeams.map(team => [team.id, { ...team, engineers: [] }])
    );
    for (const eng of engineers) {
      if (teamMap[eng.teamId]) teamMap[eng.teamId].engineers.push(eng);
    }

    res.json(Object.values(teamMap));
  } catch (err) {
    console.error('Failed to load team roster:', err.message);
    res.status(503).json({ message: 'Admin service is unavailable.' });
  }
});

// ── PATCH /api/admin/users/:id/role ──────────────────────────────────────────
// Changes a user's role. Every change is recorded in the admin_role_audit table.
// Body: { role, reason? }

adminRouter.patch('/users/:id/role', async (req, res) => {
  if (!databaseEnabled) return res.status(503).json({ message: 'Admin features require a database.' });

  const targetId      = req.params.id;
  const newRole       = req.body.role?.trim().toLowerCase();
  const changeReason  = typeof req.body.reason === 'string'
    ? req.body.reason.trim().slice(0, 200)
    : null;

  if (!newRole || !VALID_ROLES.has(newRole)) {
    return res.status(400).json({ message: 'Role must be: employee, engineer, or admin.' });
  }

  try {
    // Fetch the user we're changing
    const { rows: found } = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [targetId]
    );
    if (!found.length) return res.status(404).json({ message: 'User not found.' });

    const target = found[0];

    // Safety check: don't let an admin accidentally demote themselves
    if (target.id === req.user.sub && newRole !== 'admin') {
      return res.status(400).json({ message: 'You cannot remove your own admin access.' });
    }

    // Apply the role change
    const { rows: updated } = await pool.query(`
      UPDATE users SET role = $2::user_role WHERE id = $1
      RETURNING id, name, email, role
    `, [targetId, newRole]);

    const wasChanged = target.role !== updated[0].role;

    // Write to audit log if the role actually changed
    if (wasChanged) {
      await pool.query(`
        INSERT INTO admin_role_audit
          (id, actor_user_id, target_user_id, previous_role, new_role, reason)
        VALUES ($1, $2, $3, $4::user_role, $5::user_role, $6)
      `, [randomUUID(), req.user.sub, updated[0].id, target.role, updated[0].role, changeReason]);
    }

    res.json({ user: updated[0], auditLogged: wasChanged });
  } catch (err) {
    if (err.code === '22P02') return res.status(400).json({ message: 'Invalid user id.' });
    if (err.code === '42P01') return res.status(503).json({ message: 'Audit table missing. Run admin-role-audit-migration.sql.' });
    console.error('Role update failed:', err.message);
    res.status(503).json({ message: 'Admin service is unavailable.' });
  }
});
