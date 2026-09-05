import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

try {
  // Set IT Administration for any admin/engineer without a dept
  const r1 = await pool.query(`UPDATE users SET dept = 'IT Administration' WHERE role IN ('admin','engineer') AND (dept IS NULL OR dept = '')`);
  console.log(`✅ Updated ${r1.rowCount} admin/engineer users → IT Administration`);
} catch(err) {
  console.error('Error:', err.message);
} finally {
  await pool.end();
}
