import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = typeof import.meta.dirname !== 'undefined'
  ? import.meta.dirname
  : path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// These are the accounts auto-created by the old buggy code.
// They are NOT company employees and should not have access.
const unauthorizedEmails = [
  'claurea49@gmail.com',
  'sahil.23jics123@jietjodhpur.ac.in',
];

console.log('\n=== Removing unauthorized auto-created accounts ===');
for (const email of unauthorizedEmails) {
  const r = await pool.query(
    "DELETE FROM users WHERE email = $1 AND role = 'employee' RETURNING name, email",
    [email]
  );
  if (r.rowCount > 0) {
    console.log(`🗑️  Deleted: ${r.rows[0].name} (${r.rows[0].email})`);
  } else {
    console.log(`⚠️  Not found or already removed: ${email}`);
  }
}

console.log('\n=== Remaining users ===');
const remaining = await pool.query(`
  SELECT name, email, role,
    CASE WHEN google_id IS NOT NULL THEN 'YES' ELSE 'NO' END AS "has_google_id"
  FROM users ORDER BY role, name LIMIT 10
`);
console.table(remaining.rows);

await pool.end();
