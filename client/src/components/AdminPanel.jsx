// Admin panel — support team roster table + "Add account" action.
// Visible only to admins via the ⚙ Admin tab.

import React, { useState } from 'react';
import AddEmployeeModal from './AddEmployeeModal.jsx';

export default function AdminPanel({ adminTeams, onRefresh }) {
  const [showAddModal, setShowAddModal] = useState(false);

  function handleAccountCreated() {
    // Keep modal open so admin can add multiple accounts in one session.
    // Roster refresh happens when admin navigates back to admin tab.
    onRefresh();
  }

  return (
    <section className="admin-panel" id="admin">

      {/* ── Header row ── */}
      <div className="section-heading" style={{ marginBottom: '20px' }}>
        <div>
          <p>ADMIN PANEL</p>
          <h2>Support team roster</h2>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn-action btn-accept"
            style={{ padding: '8px 14px', fontSize: 12 }}
            onClick={() => setShowAddModal(true)}
          >
            + Add account
          </button>
          <button className="refresh" onClick={onRefresh}>Refresh</button>
        </div>
      </div>

      <span className="helper" style={{ marginBottom: '20px', display: 'block' }}>
        All accounts are managed by admins. Use <strong>+ Add account</strong> to create new employee, engineer, or admin logins.
        Use the <strong>Assign</strong> button on any ticket to route it to a specific engineer.
      </span>

      {/* ── Team tables ── */}
      {adminTeams.map(team => (
        <div className="team-table-block" key={team.id}>
          <div className="team-table-header">
            <div className="team-icon">{team.name.charAt(0)}</div>
            <div>
              <strong>{team.name}</strong>
              <small>{team.specialty} &nbsp;·&nbsp; Handles: {team.categories.join(', ')}</small>
            </div>
            <span
              className={team.available > 0 ? 'available' : 'busy'}
              style={{ marginLeft: 'auto' }}
            >
              {team.available}/{team.capacity} available · ~{team.responseTime}
            </span>
          </div>

          <table className="engineer-table">
            <thead>
              <tr>
                <th>Engineer</th>
                <th>Email</th>
                <th>Role</th>
                <th>Open tickets</th>
                <th>Resolved</th>
              </tr>
            </thead>
            <tbody>
              {team.engineers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="no-engineers">No engineers assigned to this team yet.</td>
                </tr>
              ) : (
                team.engineers.map(eng => (
                  <tr key={eng.id}>
                    <td>
                      <span className="eng-avatar">{eng.name.charAt(0)}</span>
                      {eng.name}
                    </td>
                    <td className="eng-email">{eng.email}</td>
                    <td><span className={`role-badge ${eng.role}`}>{eng.role}</span></td>
                    <td>
                      <span className={`workload ${
                        Number(eng.openTickets) > 3 ? 'high'
                          : Number(eng.openTickets) > 1 ? 'mid'
                          : 'low'
                      }`}>
                        {eng.openTickets}
                      </span>
                    </td>
                    <td className="resolved-count">{eng.resolvedTickets}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ))}

      {/* ── Add account modal ── */}
      {showAddModal && (
        <AddEmployeeModal
          onCreated={handleAccountCreated}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </section>
  );
}
