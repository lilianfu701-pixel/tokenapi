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
  throw new Error("DATABASE_URL or POSTGRES_URL is required to set up access_requests.");
}

const sql = neon(databaseUrl);

await sql`
  CREATE TABLE IF NOT EXISTS access_requests (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    use_case TEXT NOT NULL,
    review_status TEXT NOT NULL DEFAULT 'new',
    admin_notes TEXT NOT NULL DEFAULT '',
    reviewed_at TIMESTAMPTZ,
    source TEXT NOT NULL DEFAULT 'tokenapi.biz',
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;

await sql`
  ALTER TABLE access_requests
  ADD COLUMN IF NOT EXISTS review_status TEXT NOT NULL DEFAULT 'new'
`;

await sql`
  ALTER TABLE access_requests
  ADD COLUMN IF NOT EXISTS admin_notes TEXT NOT NULL DEFAULT ''
`;

await sql`
  ALTER TABLE access_requests
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ
`;

await sql`
  CREATE INDEX IF NOT EXISTS access_requests_submitted_at_idx
  ON access_requests (submitted_at DESC)
`;

await sql`
  CREATE INDEX IF NOT EXISTS access_requests_review_status_idx
  ON access_requests (review_status)
`;

console.log("access_requests table is ready.");
