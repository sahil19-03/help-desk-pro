/**
 * api.js — All server communication for the frontend.
 *
 * HOW IT WORKS:
 *   1. The base URL points to the API server (port 4000 by default).
 *   2. Every request automatically attaches the user's auth token from localStorage.
 *   3. The token is a JWT — decodeToken() reads the user's id and role out of it.
 *
 * USAGE:
 *   import { apiFetch, getStoredUser } from './api.js';
 *   const res = await apiFetch('/tickets');        // GET with auth header
 *   const res = await apiFetch('/tickets', { method: 'POST', body: ... });
 */

// The server URL. Override with VITE_API_URL in .env if deploying elsewhere.
export const API = import.meta.env.VITE_API_URL?.trim() || 'http://localhost:4000/api';

// ── Token helpers ─────────────────────────────────────────────────────────────

/** Reads the user's JWT from localStorage and decodes it into { sub, role }. */
export function getStoredUser() {
  const token = localStorage.getItem('helpdesk-token');
  if (!token) return null;
  try {
    // JWT payload is the middle section, base64-encoded
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null; // Token is corrupt — treat as logged out
  }
}

/** Decodes a raw JWT string (used after login/OAuth before storing it). */
export function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

// ── Fetch wrapper ─────────────────────────────────────────────────────────────

/**
 * apiFetch(path, options)
 *
 * A thin wrapper around fetch() that:
 *   - Prepends the API base URL
 *   - Adds the Authorization: Bearer <token> header automatically
 *
 * Returns the raw Response — call .json() on it yourself.
 */
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('helpdesk-token');
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  return fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...authHeader,
      ...options.headers, // caller headers override auth if needed
    },
  });
}
