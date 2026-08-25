import 'dotenv/config';
import pg from 'pg';
import fs from 'fs';

const { Pool } = pg;

async function setup() {
  const rootUrl = process.env.DATABASE_URL.replace('/helpdesk', '/postgres');
  
  console.log('Connecting to postgres to ensure helpdesk db exists...');
  let rootPool = new Pool({ connectionString: rootUrl });
  try {
    const res = await rootPool.query("SELECT 1 FROM pg_database WHERE datname = 'helpdesk'");
    if (res.rowCount === 0) {
      console.log('Creating helpdesk database...');
      await rootPool.query('CREATE DATABASE helpdesk');
      console.log('Database created.');
    } else {
      console.log('Database helpdesk already exists.');
    }
  } catch (err) {
    console.error('Failed to create db:', err.message);
  } finally {
    await rootPool.end();
  }

  console.log('Connecting to helpdesk to run schema...');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    const schemaSql = fs.readFileSync('./database/schema.sql', 'utf8');
    await pool.query(schemaSql);
    console.log('schema.sql executed successfully.');

    const seedSql = fs.readFileSync('./database/seed.sql', 'utf8');
    await pool.query(seedSql);
    console.log('seed.sql executed successfully.');
    
    const googleAuthSql = fs.readFileSync('./database/google-auth-migration.sql', 'utf8');
    await pool.query(googleAuthSql);
    console.log('google-auth-migration.sql executed successfully.');

    const adminRoleSql = fs.readFileSync('./database/admin-role-audit-migration.sql', 'utf8');
    await pool.query(adminRoleSql);
    console.log('admin-role-audit-migration.sql executed successfully.');

    console.log('ALL DONE! You can now use the app.');
  } catch (err) {
    console.error('Error running SQL scripts:', err.message);
  } finally {
    await pool.end();
  }
}

setup();
