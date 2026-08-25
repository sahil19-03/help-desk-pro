CREATE TABLE IF NOT EXISTS admin_role_audit (
  id UUID PRIMARY KEY,
  actor_user_id UUID NOT NULL REFERENCES users(id),
  target_user_id UUID NOT NULL REFERENCES users(id),
  previous_role user_role NOT NULL,
  new_role user_role NOT NULL,
  reason VARCHAR(200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS admin_role_audit_actor_user_id_idx ON admin_role_audit(actor_user_id);
CREATE INDEX IF NOT EXISTS admin_role_audit_target_user_id_idx ON admin_role_audit(target_user_id);
CREATE INDEX IF NOT EXISTS admin_role_audit_created_at_idx ON admin_role_audit(created_at DESC);
