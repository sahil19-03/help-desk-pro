import bcrypt from 'bcryptjs';
import pg from 'pg';
import { randomUUID } from 'node:crypto';
import 'dotenv/config';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const employees = [
  // Department: HR
  { name: 'Aisha Sharma',      email: 'aisha.sharma@company.com',      dept: 'HR' },
  { name: 'Rahul Gupta',       email: 'rahul.gupta@company.com',       dept: 'HR' },
  { name: 'Pooja Joshi',       email: 'pooja.joshi@company.com',       dept: 'HR' },
  // Department: Finance
  { name: 'Amit Patel',        email: 'amit.patel@company.com',        dept: 'Finance' },
  { name: 'Sneha Reddy',       email: 'sneha.reddy@company.com',       dept: 'Finance' },
  { name: 'Karan Mehta',       email: 'karan.mehta@company.com',       dept: 'Finance' },
  { name: 'Divya Nair',        email: 'divya.nair@company.com',        dept: 'Finance' },
  // Department: Sales
  { name: 'Suresh Kumar',      email: 'suresh.kumar@company.com',      dept: 'Sales' },
  { name: 'Priyanka Singh',    email: 'priyanka.singh@company.com',    dept: 'Sales' },
  { name: 'Manish Yadav',      email: 'manish.yadav@company.com',      dept: 'Sales' },
  { name: 'Neha Kapoor',       email: 'neha.kapoor@company.com',       dept: 'Sales' },
  { name: 'Rajesh Tiwari',     email: 'rajesh.tiwari@company.com',     dept: 'Sales' },
  // Department: Marketing
  { name: 'Anjali Dubey',      email: 'anjali.dubey@company.com',      dept: 'Marketing' },
  { name: 'Siddharth Bose',    email: 'siddharth.bose@company.com',    dept: 'Marketing' },
  { name: 'Riya Chatterjee',   email: 'riya.chatterjee@company.com',   dept: 'Marketing' },
  { name: 'Varun Malhotra',    email: 'varun.malhotra@company.com',    dept: 'Marketing' },
  // Department: Engineering
  { name: 'Nikhil Aggarwal',   email: 'nikhil.aggarwal@company.com',   dept: 'Engineering' },
  { name: 'Shweta Iyer',       email: 'shweta.iyer@company.com',       dept: 'Engineering' },
  { name: 'Deepak Menon',      email: 'deepak.menon@company.com',      dept: 'Engineering' },
  { name: 'Kavya Pillai',      email: 'kavya.pillai@company.com',      dept: 'Engineering' },
  { name: 'Aryan Thakur',      email: 'aryan.thakur@company.com',      dept: 'Engineering' },
  { name: 'Ishaan Verma',      email: 'ishaan.verma@company.com',      dept: 'Engineering' },
  // Department: Operations
  { name: 'Meghna Saxena',     email: 'meghna.saxena@company.com',     dept: 'Operations' },
  { name: 'Tarun Bansal',      email: 'tarun.bansal@company.com',      dept: 'Operations' },
  { name: 'Simran Kohli',      email: 'simran.kohli@company.com',      dept: 'Operations' },
  { name: 'Vivek Srivastava',  email: 'vivek.srivastava@company.com',  dept: 'Operations' },
  // Department: Legal
  { name: 'Nandini Rao',       email: 'nandini.rao@company.com',       dept: 'Legal' },
  { name: 'Gaurav Mishra',     email: 'gaurav.mishra@company.com',     dept: 'Legal' },
  { name: 'Swati Pandey',      email: 'swati.pandey@company.com',      dept: 'Legal' },
  // Department: Product
  { name: 'Akash Goel',        email: 'akash.goel@company.com',        dept: 'Product' },
  { name: 'Tanvi Desai',       email: 'tanvi.desai@company.com',       dept: 'Product' },
  { name: 'Rohan Agarwal',     email: 'rohan.agarwal@company.com',     dept: 'Product' },
  { name: 'Disha Bhatt',       email: 'disha.bhatt@company.com',       dept: 'Product' },
  // Department: Customer Support
  { name: 'Mohit Jain',        email: 'mohit.jain@company.com',        dept: 'Customer Support' },
  { name: 'Pallavi Sinha',     email: 'pallavi.sinha@company.com',     dept: 'Customer Support' },
];

async function run() {
  const hash = await bcrypt.hash('Employee@123', 12);
  let created = 0, skipped = 0;

  for (const emp of employees) {
    const result = await pool.query(`
      INSERT INTO users (id, name, email, password_hash, role)
      VALUES ($1, $2, $3, $4, 'employee')
      ON CONFLICT (email) DO NOTHING
      RETURNING name
    `, [randomUUID(), emp.name, emp.email, hash]);
    if (result.rows.length) { console.log(`✓ ${emp.name} (${emp.dept})`); created++; }
    else { console.log(`- ${emp.name} already exists`); skipped++; }
  }

  console.log(`\n✅ Done: ${created} created, ${skipped} skipped`);
  console.log(`   Password for all employees: Employee@123`);
  console.log(`   Total employees seeded: ${employees.length}`);

  const { rows } = await pool.query(`SELECT role, COUNT(*) FROM users GROUP BY role ORDER BY role`);
  console.log('\nUser breakdown:');
  console.table(rows);
  await pool.end();
}

run().catch(err => { console.error(err.message); process.exit(1); });
