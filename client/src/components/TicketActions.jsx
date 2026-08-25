import React, { useState } from 'react';

// One step in the ticket lifecycle. Shows a single colour-coded action button.
const statusActions = {
  'Open':        { label: 'Accept',  next: 'assigned',    className: 'btn-accept'  },
  'Assigned':    { label: 'Start',   next: 'in_progress', className: 'btn-start'   },
  'In Progress': { label: 'Resolve', next: 'resolved',    className: 'btn-resolve' },
  'Resolved':    { label: 'Close',   next: 'closed',      className: 'btn-close'   },
};

export default function TicketActions({ ticket, onAction }) {
  const [busy, setBusy] = useState(false);
  const action = statusActions[ticket.status];

  if (!action) return null; // Closed tickets have no further actions

  async function handle() {
    setBusy(true);
    await onAction(ticket, action.next);
    setBusy(false);
  }

  return (
    <button className={`btn-action ${action.className}`} disabled={busy} onClick={handle}>
      {busy ? '...' : action.label}
    </button>
  );
}
