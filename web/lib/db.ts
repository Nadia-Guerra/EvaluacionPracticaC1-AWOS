import { Pool } from 'pg';

const pool = new Pool({
  host: 'cafe_db',
  port: 5432,
  database: 'cafeteria_db',
  user: 'app_user',       
  password: 'postgres',    
});

export async function query(text: string) {
  const result = await pool.query(text);
  return result.rows;
}