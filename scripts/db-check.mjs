import pg from 'pg';

const { Client } = pg;

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is missing. Run with: node --env-file=.secrets/supabase.env scripts/db-check.mjs');
  process.exit(1);
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  const result = await client.query('select current_database() as database, current_user as user, version() as version');
  console.log(result.rows[0]);
} finally {
  await client.end();
}
