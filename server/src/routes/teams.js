// Support-teams route: returns team definitions + live open-ticket counts.
// Mounted at /api/support-teams by index.js.

import express from 'express';
import { pool, databaseEnabled } from '../db.js';
import { supportTeams } from '../data.js';

export const teamsRouter = express.Router();

teamsRouter.get('/', async (_, res) => {
  if (!databaseEnabled) return res.json(supportTeams);

  try {
    // Count active (non-resolved, non-closed) tickets per category
    const { rows: ticketCounts } = await pool.query(`
      SELECT category, COUNT(*) AS count
      FROM tickets
      WHERE status NOT IN ('resolved', 'closed')
      GROUP BY category
    `);

    const countMap = Object.fromEntries(ticketCounts.map(r => [r.category, Number(r.count)]));

    const teamsWithCounts = supportTeams.map(team => ({
      ...team,
      openTickets: team.categories.reduce((sum, cat) => sum + (countMap[cat] ?? 0), 0),
    }));

    res.json(teamsWithCounts);
  } catch {
    // Fallback to static data if DB query fails
    res.json(supportTeams);
  }
});
