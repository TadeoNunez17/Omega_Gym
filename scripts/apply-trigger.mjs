import pg from 'pg';

const { Client } = pg;

const sql = `CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Usuario'),
    'member'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();`;

const client = new Client({
  connectionString: 'postgresql://postgres.jaltwjcipyrnmvjkdqdp:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphbHR3amNpcHlybm12amtkcWRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzcwNTAzMSwiZXhwIjoyMDkzMjgxMDMxfQ.ilUHGJTSr4_qWDMz4lKL-K9q_uhRJ2fuUKqvbfj3l14@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

try {
  await client.connect();
  console.log('Connected to DB');
  await client.query(sql);
  console.log('Trigger created successfully');
} catch (err) {
  console.error('Error:', err.message);
} finally {
  await client.end();
}
