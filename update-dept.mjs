/**
 * update-dept.mjs
 * Backfills the 'dept' column for all seeded employees.
 * Run once: node update-dept.mjs
 */
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const employees = [
  { email: 'aisha.sharma@company.com',  dept: 'HR' },
  { email: 'rahul.gupta@company.com',   dept: 'HR' },
  { email: 'pooja.joshi@company.com',   dept: 'HR' },
  { email: 'amit.patel@company.com',    dept: 'Finance' },
  { email: 'sneha.reddy@company.com',   dept: 'Finance' },
  { email: 'karan.mehta@company.com',   dept: 'Finance' },
  { email: 'divya.nair@company.com',    dept: 'Finance' },
  { email: 'suresh.kumar@company.com',  dept: 'Sales' },
  { email: 'priyanka.singh@company.com',dept: 'Sales' },
  { email: 'manish.yadav@company.com',  dept: 'Sales' },
  { email: 'nandini.rao@company.com',   dept: 'Legal' },
  { email: 'gaurav.mishra@company.com', dept: 'Legal' },
  { email: 'swati.pandey@company.com',  dept: 'Legal' },
  { email: 'akash.goel@company.com',    dept: 'Product' },
  { email: 'tanvi.desai@company.com',   dept: 'Product' },
  { email: 'rohan.agarwal@company.com', dept: 'Product' },
  { email: 'disha.bhatt@company.com',   dept: 'Product' },
  { email: 'mohit.jain@company.com',    dept: 'Customer Support' },
  { email: 'pallavi.sinha@company.com', dept: 'Customer Support' },
];

try {
  let updated = 0;
  for (const e of employees) {
    const r = await pool.query(
      `UPDATE users SET dept = $1 WHERE email = $2`,
      [e.dept, e.email]
    );
    if (r.rowCount) { console.log(`✅ ${e.email} → ${e.dept}`); updated++; }
    else console.log(`⚠️  ${e.email} not found (skipped)`);
  }
  console.log(`\n✅ Updated ${updated} users.`);
} catch (err) {
  console.error('❌ Error:', err.message);
} finally {
  await pool.end();
}
