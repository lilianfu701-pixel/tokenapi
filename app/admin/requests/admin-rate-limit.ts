import { neon } from "@neondatabase/serverless";

export const ADMIN_LOGIN_MAX_ATTEMPTS = 8;
export const ADMIN_LOGIN_WINDOW_SECONDS = 15 * 60;
export const ADMIN_LOGIN_LOCKOUT_SECONDS = 15 * 60;

export type AdminLoginAttemptRow = {
  attempt_count: number;
  window_started_at: Date | string;
  locked_until: Date | string | null;
};

function getDatabase() {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return neon(databaseUrl);
}

export function getLoginAttemptIdentifier(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfIp = request.headers.get("cf-connecting-ip");
  const ip = forwardedFor?.split(",")[0]?.trim() || realIp || cfIp || "unknown";

  return `ip:${ip.slice(0, 120)}`;
}

export function isLoginAttemptLocked(row: AdminLoginAttemptRow | undefined, now = Date.now()) {
  if (!row?.locked_until) {
    return false;
  }

  return new Date(row.locked_until).getTime() > now;
}

export async function assertAdminLoginIsAllowed(identifier: string) {
  const sql = getDatabase();
  const rows = await sql`
    SELECT attempt_count, window_started_at, locked_until
    FROM admin_login_attempts
    WHERE identifier = ${identifier}
    LIMIT 1
  `;

  return !isLoginAttemptLocked(rows[0] as AdminLoginAttemptRow | undefined);
}

export async function recordFailedAdminLogin(identifier: string) {
  const sql = getDatabase();

  await sql`
    INSERT INTO admin_login_attempts (identifier, attempt_count, window_started_at, locked_until)
    VALUES (${identifier}, 1, now(), NULL)
    ON CONFLICT (identifier) DO UPDATE SET
      attempt_count = CASE
        WHEN admin_login_attempts.window_started_at < now() - (${ADMIN_LOGIN_WINDOW_SECONDS} * interval '1 second')
          THEN 1
        ELSE admin_login_attempts.attempt_count + 1
      END,
      window_started_at = CASE
        WHEN admin_login_attempts.window_started_at < now() - (${ADMIN_LOGIN_WINDOW_SECONDS} * interval '1 second')
          THEN now()
        ELSE admin_login_attempts.window_started_at
      END,
      locked_until = CASE
        WHEN admin_login_attempts.window_started_at < now() - (${ADMIN_LOGIN_WINDOW_SECONDS} * interval '1 second')
          THEN NULL
        WHEN admin_login_attempts.attempt_count + 1 >= ${ADMIN_LOGIN_MAX_ATTEMPTS}
          THEN now() + (${ADMIN_LOGIN_LOCKOUT_SECONDS} * interval '1 second')
        ELSE admin_login_attempts.locked_until
      END
  `;
}

export async function recordSuccessfulAdminLogin(identifier: string) {
  const sql = getDatabase();

  await sql`
    DELETE FROM admin_login_attempts
    WHERE identifier = ${identifier}
  `;
}
