// Central database pool — import this wherever you need DB access.
import pg from 'pg';
const { Pool } = pg;
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const databaseEnabled = Boolean(process.env.DATABASE_URL);
