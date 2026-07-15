import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const email = process.argv[2];

if (!email) {
  throw new Error("Usage: node scripts/check-access-request.mjs <email>");
}

function loadLocalEnv() {
  try {
    const envFile = readFileSync(".env.local", "utf8");
    for (const line of envFile.split(/\r?\n/)) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!match || process.env[match[1]]) continue;
      process.env[match[1]] = match[2].replace(/^"|"$/g, "");
    }
  } catch {
    // Vercel provides DATABASE_URL during deployment; local checks use .env.local.
  }
}

loadLocalEnv();

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL or POSTGRES_URL is required to check access_requests.");
}

const sql = neon(databaseUrl);

const rows = await sql`
  SELECT email, company, use_case, submitted_at
  FROM access_requests
  WHERE email = ${email}
  ORDER BY submitted_at DESC
  LIMIT 1
`;

console.log(JSON.stringify({ found: rows.length === 1, row: rows[0] || null }, null, 2));
