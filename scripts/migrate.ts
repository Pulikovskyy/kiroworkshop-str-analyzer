/**
 * Applies db/migrations/*.sql in filename order, tracking applied files in
 * a schema_migrations table so re-runs are no-ops.
 *
 * Usage: npm run db:migrate   (requires DATABASE_URL, read from .env.local if present)
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Pool } from "pg";

try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local — expect DATABASE_URL to be set in the environment (e.g. CI).
}

const MIGRATIONS_DIR = join(__dirname, "..", "db", "migrations");

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Add it to .env.local or the environment.");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename   TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    const applied = new Set(
      (await client.query("SELECT filename FROM schema_migrations")).rows.map(
        (r) => r.filename
      )
    );

    const files = readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    let ran = 0;
    for (const file of files) {
      if (applied.has(file)) {
        console.log(`skip  ${file} (already applied)`);
        continue;
      }

      const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
      console.log(`apply ${file} ...`);
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query(
          "INSERT INTO schema_migrations (filename) VALUES ($1)",
          [file]
        );
        await client.query("COMMIT");
        ran++;
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      }
    }

    console.log(ran > 0 ? `Done — ${ran} migration(s) applied.` : "Done — nothing to apply.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
