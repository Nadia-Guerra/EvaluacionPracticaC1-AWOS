import { Pool } from 'pg';

const pool = new Pool({
  host: 'cafe_db',
  port: 5432,
  database: 'cafeteria_db',
  user: 'app_user',       
  password: 'app_pass',    
});

export async function query(text: string, params: any[] = []) {
  const result = await pool.query(text, params);
  return result.rows;
}
