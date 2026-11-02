import '../config/env';
import { readdirSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { Client } from 'pg';

(async () => {
  const dir = resolve(__dirname, '../../../../db/migrations');
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  await c.query('CREATE TABLE IF NOT EXISTS _migrations (name text PRIMARY KEY, at timestamptz DEFAULT now())');
  const done = new Set((await c.query('SELECT name FROM _migrations')).rows.map((r) => r.name));
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()) {
    if (done.has(f)) continue;
    console.log('Applying', f);
    await c.query('BEGIN');
    try {
      await c.query(readFileSync(resolve(dir, f), 'utf8'));
      await c.query('INSERT INTO _migrations (name) VALUES ($1)', [f]);
      await c.query('COMMIT');
    } catch (e) {
      await c.query('ROLLBACK');
      throw e;
    }
  }
  console.log('Migrations up to date');
  await c.end();
})().catch((e) => { console.error(e); process.exit(1); });
