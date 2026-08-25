import React from 'react';
import TicketActions from './TicketActions.jsx';

/**
 * Renders the full ticket queue.
 * - Employees see their own tickets (read-only).
 * - Engineers see team tickets + Accept/Start/Resolve/Close buttons.
 * - Admins see all tickets + action buttons + Assign button.
 */
export default function TicketQueue({ tickets, isEngineer, isAdmin, message, onRefresh, onAction, onAssign }) {
  const queueLabel   = isEngineer ? 'FULL QUEUE'    : 'YOUR WORK QUEUE';
  const queueHeading = isEngineer ? 'All tickets'   : 'Recent tickets';

  return (
    <section className="tickets" id="tickets">
      <div className="heading">
        <div><p>{queueLabel}</p><h2>{queueHeading}</h2></div>
        <button className="refresh" onClick={onRefresh} aria-label="Refresh tickets">Refresh</button>
      </div>

      {message && <div className="message">{message}</div>}
      {!message && tickets.length === 0 && <div className="empty">No tickets yet.</div>}

      {tickets.map(ticket => (
        <article key={ticket.uuid ?? ticket.id}>
          <div className="ticket-copy">
            <strong>{ticket.title}</strong>
            <small>{ticket.id} <b>·</b> {ticket.category} <b>·</b> {ticket.createdAt}</small>
            <small className="route">
              {isEngineer && ticket.requester && (
                <><b>From:</b> {ticket.requester} <b>·</b> </>
              )}
              {ticket.supportTeam} <b>·</b> {ticket.assignee}
            </small>
          </div>

          <div className="ticket-right">
            <div className="ticket-tags">
              <span className={`tag ${ticket.priority.toLowerCase()}`}>{ticket.priority}</span>
              <span className={`tag ${ticket.status.toLowerCase().replace(' ', '-')}`}>{ticket.status}</span>
            </div>

            <div className="ticket-actions">
              {isEngineer && <TicketActions ticket={ticket} onAction={onAction} />}
              {isAdmin && ticket.status !== 'Closed' && (
                <button className="btn-action btn-assign" onClick={() => onAssign(ticket)}>
                  Assign
                </button>
              )}
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
