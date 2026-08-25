-- PostgreSQL schema for the next milestone
CREATE TYPE user_role AS ENUM ('employee', 'engineer', 'admin');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE ticket_status AS ENUM ('open', 'assigned', 'in_progress', 'resolved', 'closed');

CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  google_id VARCHAR(255) UNIQUE,
  role user_role NOT NULL DEFAULT 'employee',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tickets (
  id UUID PRIMARY KEY,
  ticket_number VARCHAR(20) UNIQUE NOT NULL,
  title VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  priority ticket_priority NOT NULL DEFAULT 'medium',
  status ticket_status NOT NULL DEFAULT 'open',
  requester_id UUID NOT NULL REFERENCES users(id),
  assignee_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE admin_role_audit (
  id UUID PRIMARY KEY,
  actor_user_id UUID NOT NULL REFERENCES users(id),
  target_user_id UUID NOT NULL REFERENCES users(id),
  previous_role user_role NOT NULL,
  new_role user_role NOT NULL,
  reason VARCHAR(200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX tickets_requester_id_idx ON tickets(requester_id);
CREATE INDEX tickets_assignee_id_idx ON tickets(assignee_id);
CREATE INDEX tickets_status_idx ON tickets(status);
CREATE INDEX admin_role_audit_actor_user_id_idx ON admin_role_audit(actor_user_id);
CREATE INDEX admin_role_audit_target_user_id_idx ON admin_role_audit(target_user_id);
CREATE INDEX admin_role_audit_created_at_idx ON admin_role_audit(created_at DESC);
