import bcrypt from 'bcryptjs';
import pg from 'pg';
import { randomUUID } from 'node:crypto';
import 'dotenv/config';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Engineer accounts to create
// Password for all dummy engineers: Engineer@123
const engineers = [
  // Service Desk – Access Request & Technical Issue (Sahil is already here as admin)
  // Network Operations – 2 engineers
  { name: 'Arjun Mehta',    email: 'arjun.mehta@helpdesk.internal',   team: 'network-ops',    role: 'engineer' },
  { name: 'Priya Kapoor',   email: 'priya.kapoor@helpdesk.internal',  team: 'network-ops',    role: 'engineer' },
  // Workplace Technology – Hardware – 2 engineers
  { name: 'Rohan Verma',    email: 'rohan.verma@helpdesk.internal',   team: 'workplace-tech', role: 'engineer' },
  { name: 'Ananya Gupta',   email: 'ananya.gupta@helpdesk.internal',  team: 'workplace-tech', role: 'engineer' },
  // Business Applications – Software – 2 engineers
  { name: 'Vikram Nair',    email: 'vikram.nair@helpdesk.internal',   team: 'applications',   role: 'engineer' },
  { name: 'Meera Pillai',   email: 'meera.pillai@helpdesk.internal',  team: 'applications',   role: 'engineer' },
];

async function run() {
  console.log('Adding team_id column to users if not exists...');
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS team_id VARCHAR(50)`);
  console.log('Column ready.\n');

  // Update Sahil (SysAdmin) to service-desk team
  const sahilUpdate = await pool.query(
    `UPDATE users SET team_id = 'service-desk', role = 'admin' WHERE email = 'sahilar1903@gmail.com' RETURNING name, email, role, team_id`
  );
  if (sahilUpdate.rows.length) {
    const u = sahilUpdate.rows[0];
    console.log(`✓ Updated: ${u.name} → role=${u.role}, team=${u.team_id}`);
  }

  const hash = await bcrypt.hash('Engineer@123', 12);

  for (const eng of engineers) {
    const result = await pool.query(`
      INSERT INTO users (id, name, email, password_hash, role, team_id)
      VALUES ($1, $2, $3, $4, $5::user_role, $6)
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, team_id = EXCLUDED.team_id
      RETURNING name, email, role, team_id
    `, [randomUUID(), eng.name, eng.email, hash, eng.role, eng.team]);
    const u = result.rows[0];
    console.log(`✓ Created: ${u.name} (${u.email}) → role=${u.role}, team=${u.team_id}`);
  }

  console.log('\n✅ All engineer accounts seeded. Password for all: Engineer@123');
  console.log('\nSummary:');
  const { rows } = await pool.query(
    `SELECT name, email, role, team_id FROM users WHERE role IN ('engineer','admin') ORDER BY team_id, name`
  );
  console.table(rows);
  await pool.end();
}

run().catch(err => { console.error(err.message); process.exit(1); });
