// Authentication middleware used by every protected route.
// authenticate: verifies the JWT from the Authorization header.
// requireRole:  creates a role-guard middleware accepting one or more allowed roles.

import jwt from 'jsonwebtoken';
import { databaseEnabled } from '../db.js';

const jwtSecret = process.env.JWT_SECRET;
const allowedRoles = new Set(['employee', 'engineer', 'admin']);

/**
 * Verifies the Bearer token and attaches `req.user = { sub, role }`.
 * Skips verification in demo mode (no DATABASE_URL).
 */
export function authenticate(req, res, next) {
  if (!databaseEnabled) return next();
  if (!jwtSecret) return res.status(503).json({ message: 'Authentication requires database configuration.' });

  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;

  if (!token) return res.status(401).json({ message: 'Authentication required.' });

  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

/**
 * Returns middleware that allows only the specified roles.
 * Usage: requireRole('engineer', 'admin')
 */
export function requireRole(...roles) {
  const roleSet = new Set(roles);
  return (req, res, next) => {
    if (!databaseEnabled) return next();
    if (!req.user?.role || !allowedRoles.has(req.user.role)) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    if (!roleSet.has(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions.' });
    }
    next();
  };
}

export const requireAdmin = requireRole('admin');
