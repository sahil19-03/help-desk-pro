// Ticket routes: list, create, update status, assign.
// Mounted at /api/tickets by index.js.

import express from 'express';
import { randomUUID } from 'node:crypto';
import { pool, databaseEnabled } from '../db.js';
import { supportTeams, tickets, setTickets } from '../data.js';
import { authenticate, requireRole, requireAdmin } from '../middleware/auth.js';

export const ticketsRouter = express.Router();

// Status transition map — each status can only move forward one step.
const validTransitions = {
  open:        'assigned',
  assigned:    'in_progress',
  in_progress: 'resolved',
  resolved:    'closed',
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatTicketRow(ticket) {
  return {
    ...ticket,
    supportTeam: 'Assigned support',
    assignee: ticket.assignee ?? 'Awaiting assignment',
  };
}

// ─── GET /api/tickets ────────────────────────────────────────────────────────
// Employees   → their own tickets only
// Engineers   → tickets in their team's categories + directly assigned to them
// Admins      → all tickets

ticketsRouter.get('/', authenticate, requireRole('employee', 'engineer', 'admin'), async (req, res) => {
  if (!databaseEnabled) return res.json(tickets);

  try {
    let filter = '';
    let values = [];

    if (req.user.role === 'employee') {
      filter = 'WHERE t.requester_id = $1';
      values = [req.user.sub];
    } else if (req.user.role === 'engineer') {
      const { rows: userRows } = await pool.query(
        'SELECT team_id FROM users WHERE id = $1',
        [req.user.sub]
      );
      const teamId = userRows[0]?.team_id;
      const team   = supportTeams.find(t => t.id === teamId);

      if (team) {
        const placeholders = team.categories.map((_, i) => `$${i + 2}`).join(', ');
        filter = `WHERE (t.category IN (${placeholders}) OR t.assignee_id = $1)`;
        values = [req.user.sub, ...team.categories];
      } else {
        // No team assigned — only show directly assigned tickets
        filter = 'WHERE t.assignee_id = $1';
        values = [req.user.sub];
      }
    }
    // Admin: no filter

    const { rows } = await pool.query(`
      SELECT
        t.ticket_number  AS id,
        t.id             AS uuid,
        t.title,
        t.description,
        t.category,
        INITCAP(t.priority::text)                       AS priority,
        INITCAP(REPLACE(t.status::text, '_', ' '))      AS status,
        t.created_at                                    AS "createdAt",
        assignee_user.name                              AS assignee,
        requester_user.name                             AS requester
      FROM tickets t
      LEFT JOIN users assignee_user  ON assignee_user.id  = t.assignee_id
      LEFT JOIN users requester_user ON requester_user.id = t.requester_id
      ${filter}
      ORDER BY t.created_at DESC
    `, values);

    res.json(rows.map(formatTicketRow));
  } catch (err) {
    console.error('Ticket query failed:', err.message);
    res.status(503).json({ message: 'Ticket service is unavailable.' });
  }
});

// ─── POST /api/tickets ───────────────────────────────────────────────────────
// Any authenticated user can raise a ticket.

ticketsRouter.post('/', authenticate, async (req, res) => {
  const { title, description, category, priority } = req.body;
  if (!title?.trim() || !description?.trim() || !category || !priority) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Auto-route: find the first team that handles the category and has capacity
  const team =
    supportTeams.find(t => t.categories.includes(category) && t.available > 0) ??
    supportTeams.find(t => t.available > 0);

  const newTicket = {
    id: `HD-${1000 + tickets.length + 1}`,
    title: title.trim(),
    description: description.trim(),
    category,
    priority,
    status: team ? 'Assigned' : 'Open',
    supportTeam: team?.name ?? 'Unassigned queue',
    assignee: team ? 'Team triage' : 'Awaiting availability',
    responseTime: team?.responseTime ?? 'To be confirmed',
    createdAt: new Intl.DateTimeFormat('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    }).format(new Date()),
  };

  if (databaseEnabled) {
    try {
      const ticketNumber = `HD-${Date.now().toString().slice(-8)}`;
      const { rows } = await pool.query(`
        INSERT INTO tickets
          (id, ticket_number, title, description, category, priority, status, requester_id)
        VALUES ($1, $2, $3, $4, $5, $6::ticket_priority, $7::ticket_status, $8)
        RETURNING
          ticket_number AS id,
          id            AS uuid,
          title, description, category,
          INITCAP(priority::text)                       AS priority,
          INITCAP(REPLACE(status::text, '_', ' '))      AS status,
          created_at                                    AS "createdAt"
      `, [
        randomUUID(), ticketNumber,
        newTicket.title, newTicket.description, category,
        priority.toLowerCase(),
        newTicket.status.toLowerCase().replace(' ', '_'),
        req.user.sub,
      ]);
      return res.status(201).json({
        ...rows[0],
        supportTeam:  team?.name ?? 'Unassigned queue',
        assignee:     team ? 'Team triage' : 'Awaiting availability',
        responseTime: team?.responseTime ?? 'To be confirmed',
      });
    } catch (err) {
      console.error('Ticket creation failed:', err.message);
      return res.status(503).json({ message: 'Ticket service is unavailable.' });
    }
  }

  setTickets([newTicket, ...tickets]);
  res.status(201).json(newTicket);
});

// ─── PATCH /api/tickets/:id/status ───────────────────────────────────────────
// Engineers and admins advance a ticket through its lifecycle.

ticketsRouter.patch('/:id/status', authenticate, requireRole('engineer', 'admin'), async (req, res) => {
  if (!databaseEnabled) return res.status(503).json({ message: 'Ticket actions require database configuration.' });

  const ticketUuid    = req.params.id;
  const requestedStatus = req.body.status?.trim().toLowerCase().replace(' ', '_');

  if (!requestedStatus) return res.status(400).json({ message: 'Status is required.' });

  try {
    const { rows: existing } = await pool.query(
      'SELECT id, status, assignee_id FROM tickets WHERE id = $1',
      [ticketUuid]
    );
    if (!existing.length) return res.status(404).json({ message: 'Ticket not found.' });

    const ticket      = existing[0];
    const expectedNext = validTransitions[ticket.status];

    if (requestedStatus !== expectedNext) {
      return res.status(400).json({
        message: `Cannot transition from '${ticket.status}' to '${requestedStatus}'. Expected '${expectedNext}'.`,
      });
    }

    // Self-assign when accepting or starting
    const shouldAssign = ['assigned', 'in_progress'].includes(requestedStatus);
    const assigneeId   = shouldAssign ? req.user.sub : ticket.assignee_id;

    const { rows: updated } = await pool.query(`
      UPDATE tickets
      SET status = $2::ticket_status, assignee_id = $3, updated_at = NOW()
      WHERE id = $1
      RETURNING
        ticket_number AS id,
        id            AS uuid,
        title, description, category,
        INITCAP(priority::text)                       AS priority,
        INITCAP(REPLACE(status::text, '_', ' '))      AS status,
        created_at                                    AS "createdAt"
    `, [ticketUuid, requestedStatus, assigneeId]);

    let assigneeName = null;
    if (shouldAssign) {
      const { rows: u } = await pool.query('SELECT name FROM users WHERE id = $1', [req.user.sub]);
      assigneeName = u[0]?.name;
    }

    res.json(formatTicketRow({ ...updated[0], assignee: assigneeName }));
  } catch (err) {
    if (err.code === '22P02') return res.status(400).json({ message: 'Invalid ticket id format.' });
    console.error('Ticket status update failed:', err.message);
    res.status(503).json({ message: 'Ticket service is unavailable.' });
  }
});

// ─── PATCH /api/tickets/:id/assign ───────────────────────────────────────────
// Admins can assign any ticket to a specific engineer.

ticketsRouter.patch('/:id/assign', authenticate, requireAdmin, async (req, res) => {
  if (!databaseEnabled) return res.status(503).json({ message: 'Assignment requires database configuration.' });

  const ticketUuid = req.params.id;
  const assigneeId = req.body.assigneeId ?? null;

  try {
    const { rows } = await pool.query(`
      UPDATE tickets
      SET assignee_id = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING
        ticket_number AS id,
        id            AS uuid,
        title,
        INITCAP(priority::text)                       AS priority,
        INITCAP(REPLACE(status::text, '_', ' '))      AS status,
        created_at                                    AS "createdAt"
    `, [ticketUuid, assigneeId]);

    if (!rows.length) return res.status(404).json({ message: 'Ticket not found.' });

    let assigneeName = null;
    if (assigneeId) {
      const { rows: u } = await pool.query('SELECT name FROM users WHERE id = $1', [assigneeId]);
      assigneeName = u[0]?.name;
    }

    res.json(formatTicketRow({ ...rows[0], assignee: assigneeName }));
  } catch (err) {
    if (err.code === '22P02') return res.status(400).json({ message: 'Invalid id format.' });
    console.error('Ticket assign failed:', err.message);
    res.status(503).json({ message: 'Ticket service is unavailable.' });
  }
});
