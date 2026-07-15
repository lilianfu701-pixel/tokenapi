import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "tokenapi_admin_session";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 8;

const SESSION_PAYLOAD = "tokenapi-admin";
const PASSWORD_DIGEST_KEY = "tokenapi-admin-password";

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD;
}

function hmacHex(key: string, value: string) {
  return createHmac("sha256", key).update(value).digest("hex");
}

function safeEqualHex(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function passwordDigest(password: string) {
  return hmacHex(PASSWORD_DIGEST_KEY, password);
}

export function verifyAdminPassword(password: string) {
  const configuredPassword = getAdminPassword();

  if (!configuredPassword || !password) {
    return false;
  }

  return safeEqualHex(passwordDigest(password), passwordDigest(configuredPassword));
}

export function createAdminSessionValue() {
  const configuredPassword = getAdminPassword();

  if (!configuredPassword) {
    throw new Error("ADMIN_PASSWORD is not configured.");
  }

  return hmacHex(configuredPassword, SESSION_PAYLOAD);
}

export async function isAdminAuthenticated() {
  const configuredPassword = getAdminPassword();

  if (!configuredPassword) {
    return false;
  }

  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!sessionValue) {
    return false;
  }

  return safeEqualHex(sessionValue, createAdminSessionValue());
}
