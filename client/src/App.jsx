/**
 * App.jsx — Root component. This is where the app starts.
 *
 * STRUCTURE:
 *   App manages all the data and decides which screen to show.
 *   The actual UI pieces live in src/components/ as separate files.
 *
 * THREE TYPES OF USERS:
 *   employee  → can raise tickets and see their own tickets
 *   engineer  → sees all tickets in their team's category and can update status
 *   admin     → sees everything + can assign tickets + can add new accounts
 *
 * SCREENS:
 *   - Login page    (shown when not signed in)
 *   - Main dashboard (shown after sign in)
 *   - Admin panel   (tab only visible to admins)
 */

import React, { useEffect, useState } from 'react';
import { apiFetch, decodeToken, getStoredUser } from './api.js';

import LoginScreen  from './components/LoginScreen.jsx';
import TicketQueue  from './components/TicketQueue.jsx';
import SupportTeams from './components/SupportTeams.jsx';
import AdminPanel   from './components/AdminPanel.jsx';
import AssignModal  from './components/AssignModal.jsx';

// Default values for the new-ticket form
const EMPTY_TICKET_FORM = { title: '', description: '', category: 'Technical Issue', priority: 'Medium' };

export default function App() {

  // ── Server data ────────────────────────────────────────────────────────────
  const [tickets,    setTickets]    = useState([]);       // Tickets visible to this user
  const [teams,      setTeams]      = useState([]);       // Support team capacity info
  const [adminTeams, setAdminTeams] = useState([]);       // Teams with engineer roster (admin only)

  // ── Page state ─────────────────────────────────────────────────────────────
  const [ticketForm,   setTicketForm]  = useState(EMPTY_TICKET_FORM); // New ticket form fields
  const [statusMsg,    setStatusMsg]   = useState('');                 // Success / error banner
  const [loading,      setLoading]     = useState(true);               // True while first data load
  const [activeTab,    setActiveTab]   = useState('overview');         // Which nav tab is selected
  const [assignTarget, setAssignTarget] = useState(null);              // Ticket being assigned (opens modal)

  // ── Auth state ─────────────────────────────────────────────────────────────
  // Start on the login page if no token is stored
  const [needsLogin,  setNeedsLogin]  = useState(!getStoredUser());
  const [loginForm,   setLoginForm]   = useState({ email: '', password: '' });
  const [loginError,  setLoginError]  = useState('');
  const [currentUser, setCurrentUser] = useState(getStoredUser()); // { sub: userId, role }

  // Derived role flags — used throughout to show/hide features
  const isEngineer = currentUser?.role === 'engineer' || currentUser?.role === 'admin';
  const isAdmin    = currentUser?.role === 'admin';

  // ── Data loading ───────────────────────────────────────────────────────────

  /** Loads tickets and support team data from the server. */
  async function loadData() {
    try {
      const [ticketRes, teamRes] = await Promise.all([
        apiFetch('/tickets'),
        apiFetch('/support-teams'),
      ]);

      // 401 = token expired or invalid → send to login
      if (ticketRes.status === 401) { setNeedsLogin(true); setLoading(false); return; }

      setTickets(await ticketRes.json());
      setTeams(await teamRes.json());
      setStatusMsg('');
    } catch {
      setStatusMsg('Cannot reach the server. Make sure the API is running.');
    } finally {
      setLoading(false);
    }
  }

  /** Loads the engineer roster per team (only called when admin opens the Admin tab). */
  async function loadAdminTeams() {
    if (!isAdmin) return;
    try {
      const res = await apiFetch('/admin/teams');
      if (res.ok) setAdminTeams(await res.json());
    } catch { /* silent — admin panel will show empty state */ }
  }

  // Run on first render: handle Google OAuth redirect, then load data
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleToken = params.get('auth_token'); // Google sent us a token
    const googleError = params.get('auth_error'); // Google sent us an error

    if (googleToken) {
      // Store the token and mark user as logged in
      localStorage.setItem('helpdesk-token', googleToken);
      setCurrentUser(decodeToken(googleToken));
      setNeedsLogin(false);
      window.history.replaceState({}, '', window.location.pathname); // clean the URL
    } else if (googleError) {
      setNeedsLogin(true);
      setLoginError(googleError);
      window.history.replaceState({}, '', window.location.pathname);
    }

    loadData();
  }, []);

  // Load engineer roster whenever admin switches to the Admin tab
  useEffect(() => {
    if (activeTab === 'admin') loadAdminTeams();
  }, [activeTab]);

  // ── Auth actions ───────────────────────────────────────────────────────────

  /** Called when the login form is submitted. */
  async function handleLogin(event) {
    event.preventDefault();
    setLoginError('');
    try {
      const res    = await apiFetch('/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(loginForm),
      });
      const result = await res.json();

      if (!res.ok) {
        setLoginError(result.message ?? 'Unable to sign in. Check your email and password.');
        return;
      }

      // Save token and update state so dashboard appears
      localStorage.setItem('helpdesk-token', result.token);
      setCurrentUser(decodeToken(result.token));
      setNeedsLogin(false);
      setLoginForm({ email: '', password: '' });
      loadData();
    } catch {
      setLoginError('Cannot reach the server. Make sure the API is running.');
    }
  }

  /** Clears the token and returns the user to the login screen. */
  function handleLogout() {
    localStorage.removeItem('helpdesk-token');
    setCurrentUser(null);
    setTickets([]);
    setNeedsLogin(true);
  }

  // ── Ticket actions ─────────────────────────────────────────────────────────

  /** Called when an employee submits the new-ticket form. */
  async function handleSubmitTicket(event) {
    event.preventDefault();
    const res = await apiFetch('/tickets', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(ticketForm),
    });
    if (res.status === 401) return setNeedsLogin(true);
    if (!res.ok) return setStatusMsg('Could not create ticket. Please try again.');
    setTicketForm(EMPTY_TICKET_FORM);
    setStatusMsg('Ticket registered and routed to the best available team.');
    loadData();
  }

  /** Called by an engineer clicking Accept / Start / Resolve / Close on a ticket. */
  async function handleStatusUpdate(ticket, newStatus) {
    const res = await apiFetch(`/tickets/${ticket.uuid}/status`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status: newStatus }),
    });
    if (res.status === 401) return setNeedsLogin(true);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatusMsg(err.message ?? 'Could not update ticket status.');
      return;
    }
    const updated = await res.json();
    // Update just the changed ticket in the list (no full reload needed)
    setTickets(prev => prev.map(t => t.uuid === updated.uuid ? { ...t, ...updated } : t));
  }

  /** Called by an admin selecting an engineer in the Assign modal. */
  async function handleAssignTicket(ticket, engineerId) {
    const res = await apiFetch(`/tickets/${ticket.uuid}/assign`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ assigneeId: engineerId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatusMsg(err.message ?? 'Assignment failed.');
      return;
    }
    const updated = await res.json();
    setTickets(prev => prev.map(t => t.uuid === updated.uuid ? { ...t, ...updated } : t));
    setAssignTarget(null);  // Close modal
    loadAdminTeams();       // Refresh workload counts
  }

  /** Opens the Assign modal with all available engineers. */
  function openAssignModal(ticket) {
    const allEngineers = adminTeams.flatMap(t => t.engineers);
    setAssignTarget({ ticket, engineers: allEngineers });
    if (!adminTeams.length) loadAdminTeams(); // Load engineers if not fetched yet
  }

  // ── Render: Login screen ───────────────────────────────────────────────────

  if (needsLogin) {
    return (
      <LoginScreen
        form={loginForm}
        error={loginError}
        onSubmit={handleLogin}
        onChange={setLoginForm}
      />
    );
  }

  // ── Render: Main dashboard ─────────────────────────────────────────────────

  const initials  = currentUser?.sub?.slice(0, 2).toUpperCase() ?? 'ME';
  const roleLabel = isAdmin ? 'Admin workspace' : isEngineer ? 'Engineer workspace' : 'Employee workspace';

  // Active tickets = anything not yet resolved or closed
  const activeTickets   = tickets.filter(t => ['Open', 'Assigned', 'In Progress'].includes(t.status));
  const criticalTickets = tickets.filter(t => t.priority === 'Critical');
  const availableTeams  = teams.filter(t => t.available > 0);

  return (
    <main>

      {/* ── Top navigation bar ── */}
      <header>
        <div className="brand">
          <span className="logo">H</span>
          <strong>HelpDesk Pro</strong>
        </div>

        <nav aria-label="Workspace navigation">
          <a className={activeTab === 'overview' ? 'active' : ''} href="#overview" onClick={() => setActiveTab('overview')}>
            Overview
          </a>
          <a className={activeTab === 'tickets' ? 'active' : ''} href="#tickets" onClick={() => setActiveTab('tickets')}>
            {isEngineer ? 'Queue' : 'My tickets'} <span>{tickets.length}</span>
          </a>
          <a className={activeTab === 'teams' ? 'active' : ''} href="#teams" onClick={() => setActiveTab('teams')}>
            Support teams
          </a>
          {isAdmin && (
            <a className={activeTab === 'admin' ? 'active' : ''} href="#admin" onClick={() => setActiveTab('admin')}>
              Admin <span className="admin-badge">⚙</span>
            </a>
          )}
        </nav>

        <div className="header-actions">
          <span className="portal"><i /> {roleLabel}</span>
          {/* Profile circle shows initials — click to sign out */}
          <button className="profile" onClick={handleLogout} title="Click to sign out">
            {initials}
          </button>
        </div>
      </header>

      {/* ── Hero banner ── */}
      <section className="hero" id="overview">
        <div>
          <p>INTERNAL IT OPERATIONS</p>
          <h1>{isEngineer ? 'Resolve. Support. Deliver.' : 'Keep your teams moving.'}</h1>
          <span>
            {isEngineer
              ? 'Manage your team queue and move tickets through their lifecycle.'
              : 'One place to raise issues, track progress, and get help from IT.'}
          </span>
          <div className="hero-actions">
            {isEngineer
              ? <a href="#tickets" onClick={() => setActiveTab('tickets')}>View queue <b>-&gt;</b></a>
              : <a href="#new-request">Raise a request <b>-&gt;</b></a>}
            <small><i /> Average response: 18 min</small>
          </div>
        </div>
        <div className="hero-mark"><span>HD</span><small>24/7<br />support</small></div>
      </section>

      {/* ── Summary counters ── */}
      <section className="stats" aria-label="Workspace summary">
        <Stat label="All tickets"       value={tickets.length} />
        <Stat label="Needs attention"   value={activeTickets.length} />
        <Stat label="Critical priority" value={criticalTickets.length} />
        <Stat label="Available teams"   value={`${availableTeams.length}/${teams.length}`} />
      </section>

      {/* ── Main content grid ── */}
      <section className="grid">

        {/* Employees only: new ticket form on the left column */}
        {!isEngineer && (
          <form onSubmit={handleSubmitTicket} id="new-request">
            <div className="section-heading">
              <div><p>NEW REQUEST</p><h2>Tell us what happened</h2></div>
              <span className="step">01</span>
            </div>
            <span className="helper">We will match your request with the right support team.</span>

            <label>Subject
              <input
                required
                value={ticketForm.title}
                placeholder="e.g. Email login issue"
                onChange={e => setTicketForm({ ...ticketForm, title: e.target.value })}
              />
            </label>

            <label>What do you need help with?
              <textarea
                required rows="5"
                value={ticketForm.description}
                placeholder="Describe the problem, any error messages, and what you have already tried..."
                onChange={e => setTicketForm({ ...ticketForm, description: e.target.value })}
              />
            </label>

            <div className="fields">
              <label>Category
                <select value={ticketForm.category} onChange={e => setTicketForm({ ...ticketForm, category: e.target.value })}>
                  <option>Technical Issue</option>
                  <option>Access Request</option>
                  <option>Hardware</option>
                  <option>Software</option>
                  <option>Network</option>
                </select>
              </label>
              <label>Priority
                <select value={ticketForm.priority} onChange={e => setTicketForm({ ...ticketForm, priority: e.target.value })}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </label>
            </div>

            <button disabled={loading}>
              {loading ? 'Connecting...' : 'Register ticket'} <span>-&gt;</span>
            </button>
          </form>
        )}

        {/* Right column (or full width for engineers): ticket queue + team panel */}
        <div className={isEngineer ? 'full-column' : 'right-column'}>
          <TicketQueue
            tickets={tickets}
            isEngineer={isEngineer}
            isAdmin={isAdmin}
            message={statusMsg}
            onRefresh={loadData}
            onAction={handleStatusUpdate}
            onAssign={openAssignModal}
          />
          <SupportTeams teams={teams} />
        </div>
      </section>

      {/* ── Admin panel (only visible on the Admin tab) ── */}
      {isAdmin && activeTab === 'admin' && (
        <AdminPanel adminTeams={adminTeams} onRefresh={loadAdminTeams} />
      )}

      {/* ── Assign ticket modal (opens when admin clicks Assign) ── */}
      {assignTarget && (
        <AssignModal
          ticket={assignTarget.ticket}
          engineers={assignTarget.engineers}
          onAssign={handleAssignTicket}
          onClose={() => setAssignTarget(null)}
        />
      )}
    </main>
  );
}

/** Small stat card shown in the summary bar. */
function Stat({ label, value }) {
  return (
    <div className="stat">
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}
