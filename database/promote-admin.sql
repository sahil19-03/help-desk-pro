\if :{?admin_email}
\else
\echo "Missing variable: admin_email"
\echo "Usage: psql <DATABASE_URL> -v admin_email=admin@company.com -f database/promote-admin.sql"
\quit 1
\endif

BEGIN;

UPDATE users
SET role = 'admin'::user_role
WHERE email = LOWER(:'admin_email');

SELECT id, name, email, role
FROM users
WHERE email = LOWER(:'admin_email');

COMMIT;
