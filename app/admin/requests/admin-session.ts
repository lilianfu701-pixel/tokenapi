import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 8;

const SESSION_PAYLOAD = "tokenapi-admin";
const PASSWORD_DIGEST_KEY = "tokenapi-admin-password";
const CLOCK_SKEW_MS = 60 * 1000;

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

export function verifyAdminPassword(password: string, configuredPassword: string | undefined) {
  if (!configuredPassword || !password) {
    return false;
  }

  return safeEqualHex(passwordDigest(password), passwordDigest(configuredPassword));
}

export function createAdminSessionValue(configuredPassword: string, issuedAt = Date.now()) {
  const payload = `${SESSION_PAYLOAD}.${issuedAt}`;
  const signature = hmacHex(configuredPassword, payload);

  return `${issuedAt}.${signature}`;
}

export function verifyAdminSessionValue(
  sessionValue: string,
  configuredPassword: string | undefined,
  now = Date.now(),
) {
  if (!configuredPassword || !sessionValue) {
    return false;
  }

  const [issuedAtRaw, signature] = sessionValue.split(".");
  const issuedAt = Number(issuedAtRaw);

  if (!Number.isFinite(issuedAt) || !signature) {
    return false;
  }

  if (issuedAt > now + CLOCK_SKEW_MS) {
    return false;
  }

  if (now - issuedAt > ADMIN_COOKIE_MAX_AGE_SECONDS * 1000) {
    return false;
  }

  const expectedSignature = hmacHex(configuredPassword, `${SESSION_PAYLOAD}.${issuedAt}`);
  return safeEqualHex(signature, expectedSignature);
}
