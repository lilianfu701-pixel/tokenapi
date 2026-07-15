import { cookies } from "next/headers";
import {
  ADMIN_COOKIE_MAX_AGE_SECONDS,
  createAdminSessionValue as createSignedAdminSessionValue,
  verifyAdminPassword as verifyPassword,
  verifyAdminSessionValue,
} from "./admin-session";

export const ADMIN_COOKIE_NAME = "tokenapi_admin_session";
export const ADMIN_COOKIE_MAX_AGE = ADMIN_COOKIE_MAX_AGE_SECONDS;

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD;
}

export function verifyAdminPassword(password: string) {
  return verifyPassword(password, getAdminPassword());
}

export function createAdminSessionValue() {
  const configuredPassword = getAdminPassword();

  if (!configuredPassword) {
    throw new Error("ADMIN_PASSWORD is not configured.");
  }

  return createSignedAdminSessionValue(configuredPassword);
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

  return verifyAdminSessionValue(sessionValue, configuredPassword);
}
