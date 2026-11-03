import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Client } = pg;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const migrationsDir = path.join(root, 'supabase', 'migrations');

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is missing. Run with: node --env-file=.secrets/supabase.env scripts/db-migrate.mjs`);
  }
  return value;
}

export function createClient() {
  const client = new Client({
    connectionString: requireEnv('DATABASE_URL'),
    ssl: { rejectUnauthorized: false },
    statement_timeout: 60_000,
    connectionTimeoutMillis: 20_000,
  });
  client.on('error', (error) => {
    console.error('database connection error:', error.message);
  });
  return client;
}

export function splitStatements(sql) {
  const statements = [];
  let current = '';
  let i = 0;

  while (i < sql.length) {
    const ch = sql[i];

    if (ch === '-' && sql[i + 1] === '-') {
      const end = sql.indexOf('\n', i);
      const next = end === -1 ? sql.length : end + 1;
      current += sql.slice(i, next);
      i = next;
      continue;
    }

    if (ch === '/' && sql[i + 1] === '*') {
      const end = sql.indexOf('*/', i + 2);
      const next = end === -1 ? sql.length : end + 2;
      current += sql.slice(i, next);
      i = next;
      continue;
    }

    if (ch === "'") {
      current += ch;
      i += 1;
      while (i < sql.length) {
        current += sql[i];
        if (sql[i] === "'" && sql[i + 1] === "'") {
          current += sql[i + 1];
          i += 2;
          continue;
        }
        if (sql[i] === "'") {
          i += 1;
          break;
        }
        i += 1;
      }
      continue;
    }

    if (ch === '"') {
      current += ch;
      i += 1;
      while (i < sql.length) {
        current += sql[i];
        if (sql[i] === '"' && sql[i + 1] === '"') {
          current += sql[i + 1];
          i += 2;
          continue;
        }
        if (sql[i] === '"') {
          i += 1;
          break;
        }
        i += 1;
      }
      continue;
    }

    if (ch === '$') {
      const match = sql.slice(i).match(/^\$[A-Za-z_]*\$/);
      if (match) {
        const tag = match[0];
        const end = sql.indexOf(tag, i + tag.length);
        const next = end === -1 ? sql.length : end + tag.length;
        current += sql.slice(i, next);
        i = next;
        continue;
      }
    }

    if (ch === ';') {
      current += ch;
      const statement = current.trim();
      if (statement.replace(/--.*$/gm, '').trim()) statements.push(statement);
      current = '';
      i += 1;
      continue;
    }

    current += ch;
    i += 1;
  }

  const statement = current.trim();
  if (statement.replace(/--.*$/gm, '').trim()) statements.push(statement);
  return statements;
}

function isConnectionError(error) {
  return ['ECONNRESET', 'ECONNREFUSED', 'EPIPE', 'ETIMEDOUT', '57P01', '08006', '08003', '08001'].includes(
    error?.code,
  );
}

async function connectClient() {
  const client = createClient();
  await client.connect();
  return client;
}

const IDEMPOTENT_ERROR_CODES = new Set([
  '23505', // duplicate key (migration bookkeeping)
  '42710', // duplicate object (trigger, type, policy)
  '42P07', // duplicate table
  '42P06', // duplicate schema
  '42723', // duplicate function
]);

async function queryWithReconnect(state, sql) {
  try {
    return await state.client.query(sql);
  } catch (error) {
    if (IDEMPOTENT_ERROR_CODES.has(error?.code)) {
      return null;
    }
    if (!isConnectionError(error)) throw error;
    console.error(`connection lost, reconnecting… (${error.message})`);
    await state.client.end().catch(() => undefined);
    state.client = await connectClient();
    try {
      return await state.client.query(sql);
    } catch (retryError) {
      if (IDEMPOTENT_ERROR_CODES.has(retryError?.code)) {
        return null;
      }
      throw retryError;
    }
  }
}

export async function migrate() {
  const state = { client: await connectClient() };

  await queryWithReconnect(
    state,
    `create table if not exists public.app_migrations (
       name text primary key,
       applied_at timestamptz not null default now()
     )`,
  );

  const entries = (await fs.readdir(migrationsDir))
    .filter((name) => name.endsWith('.sql'))
    .sort();

  for (const name of entries) {
    const applied = await queryWithReconnect(state, 'select name from public.app_migrations');
    if (applied.rows.some((row) => row.name === name)) {
      console.log(`skip ${name}`);
      continue;
    }

    const sql = await fs.readFile(path.join(migrationsDir, name), 'utf8');
    const statements = splitStatements(sql);
    console.log(`apply ${name} (${statements.length} statements)`);
    for (const [index, statement] of statements.entries()) {
      if (process.env.MIGRATION_VERBOSE === '1') {
        console.log(`  [${index}] ${statement.replace(/\s+/g, ' ').slice(0, 90)}`);
      }
      await queryWithReconnect(state, statement);
    }

    await queryWithReconnect(state, `insert into public.app_migrations (name) values ('${name.replace(/'/g, "''")}')`);
    console.log(`applied ${name}`);
  }

  return state.client;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let client;
  try {
    client = await migrate();
    console.log('migrations complete');
  } finally {
    await client?.end().catch(() => undefined);
  }
}
