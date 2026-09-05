import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = typeof import.meta.dirname !== 'undefined' 
  ? import.meta.dirname 
  : path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, '.env') });

const email = process.argv[2];

if (!email) {
  console.error("❌ Please provide the email address you want to promote.");
  console.log("Usage: node server/promote.js <your-email@example.com>");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function promote() {
  try {
    const res = await pool.query("UPDATE users SET role = 'admin' WHERE email = $1 RETURNING name, email", [email.toLowerCase()]);
    
    if (res.rowCount > 0) {
      console.log(`✅ Success! ${res.rows[0].name} (${res.rows[0].email}) is now an Admin.`);
      console.log("Please sign out and sign back in to see the Admin dashboard.");
    } else {
      console.log(`⚠️ User with email '${email}' not found.`);
      console.log("Make sure you have signed into the app with this email at least once first!");
    }
  } catch (err) {
    console.error("❌ Error promoting user:", err.message);
  } finally {
    await pool.end();
  }
}

promote();
