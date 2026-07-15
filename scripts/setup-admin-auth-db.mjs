import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

function loadLocalEnv() {
  try {
    const envFile = readFileSync(".env.local", "utf8");
    for (const line of envFile.split(/\r?\n/)) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!match || process.env[match[1]]) continue;
      process.env[match[1]] = match[2].replace(/^"|"$/g, "");
    }
  } catch {
    // Vercel provides DATABASE_URL during deployment; local setup uses .env.local.
  }
}

loadLocalEnv();

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL or POSTGRES_URL is required to set up admin auth.");
}

const sql = neon(databaseUrl);

await sql`
  CREATE TABLE IF NOT EXISTS admin_login_attempts (
    identifier TEXT PRIMARY KEY,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    window_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    locked_until TIMESTAMPTZ
  )
`;

await sql`
  CREATE INDEX IF NOT EXISTS admin_login_attempts_locked_until_idx
  ON admin_login_attempts (locked_until)
`;

console.log("admin_login_attempts table is ready.");
