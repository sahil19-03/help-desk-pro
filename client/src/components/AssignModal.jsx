import React from 'react';

/**
 * Assign ticket modal.
 * Opens as an overlay when an admin clicks "Assign" on a ticket.
 * Lists all engineers with their current open ticket count as a workload hint.
 */
export default function AssignModal({ ticket, engineers, onAssign, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <strong>Assign ticket</strong>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <p className="modal-ticket-title">{ticket.title}</p>
        <p className="modal-label">Select engineer</p>

        <div className="modal-engineer-list">
          {engineers.length === 0 ? (
            <p style={{ color: '#888', fontSize: '13px' }}>Loading engineers...</p>
          ) : (
            engineers.map(eng => (
              <button key={eng.id} className="modal-eng-btn" onClick={() => onAssign(ticket, eng.id)}>
                <span className="eng-avatar sm">{eng.name.charAt(0)}</span>
                <span>
                  <strong>{eng.name}</strong>
                  <small>{eng.email}</small>
                </span>
                <span className={`workload ${
                  Number(eng.openTickets) > 3 ? 'high' : Number(eng.openTickets) > 1 ? 'mid' : 'low'
                }`}>
                  {eng.openTickets} open
                </span>
              </button>
            ))
          )}
        </div>

        <button
          className="btn-action btn-close"
          style={{ width: '100%', marginTop: '12px' }}
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
