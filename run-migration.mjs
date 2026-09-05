/**
 * run-migration.mjs
 * Adds the 'dept' column to the users table if it doesn't exist yet.
 * Run once: node server/run-migration.mjs
 */
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

try {
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS dept VARCHAR(100);`);
  console.log('✅ dept column added (or already existed).');
} catch (err) {
  console.error('❌ Migration failed:', err.message);
} finally {
  await pool.end();
}
