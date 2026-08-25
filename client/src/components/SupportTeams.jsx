import React from 'react';

/**
 * Support teams live capacity panel.
 * Shows each team's available engineers, capacity bar, and open ticket count.
 * Visible to all users (employees, engineers, admins).
 */
export default function SupportTeams({ teams }) {
  return (
    <section className="teams" id="teams">
      <div className="heading">
        <div><p>LIVE CAPACITY</p><h2>Support teams</h2></div>
        <span className="live"><i /> Live</span>
      </div>

      {teams.map(team => (
        <div className="team" key={team.id}>
          <div className="team-icon">{team.name.charAt(0)}</div>

          <div className="team-info">
            <strong>{team.name}</strong>
            <small>{team.specialty}</small>
            <div className="capacity">
              <span style={{ width: `${(team.available / team.capacity) * 100}%` }} />
            </div>
          </div>

          <div className="team-meta">
            <span className={team.available ? 'available' : 'busy'}>
              {team.available ? `${team.available} free` : 'At capacity'}
            </span>
            {team.openTickets > 0 && (
              <span className="open-ticket-count">{team.openTickets} open</span>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
