INSERT INTO users (id, name, email, password_hash, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Demo Employee',
  'employee@example.com',
  '$2b$12$Y6qQ1fzQ3.NcNUELN/fzH.sUIS5vwDf6cUfsE6R2ML7T6rB22hTZO',
  'employee'
)
ON CONFLICT (email) DO NOTHING;