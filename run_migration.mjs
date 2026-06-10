import { readFileSync } from 'fs';
import pkg from 'pg';
const { Pool } = pkg;


const sql = readFileSync('supabase/migrations/20260604000003_sync_membership_status.sql', 'utf8');
console.log('SQL to execute:');
console.log(sql);
console.log('---');

// Try connecting via Supavisor (session pooler) using JWT auth
// Format: user = postgres.<project_ref>, password = JWT token
const pool = new Pool({
  host: 'aws-0-us-east-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: `postgres.${PROJECT_REF}`,
  password: SERVICE_ROLE_KEY,
  ssl: { rejectUnauthorized: false },
  max: 1,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 15000,
});

try {
  const client = await pool.connect();
  console.log('Connected to Supabase database via pooler');
  
  const result = await client.query(sql);
  console.log('Migration executed successfully!');
  console.log('Result:', JSON.stringify(result, null, 2));
  
  await client.release();
} catch (err) {
  console.error('Connection failed with JWT auth via pooler:', err.message);
  console.log('Trying alternative approach using Rest API...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({}),
    });
    console.log('RPC endpoint status:', response.status);
    const text = await response.text();
    console.log('RPC response:', text.substring(0, 500));
  } catch (fetchErr) {
    console.error('RPC approach also failed:', fetchErr.message);
  }
}

await pool.end();
